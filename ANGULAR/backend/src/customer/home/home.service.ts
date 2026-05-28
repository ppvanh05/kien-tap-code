import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoaiChinhSachEnum, LoaiTinTucEnum, TrangThaiTinTucEnum, TrangThaiChinhSachEnum, TrangThaiTuyenXe } from '@prisma/client';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  private mapNewsToFrontend(tinTuc: any) {
    if (!tinTuc) return null;
    return {
      ...tinTuc,
      LoaiTinTuc: tinTuc.LoaiTinTuc === LoaiTinTucEnum.TinTucChung ? 'TinTuc' : tinTuc.LoaiTinTuc,
    };
  }

  // ===== GET NEWS =====
  async getNews() {
    const list = await this.prisma.tIN_TUC.findMany({
      where: {
        TrangThai: TrangThaiTinTucEnum.DaDang,
      },
      orderBy: { NgayDang: 'desc' },
    });
    return list.map(item => this.mapNewsToFrontend(item));
  }

  // ===== GET POLICIES =====
  async getPolicies(loai?: string) {
    const whereClause: any = {
      TrangThai: TrangThaiChinhSachEnum.DangApDung,
    };

    if (loai) {
      whereClause.LoaiChinhSach = loai as LoaiChinhSachEnum;
    }

    return this.prisma.cHINH_SACH.findMany({
      where: whereClause,
      orderBy: { NgayApDung: 'desc' },
    });
  }

  // ===== GET ACTIVE ROUTES =====
  async getActiveRoutes() {
    return this.prisma.tUYEN_XE.findMany({
      where: {
        TrangThaiTuyenXe: TrangThaiTuyenXe.DangHoatDong,
        TrangThaiTuyenXe: 'DangHoatDong',
      },
      orderBy: { TenTuyenXe: 'asc' },
    });
  }
}
