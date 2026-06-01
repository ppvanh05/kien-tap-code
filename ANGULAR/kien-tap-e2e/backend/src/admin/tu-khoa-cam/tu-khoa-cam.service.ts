import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, LoaiViPhamEnum, TrangThaiViPhamEnum } from '@prisma/client';
import { NhatKyHeThongService } from '../nhat-ky-he-thong/nhat-ky-he-thong.service';

@Injectable()
export class TuKhoaCamService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) {}

  private mapToFrontend(tk: any) {
    if (!tk) return null;
    let level = tk.LoaiViPham;
    if (level === 'Nang') level = 'Cao';
    else if (level === 'Nhe') level = 'Thap';
    return {
      ...tk,
      LoaiViPham: level,
    };
  }

  private mapViolationToBackend(level: string): LoaiViPhamEnum {
    if (level === 'Cao') return 'Nang';
    if (level === 'Thap') return 'Nhe';
    return level as LoaiViPhamEnum;
  }

  // ===== LẤY TOÀN BỘ TỪ KHÓA =====
  async getAll() {
    const list = await this.prisma.tU_KHOA_HAN_CHE.findMany({
      orderBy: { MaTuKhoa: 'asc' },
    });
    return list.map(item => this.mapToFrontend(item));
  }

  // ===== TÌM THEO ID =====
  async getById(id: string) {
    const tk = await this.prisma.tU_KHOA_HAN_CHE.findUnique({
      where: { MaTuKhoa: id },
    });
    if (!tk) {
      throw new NotFoundException(`Không tìm thấy từ khóa cấm với mã ${id}`);
    }
    return this.mapToFrontend(tk);
  }

  // ===== TẠO MỚI TỪ KHÓA CẤM =====
  async create(dto: Prisma.TU_KHOA_HAN_CHEUncheckedCreateInput) {
    // Kiểm tra xem từ khóa đã tồn tại chưa (case-insensitive)
    const exactKeyword = dto.NoiDungTuKhoa.trim();
    const existing = await this.prisma.tU_KHOA_HAN_CHE.findFirst({
      where: {
        NoiDungTuKhoa: {
          equals: exactKeyword,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new BadRequestException(`Từ khóa "${exactKeyword}" đã tồn tại trong danh sách!`);
    }

    // Tự động phát sinh mã từ khóa dạng TKCxxx
    const listTk = await this.prisma.tU_KHOA_HAN_CHE.findMany({
      select: { MaTuKhoa: true },
    });

    let maxIdNumber = 100000;
    listTk.forEach(tk => {
      const match = tk.MaTuKhoa.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxIdNumber) {
          maxIdNumber = num;
        }
      }
    });

    const newId = `TKC${maxIdNumber + 1}`;

    const res = await this.prisma.tU_KHOA_HAN_CHE.create({
      data: {
        MaTuKhoa: newId,
        NoiDungTuKhoa: exactKeyword,
        LoaiViPham: this.mapViolationToBackend(dto.LoaiViPham as string),
        TrangThai: (dto.TrangThai ?? 'DangApDung') as TrangThaiViPhamEnum,
        ThoiGianCapNhat: new Date(),
        MaQuanTriVien: dto.MaQuanTriVien ?? null,
      },
    });

    await this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP100001',
      LoaiThaoTac: 'Quản lý tài khoản',
      NoiDungChiTiet: `Thêm từ khóa cấm mới: "${res.NoiDungTuKhoa}" (Mức độ: ${res.LoaiViPham}, Trạng thái: ${res.TrangThai})`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: [
        { truong: 'MaTuKhoa', giaTriCu: null, giaTriMoi: res.MaTuKhoa },
        { truong: 'NoiDungTuKhoa', giaTriCu: null, giaTriMoi: res.NoiDungTuKhoa },
        { truong: 'LoaiViPham', giaTriCu: null, giaTriMoi: res.LoaiViPham },
        { truong: 'TrangThai', giaTriCu: null, giaTriMoi: res.TrangThai },
      ],
    });

    return this.mapToFrontend(res);
  }

  // ===== CẬP NHẬT TỪ KHÓA =====
  async update(id: string, dto: Prisma.TU_KHOA_HAN_CHEUncheckedUpdateInput) {
    const original = await this.getById(id);
    const originalDbLevel = this.mapViolationToBackend(original?.LoaiViPham);

    if (dto.NoiDungTuKhoa) {
      const exactKeyword = (dto.NoiDungTuKhoa as string).trim();
      const existing = await this.prisma.tU_KHOA_HAN_CHE.findFirst({
        where: {
          NoiDungTuKhoa: {
            equals: exactKeyword,
            mode: 'insensitive',
          },
          NOT: {
            MaTuKhoa: id,
          },
        },
      });
      if (existing) {
        throw new BadRequestException(`Từ khóa "${exactKeyword}" đã tồn tại ở bản ghi khác!`);
      }
      dto.NoiDungTuKhoa = exactKeyword;
    }

    const data: any = { ...dto };
    if (dto.LoaiViPham) {
      data.LoaiViPham = this.mapViolationToBackend(dto.LoaiViPham as string);
    }

    const res = await this.prisma.tU_KHOA_HAN_CHE.update({
      where: { MaTuKhoa: id },
      data: {
        ...data,
        ThoiGianCapNhat: new Date(),
      },
    });

    const changes: any[] = [];
    if (dto.NoiDungTuKhoa && dto.NoiDungTuKhoa !== original?.NoiDungTuKhoa) {
      changes.push({ truong: 'NoiDungTuKhoa', giaTriCu: original?.NoiDungTuKhoa || '', giaTriMoi: dto.NoiDungTuKhoa as string });
    }
    if (dto.LoaiViPham && this.mapViolationToBackend(dto.LoaiViPham as string) !== originalDbLevel) {
      changes.push({ truong: 'LoaiViPham', giaTriCu: originalDbLevel, giaTriMoi: this.mapViolationToBackend(dto.LoaiViPham as string) });
    }
    if (dto.TrangThai && dto.TrangThai !== original?.TrangThai) {
      changes.push({ truong: 'TrangThai', giaTriCu: original?.TrangThai || '', giaTriMoi: dto.TrangThai as string });
    }

    await this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP100001',
      LoaiThaoTac: 'Quản lý tài khoản',
      NoiDungChiTiet: `Cập nhật từ khóa cấm: "${res.NoiDungTuKhoa}" (Mã: ${id}). Chi tiết: ${changes.map(c => `${c.truong}: ${c.giaTriCu} -> ${c.giaTriMoi}`).join(', ') || 'Không thay đổi trường cốt lõi'}`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: changes,
    });

    return this.mapToFrontend(res);
  }

  // ===== XÓA TỪ KHÓA CẤM =====
  async delete(id: string) {
    const original = await this.getById(id);
    const res = await this.prisma.tU_KHOA_HAN_CHE.delete({
      where: { MaTuKhoa: id },
    });

    await this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP100001',
      LoaiThaoTac: 'Quản lý tài khoản',
      NoiDungChiTiet: `Xóa từ khóa cấm: "${original?.NoiDungTuKhoa || ''}" (Mã: ${id})`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: [
        { truong: 'MaTuKhoa', giaTriCu: id, giaTriMoi: null },
      ],
    });

    return this.mapToFrontend(res);
  }
}

