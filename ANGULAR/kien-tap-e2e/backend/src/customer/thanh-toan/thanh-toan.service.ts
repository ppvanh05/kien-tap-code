import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NhatKyHeThongService } from '../../admin/nhat-ky-he-thong/nhat-ky-he-thong.service';
import { TrangThaiVe, TrangThaiThanhToan, TrangThaiGhe, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ThanhToanService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) {}


  // ===== CREATE TRANSACTION =====
  async createTransaction(dto: { MaDonHang: string; PhuongThucThanhToan: string; SoTien: number }) {
    const { MaDonHang, PhuongThucThanhToan, SoTien } = dto;

    const order = await this.prisma.dON_HANG.findUnique({
      where: { MaDonHang },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với mã ${MaDonHang}`);
    }

    if (order.TrangThaiDonHang !== TrangThaiVe.ChoThanhToan) {
      throw new BadRequestException(`Đơn hàng đã ở trạng thái ${order.TrangThaiDonHang}, không thể thực hiện thanh toán!`);
    }

    const maGiaoDich = await this.prisma.generateNextId('tHANH_TOAN', 'MaGiaoDich', 'GD_TT_', 6, 100001);

    const transaction = await this.prisma.tHANH_TOAN.create({
      data: {
        MaGiaoDich: maGiaoDich,
        MaDonHang,
        LoaiGiaoDich: 'ThanhToan',
        PhuongThucThanhToan: PhuongThucThanhToan as any,
        SoTien: new Prisma.Decimal(SoTien),
        ThoiGianGiaoDich: new Date(),
        TrangThaiGiaoDich: TrangThaiThanhToan.ChoThanhToan,
        LichSuHoanTien: '',
      },
    });

    return transaction;
  }

  // ===== CALLBACK SUCCESS (CONFIRM + LOCK SEATS) =====
  async callbackSuccess(dto: { MaDonHang: string; MaGiaoDich: string }) {
    const { MaDonHang, MaGiaoDich } = dto;

    const transaction = await this.prisma.tHANH_TOAN.findUnique({
      where: { MaGiaoDich },
    });

    if (!transaction) {
      throw new NotFoundException(`Không tìm thấy giao dịch với mã ${MaGiaoDich}`);
    }

    if (transaction.TrangThaiGiaoDich === TrangThaiThanhToan.DaThanhToan) {
      return { success: true, message: 'Giao dịch đã được xử lý thành công từ trước.' };
    }

    const order = await this.prisma.dON_HANG.findUnique({
      where: { MaDonHang },
      include: {
        VE_DIEN_TU: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với mã ${MaDonHang}`);
    }

    // Run transaction updates
    await this.prisma.$transaction(async (tx) => {
      // 1. Update Transaction status
      await tx.tHANH_TOAN.update({
        where: { MaGiaoDich },
        data: { TrangThaiGiaoDich: TrangThaiThanhToan.DaThanhToan },
      });

      // 2. Update Order status
      await tx.dON_HANG.update({
        where: { MaDonHang },
        data: { TrangThaiDonHang: TrangThaiVe.ChoKhoiHanh },
      });

      // 3. Update E-Tickets status
      await tx.vE_DIEN_TU.updateMany({
        where: { MaDonHang },
        data: { TrangThaiVe: TrangThaiVe.ChoKhoiHanh },
      });

      // 4. Lock seats permanently (status DaBan)
      const seatIds = order.VE_DIEN_TU.map(ve => ve.MaGheChuyen);
      await tx.gHE_CHUYEN_XE.updateMany({
        where: {
          MaGheChuyen: { in: seatIds },
        },
        data: {
          TrangThaiGhe: TrangThaiGhe.DaBan,
          ThoiGianCapNhatTrangThai: new Date(),
        },
      });
    });

    // Record system log
    await this.nhatKyService.ghiLog({
      MaKhachHang: order.MaKhachHang,
      LoaiThaoTac: 'Thanh toán',
      NoiDungChiTiet: `Thanh toán thành công đơn hàng ${MaDonHang}. Giao dịch: ${MaGiaoDich}. Vé đã được xuất.`,
      TrangThai: 'Thành công',
    });

    return {
      success: true,
      message: 'Xác nhận đơn hàng và thanh toán thành công!',
    };
  }

  // ===== CALLBACK FAILURE (CANCEL + RELEASE SEATS) =====
  async callbackFailure(dto: { MaDonHang: string; MaGiaoDich: string }) {
    const { MaDonHang, MaGiaoDich } = dto;

    const transaction = await this.prisma.tHANH_TOAN.findUnique({
      where: { MaGiaoDich },
    });

    if (!transaction) {
      throw new NotFoundException(`Không tìm thấy giao dịch với mã ${MaGiaoDich}`);
    }

    const order = await this.prisma.dON_HANG.findUnique({
      where: { MaDonHang },
      include: {
        VE_DIEN_TU: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với mã ${MaDonHang}`);
    }

    // Run transaction updates
    await this.prisma.$transaction(async (tx) => {
      // 1. Update Transaction status
      await tx.tHANH_TOAN.update({
        where: { MaGiaoDich },
        data: { TrangThaiGiaoDich: TrangThaiThanhToan.DaHuy },
      });

      // 2. Update Order status
      await tx.dON_HANG.update({
        where: { MaDonHang },
        data: { TrangThaiDonHang: TrangThaiVe.DaHuy },
      });

      // 3. Update E-Tickets status
      await tx.vE_DIEN_TU.updateMany({
        where: { MaDonHang },
        data: { TrangThaiVe: TrangThaiVe.DaHuy },
      });

      // 4. Release seats back to 'Trong'
      const seatIds = order.VE_DIEN_TU.map(ve => ve.MaGheChuyen);
      await tx.gHE_CHUYEN_XE.updateMany({
        where: {
          MaGheChuyen: { in: seatIds },
        },
        data: {
          TrangThaiGhe: TrangThaiGhe.Trong,
          ThoiGianCapNhatTrangThai: new Date(),
        },
      });
    });

    // Record system log
    await this.nhatKyService.ghiLog({
      MaKhachHang: order.MaKhachHang,
      LoaiThaoTac: 'Thanh toán',
      NoiDungChiTiet: `Thanh toán thất bại đơn hàng ${MaDonHang}. Giao dịch: ${MaGiaoDich}. Đơn hàng đã hủy và giải phóng ghế.`,
      TrangThai: 'Thất bại',
    });

    return {
      success: true,
      message: 'Hủy đơn hàng và giải phóng ghế thành công do thanh toán thất bại!',
    };
  }

  // 1. Verify and Update Payment status
  async verifyPayment(dto: { orderId: string; paymentMethod: string; transactionId: string }) {
    const order = await this.prisma.dON_HANG.findUnique({
      where: { MaDonHang: dto.orderId },
      include: {
        VE_DIEN_TU: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng mã ${dto.orderId}`);
    }

    if (order.TrangThaiDonHang !== TrangThaiVe.ChoThanhToan) {
      throw new BadRequestException('Đơn hàng này đã được xử lý thanh toán hoặc đã bị hủy.');
    }

    // Process Transaction in DB
    const result = await this.prisma.$transaction(async (tx) => {
      // Create payment record
      const maGiaoDich = await this.prisma.generateNextId('tHANH_TOAN', 'MaGiaoDich', 'GD_TT_', 6, 100001);
      const payment = await tx.tHANH_TOAN.create({
        data: {
          MaGiaoDich: maGiaoDich,
          MaDonHang: dto.orderId,
          LoaiGiaoDich: 'ThanhToan',
          PhuongThucThanhToan: dto.paymentMethod,
          SoTien: order.TongGiaVe,
          ThoiGianGiaoDich: new Date(),
          TrangThaiGiaoDich: TrangThaiThanhToan.DaThanhToan,
          LichSuHoanTien: '',
        },
      });

      // Update Order status
      await tx.dON_HANG.update({
        where: { MaDonHang: dto.orderId },
        data: {
          TrangThaiDonHang: TrangThaiVe.ChoKhoiHanh,
        },
      });

      // Update all tickets and seats in the order
      for (const ticket of order.VE_DIEN_TU) {
        // Update Ticket status
        await tx.vE_DIEN_TU.update({
          where: { MaVe: ticket.MaVe },
          data: {
            TrangThaiVe: TrangThaiVe.ChoKhoiHanh,
          },
        });

        // Update Seat status to SOLD
        await tx.gHE_CHUYEN_XE.update({
          where: { MaGheChuyen: ticket.MaGheChuyen },
          data: {
            TrangThaiGhe: TrangThaiGhe.DaBan,
            ThoiGianCapNhatTrangThai: new Date(),
          },
        });
      }

      return payment;
    });

    // Record system log
    await this.nhatKyService.ghiLog({
      MaKhachHang: order.MaKhachHang,
      LoaiThaoTac: 'Thanh toán',
      NoiDungChiTiet: `Khách hàng đã thanh toán thành công đơn hàng ${dto.orderId} qua ${dto.paymentMethod}.`,
      TrangThai: 'Thành công',
    });

    return result;
  }
}
