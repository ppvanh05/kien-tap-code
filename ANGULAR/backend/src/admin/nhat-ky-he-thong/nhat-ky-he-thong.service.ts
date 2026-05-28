import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type LogStatusInput = 'ThanhCong' | 'ThatBai' | 'Thành công' | 'Thất bại' | 'Thanh cong' | 'That bai';

type CreateLogInput = {
  MaKhachHang?: string;
  MaNhanVien?: string;
  LoaiThaoTac: string;
  NoiDungChiTiet: string;
  DiaChiIP?: string;
  MaVe?: string;
  TuyenXe?: string;
  TrangThai?: LogStatusInput;
  ThietBiTrinhDuyet?: string;
  TrangThaiCu?: string;
  TrangThaiMoi?: string;
  DuLieuThayDoi?: any;
};

@Injectable()
export class NhatKyHeThongService {
  constructor(private prisma: PrismaService) {}

  // ===== LẤY TOÀN BỘ NHẬT KÝ =====
  async getAll() {
    const list = await this.prisma.nHAT_KY_HE_THONG.findMany({
      orderBy: { ThoiGian: 'desc' },
      include: {
        KHACH_HANG: {
          select: {
            HoTenKhachHang: true,
            SoDienThoai: true,
          },
        },
        NHAN_VIEN: {
          select: {
            TenHienThi: true,
            SoDienThoai: true,
            LoaiTaiKhoan: true,
          },
        },
      },
    });

    return list.map(item => ({
      ...item,
      TrangThai: this.mapStatusToDisplay(item.TrangThai),
    }));
  }

  // ===== TỰ ĐỘNG GHI NHẬT KÝ =====
  async ghiLog(dto: CreateLogInput) {
    const loaiThaoTac = dto.LoaiThaoTac?.trim();
    const noiDungChiTiet = dto.NoiDungChiTiet?.trim();

    if (!loaiThaoTac || !noiDungChiTiet) {
      throw new BadRequestException('LoaiThaoTac va NoiDungChiTiet la bat buoc khi ghi nhat ky.');
    }

    const res = await this.prisma.nHAT_KY_HE_THONG.create({
      data: {
        MaNhatKy: this.generateLogId(),
        MaKhachHang: dto.MaKhachHang || null,
        MaNhanVien: dto.MaNhanVien || null,
        LoaiThaoTac: loaiThaoTac,
        ThoiGian: new Date(),
        DiaChiIP: dto.DiaChiIP || '127.0.0.1',
        NoiDungChiTiet: noiDungChiTiet,
        MaVe: dto.MaVe || null,
        TuyenXe: dto.TuyenXe || null,
        TrangThai: this.normalizeStatus(dto.TrangThai),
        ThietBiTrinhDuyet: dto.ThietBiTrinhDuyet || 'Web Client',
        TrangThaiCu: dto.TrangThaiCu || null,
        TrangThaiMoi: dto.TrangThaiMoi || null,
        DuLieuThayDoi: dto.DuLieuThayDoi === undefined || dto.DuLieuThayDoi === null
          ? Prisma.JsonNull
          : (dto.DuLieuThayDoi as Prisma.InputJsonValue),
      },
    });

    return {
      ...res,
      TrangThai: this.mapStatusToDisplay(res.TrangThai),
    };
  }

  private generateLogId(): string {
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `TXP_LOG_${Date.now()}_${random}`;
  }

  private normalizeStatus(status?: LogStatusInput): 'ThanhCong' | 'ThatBai' {
    const value = String(status || 'ThanhCong')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase();

    return value === 'thatbai' ? 'ThatBai' : 'ThanhCong';
  }

  private mapStatusToDisplay(status?: string | null): 'Thành công' | 'Thất bại' {
    return status === 'ThatBai' ? 'Thất bại' : 'Thành công';
  }
}
