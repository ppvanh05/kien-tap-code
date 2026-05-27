import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NhatKyHeThongService } from '../../admin/nhat-ky-he-thong/nhat-ky-he-thong.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ThanhToanService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) {}

  // Helper to generate transaction ID
  private generateTransactionId(): string {
    return `GD_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // ===== CREATE TRANSACTION =====
  async createTransaction(dto: { MaDonHang: string; PhuongThucThanhToan: string; SoTien: number }) {
    const { MaDonHang, PhuongThucThanhToan, SoTien } = dto;

    const order = await this.prisma.dON_HANG.findUnique({
      where: { MaDonHang },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với mã ${MaDonHang}`);
    }

    if (order.TrangThaiDonHang !== 'ChoThanhToan') {
      throw new BadRequestException(`Đơn hàng đã ở trạng thái ${order.TrangThaiDonHang}, không thể thực hiện thanh toán!`);
    }

    const maGiaoDich = this.generateTransactionId();

    const transaction = await this.prisma.tHANH_TOAN.create({
      data: {
        MaGiaoDich: maGiaoDich,
        MaDonHang,
        LoaiGiaoDich: 'ThanhToan',
        PhuongThucThanhToan,
        SoTien: new Prisma.Decimal(SoTien),
        ThoiGianGiaoDich: new Date(),
        TrangThaiGiaoDich: 'ChoThanhToan',
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

    if (transaction.TrangThaiGiaoDich === 'ThanhCong') {
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
        data: { TrangThaiGiaoDich: 'ThanhCong' },
      });

      // 2. Update Order status
      await tx.dON_HANG.update({
        where: { MaDonHang },
        data: { TrangThaiDonHang: 'ChoKhoiHanh' },
      });

      // 3. Update E-Tickets status
      await tx.vE_DIEN_TU.updateMany({
        where: { MaDonHang },
        data: { TrangThaiVe: 'ConHieuLuc' },
      });

      // 4. Lock seats permanently (status DaBan)
      const seatIds = order.VE_DIEN_TU.map(ve => ve.MaGheChuyen);
      await tx.gHE_CHUYEN_XE.updateMany({
        where: {
          MaGheChuyen: { in: seatIds },
        },
        data: {
          TrangThaiGhe: 'DaBan',
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
        data: { TrangThaiGiaoDich: 'ThatBai' },
      });

      // 2. Update Order status
      await tx.dON_HANG.update({
        where: { MaDonHang },
        data: { TrangThaiDonHang: 'DaHuy' },
      });

      // 3. Update E-Tickets status
      await tx.vE_DIEN_TU.updateMany({
        where: { MaDonHang },
        data: { TrangThaiVe: 'DaHuy' },
      });

      // 4. Release seats back to 'Trong'
      const seatIds = order.VE_DIEN_TU.map(ve => ve.MaGheChuyen);
      await tx.gHE_CHUYEN_XE.updateMany({
        where: {
          MaGheChuyen: { in: seatIds },
        },
        data: {
          TrangThaiGhe: 'Trong',
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
}
