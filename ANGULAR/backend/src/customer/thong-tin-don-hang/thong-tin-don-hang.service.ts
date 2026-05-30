import { Injectable, OnModuleInit, OnModuleDestroy, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NhatKyHeThongService } from '../../admin/nhat-ky-he-thong/nhat-ky-he-thong.service';
import { Prisma, TrangThaiGhe, TrangThaiVe, PhuongThucThanhToan, TrangThaiThanhToan } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

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

  private mapPhuongThucThanhToan(method: string): any {
    if (!method) return 'VietQR';
    const m = method.toLowerCase();
    if (m.includes('vietqr') || m.includes('chuyenkhoan') || m.includes('chuyển khoản')) return 'VietQR';
    if (m.includes('momo')) return 'MoMo';
    if (m.includes('vnpay')) return 'VNPay';
    if (m.includes('zalopay')) return 'ZaloPay';
    if (m.includes('atm') || m.includes('nội địa')) return 'ATM_noi_dia';
    if (m.includes('visa') || m.includes('master') || m.includes('jcb') || m.includes('card') || m.includes('thẻ quốc tế')) return 'Visa_Master_JCB';
    if (m.includes('tiền mặt') || m.includes('tienmat') || m.includes('cash')) return 'TienMat';
    return 'VietQR';
  }

  // ===== AUTOMATIC SEAT RELEASE =====
  async releaseExpiredHeldSeats() {
    try {
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      const expiredHeldSeats = await this.prisma.gHE_CHUYEN_XE.findMany({
        where: {
          TrangThaiGhe: TrangThaiGhe.GiuCho,
          ThoiGianCapNhatTrangThai: { lt: fifteenMinsAgo },
          VE_DIEN_TU: {
            none: {
              DON_HANG: {
                TrangThaiDonHang: { in: [TrangThaiVe.ChoKhoiHanh, TrangThaiVe.DaHoanThanh] }
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
            TrangThaiGhe: TrangThaiGhe.Trong,
            ThoiGianCapNhatTrangThai: new Date(),
          }
        });

        // Also cancel the orders associated with these seats if they are still unpaid
        const ordersToCancel = await this.prisma.dON_HANG.findMany({
          where: {
            TrangThaiDonHang: TrangThaiVe.ChoThanhToan,
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
            data: { TrangThaiDonHang: TrangThaiVe.DaHuy }
          });

          await this.prisma.vE_DIEN_TU.updateMany({
            where: { MaDonHang: order.MaDonHang },
            data: { TrangThaiVe: TrangThaiVe.DaHuy }
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

    const seats = await this.prisma.gHE_CHUYEN_XE.findMany({
      where: {
        MaLichTrinh: MaLichTrinh,
        MaGheChuyen: { in: DanhSachMaGheChuyen },
      },
    });

    if (seats.length !== DanhSachMaGheChuyen.length) {
      throw new NotFoundException('Một số ghế được chọn không tồn tại trong chuyến xe này!');
    }

    for (const seat of seats) {
      const isHeld = seat.TrangThaiGhe === TrangThaiGhe.GiuCho && seat.ThoiGianCapNhatTrangThai >= fifteenMinsAgo;
      const isSold = seat.TrangThaiGhe === TrangThaiGhe.DaBan;

      if (isHeld || isSold) {
        throw new BadRequestException(`Ghế ${seat.MaGheChuyen.split('_').pop() || seat.MaGheChuyen} đã có người giữ hoặc đã được bán!`);
      }
    }

    await this.prisma.gHE_CHUYEN_XE.updateMany({
      where: {
        MaGheChuyen: { in: DanhSachMaGheChuyen },
      },
      data: {
        TrangThaiGhe: TrangThaiGhe.GiuCho,
        ThoiGianCapNhatTrangThai: new Date(),
      },
    });

    return {
      success: true,
      message: 'Giữ ghế tạm thời thành công trong 15 phút!',
    };
  }

  private async generateNextCustomerId(): Promise<string> {
    const list = await this.prisma.kHACH_HANG.findMany({
      select: { MaKhachHang: true },
    });

    let maxNum = 0;
    list.forEach(kh => {
      const match = kh.MaKhachHang.match(/KH(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    });

    return `KH${String(maxNum + 1).padStart(3, '0')}`;
  }

  private async generateNextOrderCode(): Promise<string> {
    const list = await this.prisma.dON_HANG.findMany({
      select: { MaDonHang: true },
    });
    let maxNum = 10000000; // starts before DH10000001
    list.forEach(item => {
      const match = item.MaDonHang.match(/DH(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    });
    return `DH${maxNum + 1}`;
  }

  private isFallbackPickupId(maDiem: string, maLichTrinh: string): boolean {
    return maDiem === `PICKUP_${maLichTrinh}`;
  }

  private isFallbackDropoffId(maDiem: string, maLichTrinh: string): boolean {
    return maDiem === `DROPOFF_${maLichTrinh}`;
  }

  private normalizePointName(value?: string | null): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }

  private async resolveStationPoint(params: {
    maDiem: string;
    maLichTrinh: string;
    schedule: {
      MaTuyenXe: string;
      MaNVDieuPhoi: string;
      TUYEN_XE: { DiemKhoiHanh: string; DiemDen: string; MaNVDieuPhoi: string };
    };
    isFallback: boolean;
    routePointName: string;
    fallbackPrefix: 'PICKUP' | 'DROPOFF';
  }): Promise<{ maDiem: string; tenDiem: string }> {
    const { maDiem, maLichTrinh, schedule, isFallback, routePointName, fallbackPrefix } = params;

    if (!isFallback) {
      const station = await this.prisma.dIEM_DON_TRA_DUNG.findUnique({
        where: { MaDiem: maDiem },
      });
      if (!station) {
        throw new NotFoundException('Trạm đón hoặc trạm trả không hợp lệ!');
      }
      return { maDiem: station.MaDiem, tenDiem: station.TenDiem };
    }

    const expectedFallbackId = `${fallbackPrefix}_${maLichTrinh}`;
    if (maDiem !== expectedFallbackId) {
      throw new NotFoundException('Trạm đón hoặc trạm trả không hợp lệ!');
    }

    const routePoints = await this.prisma.dIEM_DON_TRA_DUNG.findMany({
      where: { MaTuyenXe: schedule.MaTuyenXe },
    });
    const normalizedRoutePoint = this.normalizePointName(routePointName);
    const matched = routePoints.find((point) => {
      const normalizedName = this.normalizePointName(point.TenDiem);
      return (
        normalizedName === normalizedRoutePoint ||
        normalizedName.includes(normalizedRoutePoint) ||
        normalizedRoutePoint.includes(normalizedName)
      );
    });

    if (matched) {
      return { maDiem: matched.MaDiem, tenDiem: matched.TenDiem };
    }

    const maNVDieuPhoi = schedule.TUYEN_XE.MaNVDieuPhoi || schedule.MaNVDieuPhoi;
    const gioCoMat = new Date();
    gioCoMat.setUTCHours(0, 0, 0, 0);

    await this.prisma.dIEM_DON_TRA_DUNG.upsert({
      where: { MaDiem: expectedFallbackId },
      update: {
        MaTuyenXe: schedule.MaTuyenXe,
        TenDiem: routePointName,
        ThanhPho: routePointName,
        Tinh: routePointName,
        DiaChi: routePointName,
        TrangThaiDiem: 'DangHoatDong',
        MaNVDieuPhoi: maNVDieuPhoi,
      },
      create: {
        MaDiem: expectedFallbackId,
        MaTuyenXe: schedule.MaTuyenXe,
        TenDiem: routePointName,
        ThanhPho: routePointName,
        Tinh: routePointName,
        DiaChi: routePointName,
        LoaiDiem: 'DiemDonTra',
        TrangThaiDiem: 'DangHoatDong',
        MaNVDieuPhoi: maNVDieuPhoi,
        GioCanCoMat: gioCoMat,
        ThoiGianCoMatTruoc: 15,
      },
    });

    return { maDiem: expectedFallbackId, tenDiem: routePointName };
  }

  // ===== CREATE ORDER WITH E-TICKETS (MARKED PAID AND RECORDED DIRECTLY ON CONFIRMATION) =====
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

    let finalMaKhachHang = MaKhachHang;

    let customer = await this.prisma.kHACH_HANG.findUnique({
      where: { MaKhachHang },
    });

    if (!customer) {
      // Try to find customer by phone number SdtNguoiDi to avoid duplicating if guest already ordered before
      const phoneClean = SdtNguoiDi.trim();
      const existingByPhone = await this.prisma.kHACH_HANG.findFirst({
        where: { SoDienThoai: phoneClean },
      });

      if (existingByPhone) {
        customer = existingByPhone;
        finalMaKhachHang = existingByPhone.MaKhachHang;
      } else {
        // Auto-create a new guest customer record
        const nextId = await this.generateNextCustomerId();
        customer = await this.prisma.kHACH_HANG.create({
          data: {
            MaKhachHang: nextId,
            HoTenKhachHang: HoTenNguoiDi || 'Khách vãng lai',
            SoDienThoai: phoneClean,
            Email: EmailNguoiDi || null,
            MatKhau: 'GUEST_NO_PASSWORD',
            GioiTinh: 'Nam',
            TrangThaiTaiKhoan: 'HoatDong',
            NgayDangKy: new Date(),
          },
        });
        finalMaKhachHang = nextId;
      }
    }

    // Verify schedule exists
    const schedule = await this.prisma.lICH_TRINH.findUnique({
      where: { MaLichTrinh },
      include: { PHUONG_TIEN: true, TUYEN_XE: true },
    });
    if (!schedule) {
      throw new NotFoundException(`Không tìm thấy chuyến xe với mã ${MaLichTrinh}`);
    }

    const isFallbackPickup = this.isFallbackPickupId(MaDiemDon, MaLichTrinh);
    const isFallbackDropoff = this.isFallbackDropoffId(MaDiemTra, MaLichTrinh);

    console.log('[createOrder] MaDiemDon/MaDiemTra received:', {
      MaDiemDon,
      MaDiemTra,
    });
    console.log('[createOrder] isFallbackPickup/isFallbackDropoff:', {
      isFallbackPickup,
      isFallbackDropoff,
    });

    const pickupStation = await this.resolveStationPoint({
      maDiem: MaDiemDon,
      maLichTrinh: MaLichTrinh,
      schedule,
      isFallback: isFallbackPickup,
      routePointName: schedule.TUYEN_XE.DiemKhoiHanh,
      fallbackPrefix: 'PICKUP',
    });
    const dropoffStation = await this.resolveStationPoint({
      maDiem: MaDiemTra,
      maLichTrinh: MaLichTrinh,
      schedule,
      isFallback: isFallbackDropoff,
      routePointName: schedule.TUYEN_XE.DiemDen,
      fallbackPrefix: 'DROPOFF',
    });

    const resolvedMaDiemDon = pickupStation.maDiem;
    const resolvedMaDiemTra = dropoffStation.maDiem;

    console.log('[createOrder] resolved pickup/dropoff:', {
      resolvedMaDiemDon,
      resolvedMaDiemTra,
      pickupName: pickupStation.tenDiem,
      dropoffName: dropoffStation.tenDiem,
    });

    const seats = await this.prisma.gHE_CHUYEN_XE.findMany({
      where: {
        MaLichTrinh,
        MaGheChuyen: { in: DanhSachMaGheChuyen },
      },
      include: { GHE: true },
    });

    if (seats.length !== DanhSachMaGheChuyen.length) {
      throw new NotFoundException('Một số ghế được chọn không tồn tại trong chuyến xe này!');
    }

    for (const seat of seats) {
      if (seat.TrangThaiGhe === TrangThaiGhe.DaBan) {
        throw new BadRequestException(`Ghế đã được đặt bởi người khác!`);
      }
    }

    let totalSeatPrice = 0;
    seats.forEach(s => {
      totalSeatPrice += s.GiaVe.toNumber();
    });

    const insurancePerTicket = 0;
    const totalInsurance = 0;
    const finalTotal = totalSeatPrice + totalInsurance;

    const maDonHang = await this.generateNextOrderCode();

    // Query tickets to find the start sequential number for new tickets
    const listTickets = await this.prisma.vE_DIEN_TU.findMany({
      select: { MaVe: true },
    });
    let maxTicketNum = 100000; // starts before VE100001
    listTickets.forEach(item => {
      const match = item.MaVe.match(/^VE(\d{6})$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxTicketNum) {
          maxTicketNum = num;
        }
      }
    });
    let nextTicketNum = maxTicketNum + 1;

    // Use Prisma transaction to create order, create tickets, update seats and create payment
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create order (State: ChoKhoiHanh since it's paid)
      const order = await tx.dON_HANG.create({
        data: {
          MaDonHang: maDonHang,
          MaKhachHang: finalMaKhachHang,
          HoTenNguoiDi,
          SdtNguoiDi,
          EmailNguoiDi: EmailNguoiDi || null,
          ThoiGianDat: new Date(),
          SoLuongVeDaDat: DanhSachMaGheChuyen.length,
          TienBaoHiem: new Prisma.Decimal(totalInsurance),
          TongGiaVe: new Prisma.Decimal(finalTotal),
          PhuongThucThanhToan: this.mapPhuongThucThanhToan(PhuongThucThanhToan),
          TrangThaiDonHang: TrangThaiVe.ChoKhoiHanh,
        },
      });

      // 2. Create tickets and update seat status to DaBan
      const tickets = [];
      for (const seat of seats) {
        const maVe = `VE${String(nextTicketNum).padStart(6, '0')}`;
        nextTicketNum++;
        const soGhe = (seat as any).GHE?.SoGhe || seat.MaGheChuyen.split('_').pop() || seat.MaGhe;
        const ticket = await tx.vE_DIEN_TU.create({
            data: {
            MaVe: maVe,
            GiaVe: seat.GiaVe,
            TrangThaiVe: TrangThaiVe.ChoKhoiHanh,
            SoLanDaSua: 0,
            ThoiGianXuatVe: new Date(),
            MaQRVe: `QR_${maVe}_${MaLichTrinh}_${soGhe}`,
            MaDonHang: maDonHang,
            MaLichTrinh,
            MaXe: schedule.MaXe,
            MaGheChuyen: seat.MaGheChuyen,
            MaDiemDon: resolvedMaDiemDon,
            MaDiemTra: resolvedMaDiemTra,
          },
        });
        tickets.push(ticket);

        await tx.gHE_CHUYEN_XE.update({
          where: { MaGheChuyen: seat.MaGheChuyen },
          data: {
            TrangThaiGhe: TrangThaiGhe.DaBan,
            ThoiGianCapNhatTrangThai: new Date(),
          },
        });
      }

      // 3. Create payment record (ThanhToan)
      const maGiaoDich = await this.prisma.generateNextId('tHANH_TOAN', 'MaGiaoDich', 'GD_TT_', 6, 100001);
      const payment = await tx.tHANH_TOAN.create({
        data: {
          MaGiaoDich: maGiaoDich,
          MaDonHang: maDonHang,
          LoaiGiaoDich: 'ThanhToan',
          PhuongThucThanhToan: this.mapPhuongThucThanhToan(PhuongThucThanhToan),
          SoTien: new Decimal(finalTotal),
          ThoiGianGiaoDich: new Date(),
          TrangThaiGiaoDich: TrangThaiThanhToan.DaThanhToan,
          LichSuHoanTien: '',
        },
      });

      return { order, tickets, payment };
    });

    await this.nhatKyService.ghiLog({
      MaKhachHang: finalMaKhachHang,
      LoaiThaoTac: 'Đặt và thanh toán vé',
      NoiDungChiTiet: `Tạo mới đơn hàng ${maDonHang} gồm ${DanhSachMaGheChuyen.length} vé và ghi nhận thanh toán thành công.`,
      TrangThai: 'Thành công',
    });

    return result;
  }

  // 1. Get detailed schedule and available seats
  async getTripDetails(scheduleId: string) {
    const schedule = await this.prisma.lICH_TRINH.findUnique({
      where: { MaLichTrinh: scheduleId },
      include: {
        TUYEN_XE: true,
        PHUONG_TIEN: true,
        GHE_CHUYEN_XE: {
          include: {
            GHE: true,
            VE_DIEN_TU: true, // Thêm include VE_DIEN_TU
          },
          orderBy: {
            GHE: {
              SoGhe: 'asc',
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Không tìm thấy lịch trình mã ${scheduleId}`);
    }

    return schedule;
  }

  // 4. Get active orders for a customer
  async getActiveOrders(customerId: string) {
    return this.prisma.dON_HANG.findMany({
      where: {
        MaKhachHang: customerId,
        TrangThaiDonHang: {
          in: [TrangThaiVe.ChoThanhToan, TrangThaiVe.ChoKhoiHanh, TrangThaiVe.DaHoanThanh],
        },
      },
      include: {
        VE_DIEN_TU: {
          include: {
            LICH_TRINH: {
              include: {
                TUYEN_XE: true,
              },
            },
          },
        },
      },
      orderBy: {
        ThoiGianDat: 'desc',
      },
    });
  }

  // 5. Release seats
  async releaseSeats(seatIds: string[]) {
    return this.prisma.gHE_CHUYEN_XE.updateMany({
      where: {
        MaGheChuyen: { in: seatIds },
        TrangThaiGhe: TrangThaiGhe.GiuCho,
      },
      data: {
        TrangThaiGhe: TrangThaiGhe.Trong,
        ThoiGianCapNhatTrangThai: new Date(),
      },
    });
  }

  // 6. Cancel Order
  async cancelOrder(orderId: string) {
    const order = await this.prisma.dON_HANG.findUnique({
      where: { MaDonHang: orderId },
      include: { VE_DIEN_TU: true },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng mã ${orderId}`);
    }

    if (order.TrangThaiDonHang === TrangThaiVe.ChoThanhToan) {
      return this.prisma.$transaction(async (tx) => {
        await tx.dON_HANG.update({
          where: { MaDonHang: orderId },
          data: { TrangThaiDonHang: TrangThaiVe.DaHuy },
        });

        await tx.vE_DIEN_TU.updateMany({
          where: { MaDonHang: orderId },
          data: { TrangThaiVe: TrangThaiVe.DaHuy },
        });

        const seatIds = order.VE_DIEN_TU.map(v => v.MaGheChuyen);
        await tx.gHE_CHUYEN_XE.updateMany({
          where: { MaGheChuyen: { in: seatIds } },
          data: {
            TrangThaiGhe: TrangThaiGhe.Trong,
            ThoiGianCapNhatTrangThai: new Date(),
          },
        });

        return { success: true };
      });
    }

    throw new BadRequestException('Chỉ có thể hủy đơn hàng đang ở trạng thái Chờ thanh toán.');
  }
}
