import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TrangThaiTinTucEnum, LoaiTinTucEnum } from '@prisma/client';
import { NhatKyHeThongService } from '../nhat-ky-he-thong/nhat-ky-he-thong.service';

@Injectable()
export class TinTucService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) { }

  // ===== LẤY TẤT CẢ TIN TỨC =====
  async getAll() {
    return this.prisma.tIN_TUC.findMany({
      orderBy: { NgayDang: 'desc' },
    });
  }

  // ===== LẤY THEO ID =====
  async getById(id: string) {
    return this.prisma.tIN_TUC.findUnique({
      where: { MaTinTuc: id },
    });
  }

  // ===== LẤY THEO TRẠNG THÁI =====
  async getByTrangThai(trangThai: string) {
    return this.prisma.tIN_TUC.findMany({
      where: { TrangThai: trangThai as TrangThaiTinTucEnum },
      orderBy: { NgayDang: 'desc' },
    });
  }

  // ===== LẤY THEO LOẠI TIN TỨC =====
  async getByLoai(loaiTinTuc: string) {
    return this.prisma.tIN_TUC.findMany({
      where: { LoaiTinTuc: loaiTinTuc as LoaiTinTucEnum },
      orderBy: { NgayDang: 'desc' },
    });
  }

  // ===== TẠO MỚI =====
  async create(dto: Prisma.TIN_TUCUncheckedCreateInput) {
    const res = await this.prisma.tIN_TUC.create({
      data: {
        MaTinTuc: dto.MaTinTuc,
        TieuDe: dto.TieuDe,
        AnhBia: dto.AnhBia ?? null,
        LoaiTinTuc: dto.LoaiTinTuc,
        MoTaNgan: dto.MoTaNgan ?? null,
        NoiDungChiTiet: dto.NoiDungChiTiet ?? null,
        NgayDang: dto.NgayDang ? new Date(dto.NgayDang as any) : null,
        TrangThai: dto.TrangThai,
        MaQuanTriVien: dto.MaQuanTriVien ?? null,
      },
    });

    await this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý tin tức',
      NoiDungChiTiet: `Đăng bài viết tin tức mới: ${res.TieuDe} (Mã: ${res.MaTinTuc})`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: [
        { truong: 'MaTinTuc', giaTriCu: null, giaTriMoi: res.MaTinTuc },
        { truong: 'TieuDe', giaTriCu: null, giaTriMoi: res.TieuDe },
        { truong: 'TrangThai', giaTriCu: null, giaTriMoi: res.TrangThai },
      ],
    });

    return res;
  }

  // ===== CẬP NHẬT =====
  async update(id: string, dto: Prisma.TIN_TUCUncheckedUpdateInput) {
    const original = await this.getById(id);
    const data: any = { ...dto };
    if (dto.NgayDang) {
      data.NgayDang = new Date(dto.NgayDang as any);
    }
    if (dto.NgayGioHenGio) {
      data.NgayGioHenGio = new Date(dto.NgayGioHenGio as any);
    }
    const res = await this.prisma.tIN_TUC.update({
      where: { MaTinTuc: id },
      data,
    });

    const changes: any[] = [];
    if (dto.TieuDe && dto.TieuDe !== original?.TieuDe) {
      changes.push({ truong: 'TieuDe', giaTriCu: original?.TieuDe || '', giaTriMoi: dto.TieuDe as string });
    }
    if (dto.LoaiTinTuc && dto.LoaiTinTuc !== original?.LoaiTinTuc) {
      changes.push({ truong: 'LoaiTinTuc', giaTriCu: original?.LoaiTinTuc || '', giaTriMoi: dto.LoaiTinTuc as string });
    }
    if (dto.TrangThai && dto.TrangThai !== original?.TrangThai) {
      changes.push({ truong: 'TrangThai', giaTriCu: original?.TrangThai || '', giaTriMoi: dto.TrangThai as string });
    }

    await this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý tin tức',
      NoiDungChiTiet: `Cập nhật bài viết tin tức: ${res.TieuDe} (Mã: ${id}). Chi tiết: ${changes.map(c => `${c.truong}: ${c.giaTriCu} -> ${c.giaTriMoi}`).join(', ') || 'Không thay đổi trường cốt lõi'}`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: changes,
    });

    return res;
  }

  // ===== CẬP NHẬT TRẠNG THÁI =====
  async updateTrangThai(id: string, trangThai: string) {
    const original = await this.getById(id);
    const data: any = { TrangThai: trangThai as TrangThaiTinTucEnum };
    // Nếu đổi sang "Đã đăng" thì ghi ngày đăng hiện tại
    if (trangThai === 'DaDang') {
      data.NgayDang = new Date();
    }
    const res = await this.prisma.tIN_TUC.update({
      where: { MaTinTuc: id },
      data,
    });

    await this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý tin tức',
      NoiDungChiTiet: `Thay đổi trạng thái bài viết tin tức: ${res.TieuDe} (Mã: ${id}) sang ${trangThai}`,
      TrangThai: 'Thành công',
      TrangThaiCu: original?.TrangThai || '',
      TrangThaiMoi: trangThai,
      DuLieuThayDoi: [
        { truong: 'TrangThai', giaTriCu: original?.TrangThai || '', giaTriMoi: trangThai },
      ],
    });

    return res;
  }

  // ===== XÓA =====
  async delete(id: string) {
    const original = await this.getById(id);
    const res = await this.prisma.tIN_TUC.delete({
      where: { MaTinTuc: id },
    });

    await this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý tin tức',
      NoiDungChiTiet: `Xóa bài viết tin tức: ${original?.TieuDe || ''} (Mã: ${id})`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: [
        { truong: 'MaTinTuc', giaTriCu: id, giaTriMoi: null },
      ],
    });

    return res;
  }
}

