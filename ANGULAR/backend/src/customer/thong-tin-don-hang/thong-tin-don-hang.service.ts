import { Injectable, OnModuleInit, OnModuleDestroy, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NhatKyHeThongService } from '../../admin/nhat-ky-he-thong/nhat-ky-he-thong.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ThongTinDonHangService implements OnModuleInit, OnModuleDestroy {
  private cleanupInterval: any;

  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) {}

  onModuleInit() {
    // Start automated task to release expired held seats every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.releaseExpiredHeldSeats();
    }, 60000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  // Helper to generate random order codes like DHxxxxxx (8 chars)
  private generateOrderCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'DH';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Helper to generate ticket ID
  private generateTicketId(): string {
    return `VE${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // ===== AUTOMATIC SEAT RELEASE =====
  async releaseExpiredHeldSeats() {
    try {
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      // Find GHE_CHUYEN_XE that are held but have expired
      // Note: We only release seats that are NOT associated with a paid order.
      // If a seat is in 'GiuCho' state and the order is still in 'ChoThanhToan', we release them.
      // If no order exists at all (just clicked hold), we release them.
      
      const expiredHeldSeats = await this.prisma.gHE_CHUYEN_XE.findMany({
        where: {
          TrangThaiGhe: 'GiuCho',
          ThoiGianCapNhatTrangThai: { lt: fifteenMinsAgo },
          // Ensure it's not bound to a paid/confirmed order
          VE_DIEN_TU: {
            none: {
              DON_HANG: {
                TrangThaiDonHang: { in: ['ChoKhoiHanh', 'DaThanhToan', 'DaHoanThanh'] }
              }
            }
          }
        }
      });

      if (expiredHeldSeats.length > 0) {
        const ids = expiredHeldSeats.map(s => s.MaGheChuyen);
        
        await this.prisma.gHE_CHUYEN_XE.updateMany({
          where: {
            MaGheChuyen: { in: ids }
          },
          data: {
            TrangThaiGhe: 'Trong',
            ThoiGianCapNhatTrangThai: new Date(),
          }
        });

        // Also cancel the orders associated with these seats if they are still unpaid
        const ordersToCancel = await this.prisma.dON_HANG.findMany({
          where: {
            TrangThaiDonHang: 'ChoThanhToan',
            VE_DIEN_TU: {
              some: {
                MaGheChuyen: { in: ids }
              }
            }
          }
        });

        for (const order of ordersToCancel) {
          await this.prisma.dON_HANG.update({
            where: { MaDonHang: order.MaDonHang },
            data: { TrangThaiDonHang: 'DaHuy' }
          });

          await this.prisma.vE_DIEN_TU.updateMany({
            where: { MaDonHang: order.MaDonHang },
            data: { TrangThaiVe: 'DaHuy' }
          });

          await this.nhatKyService.ghiLog({
            MaKhachHang: order.MaKhachHang,
            LoaiThaoTac: 'Huỷ đặt vé tự động',
            NoiDungChiTiet: `Hệ thống tự động hủy đơn hàng ${order.MaDonHang} do hết hạn 15 phút chưa thanh toán.`,
            TrangThai: 'Thành công',
          });
        }

        console.log(`[SEAT CLEANUP] Auto-released ${ids.length} expired seat holds.`);
      }
    } catch (e) {
      console.error('Error during auto-releasing seats:', e);
    }
  }

  // ===== HOLD SEATS (15 MINS) =====
  async holdSeats(dto: { MaLichTrinh: string; DanhSachMaGheChuyen: string[]; MaKhachHang?: string }) {
    const { MaLichTrinh, DanhSachMaGheChuyen } = dto;
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Query status of seats
    const seats = await this.prisma.gHE_CHUYEN_XE.findMany({
      where: {
        MaLichTrinh: MaLichTrinh,
        MaGheChuyen: { in: DanhSachMaGheChuyen },
      },
    });

    if (seats.length !== DanhSachMaGheChuyen.length) {
      throw new NotFoundException('Một số ghế được chọn không tồn tại trong chuyến xe này!');
    }

    // Check if any seat is already booked or active held
    for (const seat of seats) {
      const isHeld = seat.TrangThaiGhe === 'GiuCho' && seat.ThoiGianCapNhatTrangThai >= fifteenMinsAgo;
      const isSold = seat.TrangThaiGhe === 'DaBan';

      if (isHeld || isSold) {
        throw new BadRequestException(`Ghế ${seat.MaGheChuyen.split('_').pop() || seat.MaGheChuyen} đã có người giữ hoặc đã được bán!`);
      }
    }

    // Update status to GiuCho
    await this.prisma.gHE_CHUYEN_XE.updateMany({
      where: {
        MaGheChuyen: { in: DanhSachMaGheChuyen },
      },
      data: {
        TrangThaiGhe: 'GiuCho',
        ThoiGianCapNhatTrangThai: new Date(),
      },
    });

    return {
      success: true,
      message: 'Giữ ghế tạm thời thành công trong 15 phút!',
    };
  }

  // ===== CREATE ORDER WITH E-TICKETS =====
  async createOrder(dto: {
    MaKhachHang: string;
    MaLichTrinh: string;
    DanhSachMaGheChuyen: string[];
    HoTenNguoiDi: string;
    SdtNguoiDi: string;
    EmailNguoiDi?: string;
    MaDiemDon: string;
    MaDiemTra: string;
    PhuongThucThanhToan: string;
  }) {
    const {
      MaKhachHang,
      MaLichTrinh,
      DanhSachMaGheChuyen,
      HoTenNguoiDi,
      SdtNguoiDi,
      EmailNguoiDi,
      MaDiemDon,
      MaDiemTra,
      PhuongThucThanhToan,
    } = dto;

    // Verify customer exists
    const customer = await this.prisma.kHACH_HANG.findUnique({
      where: { MaKhachHang },
    });
    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng với mã ${MaKhachHang}`);
    }

    // Verify schedule exists
    const schedule = await this.prisma.lICH_TRINH.findUnique({
      where: { MaLichTrinh },
      include: { PHUONG_TIEN: true },
    });
    if (!schedule) {
      throw new NotFoundException(`Không tìm thấy chuyến xe với mã ${MaLichTrinh}`);
    }

    // Verify stations exist
    const pickupStation = await this.prisma.dIEM_DON_TRA_DUNG.findUnique({
      where: { MaDiem: MaDiemDon },
    });
    const dropoffStation = await this.prisma.dIEM_DON_TRA_DUNG.findUnique({
      where: { MaDiem: MaDiemTra },
    });
    if (!pickupStation || !dropoffStation) {
      throw new NotFoundException('Trạm đón hoặc trạm trả không hợp lệ!');
    }

    // Query seats to ensure availability and get their price
    const seats = await this.prisma.gHE_CHUYEN_XE.findMany({
      where: {
        MaLichTrinh,
        MaGheChuyen: { in: DanhSachMaGheChuyen },
      },
    });

    if (seats.length !== DanhSachMaGheChuyen.length) {
      throw new NotFoundException('Một số ghế được chọn không tồn tại trong chuyến xe này!');
    }

    // Check if any seat is sold (status DaBan)
    for (const seat of seats) {
      if (seat.TrangThaiGhe === 'DaBan') {
        throw new BadRequestException(`Ghế đã được đặt bởi người khác!`);
      }
    }

    // Compute prices
    let totalSeatPrice = 0;
    seats.forEach(s => {
      totalSeatPrice += s.GiaVe.toNumber();
    });

    const insurancePerTicket = 10000; // 10k VND per seat
    const totalInsurance = insurancePerTicket * DanhSachMaGheChuyen.length;
    const finalTotal = totalSeatPrice + totalInsurance;

    const maDonHang = this.generateOrderCode();

    // Use Prisma transaction to create order, create tickets, and update seats
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create order
      const order = await tx.dON_HANG.create({
        data: {
          MaDonHang: maDonHang,
          MaKhachHang,
          HoTenNguoiDi,
          SdtNguoiDi,
          EmailNguoiDi: EmailNguoiDi || null,
          ThoiGianDat: new Date(),
          SoLuongVeDaDat: DanhSachMaGheChuyen.length,
          TienBaoHiem: new Prisma.Decimal(totalInsurance),
          TongGiaVe: new Prisma.Decimal(finalTotal),
          PhuongThucThanhToan,
          TrangThaiDonHang: 'ChoThanhToan',
        },
      });

      // 2. Create tickets and update seat status
      const tickets = [];
      for (const seat of seats) {
        const maVe = this.generateTicketId();
        const ticket = await tx.vE_DIEN_TU.create({
          data: {
            MaVe: maVe,
            GiaVe: seat.GiaVe,
            TrangThaiVe: 'ChoThanhToan',
            SoLanDaSua: 0,
            ThoiGianXuatVe: new Date(),
            MaQRVe: `QR-${maVe}`,
            MaDonHang: maDonHang,
            MaLichTrinh,
            MaXe: schedule.MaXe,
            MaGheChuyen: seat.MaGheChuyen,
            MaDiemDon,
            MaDiemTra,
          },
        });
        tickets.push(ticket);

        // Update seat to hold status associated with this order creation
        await tx.gHE_CHUYEN_XE.update({
          where: { MaGheChuyen: seat.MaGheChuyen },
          data: {
            TrangThaiGhe: 'GiuCho',
            ThoiGianCapNhatTrangThai: new Date(),
          },
        });
      }

      return { order, tickets };
    });

    // Record system log
    await this.nhatKyService.ghiLog({
      MaKhachHang,
      LoaiThaoTac: 'Đặt vé',
      NoiDungChiTiet: `Tạo mới đơn hàng ${maDonHang} gồm ${DanhSachMaGheChuyen.length} vé. Trạng thái: Chờ thanh toán.`,
      TrangThai: 'Thành công',
    });

    return result;
  }
}
