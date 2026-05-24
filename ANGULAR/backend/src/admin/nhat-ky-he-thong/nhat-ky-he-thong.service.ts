import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NhatKyHeThongService {
  constructor(private prisma: PrismaService) {}

  // ===== LẤY TOÀN BỘ NHẬT KÝ =====
  async getAll() {
    return this.prisma.nHAT_KY_HE_THONG.findMany({
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
  }

  // ===== TỰ ĐỘNG GHI NHẬT KÝ =====
  async ghiLog(dto: {
    MaKhachHang?: string;
    MaNhanVien?: string;
    LoaiThaoTac: string;
    NoiDungChiTiet: string;
    DiaChiIP?: string;
    MaVe?: string;
    TuyenXe?: string;
    TrangThai?: 'Thành công' | 'Thất bại';
    ThietBiTrinhDuyet?: string;
    TrangThaiCu?: string;
    TrangThaiMoi?: string;
    DuLieuThayDoi?: any;
  }) {
    // Tự động phát sinh mã nhật ký dạng TXP_LOGxxxx
    const listLog = await this.prisma.nHAT_KY_HE_THONG.findMany({
      select: { MaNhatKy: true },
    });

    let maxIdNumber = 100000;
    listLog.forEach(log => {
      const match = log.MaNhatKy.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxIdNumber) {
          maxIdNumber = num;
        }
      }
    });

    const newId = `TXP_LOG${maxIdNumber + 1}`;

    return this.prisma.nHAT_KY_HE_THONG.create({
      data: {
        MaNhatKy: newId,
        MaKhachHang: dto.MaKhachHang || null,
        MaNhanVien: dto.MaNhanVien || null,
        LoaiThaoTac: dto.LoaiThaoTac,
        ThoiGian: new Date(),
        DiaChiIP: dto.DiaChiIP || '127.0.0.1',
        NoiDungChiTiet: dto.NoiDungChiTiet,
        MaVe: dto.MaVe || null,
        TuyenXe: dto.TuyenXe || null,
        TrangThai: dto.TrangThai === 'Thất bại' ? 'ThatBai' : 'ThanhCong',
        ThietBiTrinhDuyet: dto.ThietBiTrinhDuyet || 'Web Client',
        TrangThaiCu: dto.TrangThaiCu || null,
        TrangThaiMoi: dto.TrangThaiMoi || null,
        DuLieuThayDoi: dto.DuLieuThayDoi ? (dto.DuLieuThayDoi as Prisma.InputJsonValue) : Prisma.DbNull,
      },
    });
  }
}
