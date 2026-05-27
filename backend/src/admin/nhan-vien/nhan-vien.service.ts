import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TrangThaiTaiKhoanEnum, LoaiTaiKhoanNhanVienEnum } from '@prisma/client';
import { NhatKyHeThongService } from '../nhat-ky-he-thong/nhat-ky-he-thong.service';

@Injectable()
export class NhanVienService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) {}

  private mapToFrontend(nv: any) {
    if (!nv) return null;
    let loai = nv.LoaiTaiKhoan;
    if (loai === 'NhanVienBanVe') loai = 'BanVe';
    else if (loai === 'NhanVienDieuPhoi') loai = 'DieuPhoi';

    return {
      ...nv,
      LoaiTaiKhoan: loai,
      GioiTinh: nv.GioiTinh === 'Nu' ? 'Nữ' : nv.GioiTinh,
    };
  }

  private mapToBackend(loai: string): LoaiTaiKhoanNhanVienEnum {
    if (loai === 'BanVe') return 'NhanVienBanVe';
    if (loai === 'DieuPhoi') return 'NhanVienDieuPhoi';
    return loai as LoaiTaiKhoanNhanVienEnum;
  }

  private mapGenderToBackend(gender: string): string {
    if (gender === 'Nữ') return 'Nu';
    return gender;
  }

  // ===== LẤY TOÀN BỘ NHÂN VIÊN =====
  async getAll() {
    const list = await this.prisma.nHAN_VIEN.findMany({
      orderBy: { MaNhanVien: 'asc' },
    });
    return list.map(item => this.mapToFrontend(item));
  }

  // ===== LẤY CHI TIẾT THEO ID =====
  async getById(id: string) {
    const nv = await this.prisma.nHAN_VIEN.findUnique({
      where: { MaNhanVien: id },
    });
    if (!nv) {
      throw new NotFoundException(`Không tìm thấy nhân viên có mã ${id}`);
    }
    return this.mapToFrontend(nv);
  }

  // ===== TẠO MỚI TÀI KHOẢN NHÂN VIÊN =====
  async create(dto: Prisma.NHAN_VIENUncheckedCreateInput) {
    // Tự động phát sinh mã nhân viên dạng CLxxx
    const listNv = await this.prisma.nHAN_VIEN.findMany({
      where: {
        MaNhanVien: {
          startsWith: 'CL',
        },
      },
      select: { MaNhanVien: true },
    });
    
    let maxIdNumber = 100300; // Số mặc định nếu chưa có
    listNv.forEach(nv => {
      const match = nv.MaNhanVien.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxIdNumber) {
          maxIdNumber = num;
        }
      }
    });
    const newId = `CL${maxIdNumber + 1}`;

    const data: any = {
      ...dto,
      MaNhanVien: newId,
      LoaiTaiKhoan: this.mapToBackend(dto.LoaiTaiKhoan as string),
      TrangThai: dto.TrangThai ?? 'HoatDong',
    };

    if (dto.GioiTinh) {
      data.GioiTinh = this.mapGenderToBackend(dto.GioiTinh as string);
    }

    if (dto.NgaySinh) {
      data.NgaySinh = new Date(dto.NgaySinh as any);
    }

    const res = await this.prisma.nHAN_VIEN.create({
      data,
    });

    // Automatically seed child role tables to avoid breaking foreign key relations
    if (res.LoaiTaiKhoan === 'NhanVienBanVe') {
      await this.prisma.nHAN_VIEN_BAN_VE.create({ data: { MaNVBanVe: res.MaNhanVien } });
    } else if (res.LoaiTaiKhoan === 'QuanTriVien') {
      await this.prisma.qUAN_TRI_VIEN.create({ data: { MaQuanTriVien: res.MaNhanVien } });
    } else if (res.LoaiTaiKhoan === 'BanQuanLy') {
      await this.prisma.bAN_QUAN_LY.create({ data: { MaBanQuanLy: res.MaNhanVien } });
    } else if (res.LoaiTaiKhoan === 'NhanVienDieuPhoi') {
      await this.prisma.nHAN_VIEN_DIEU_PHOI.create({ data: { MaNVDieuPhoi: res.MaNhanVien } });
    }

    this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý tài khoản',
      NoiDungChiTiet: `Tạo tài khoản nhân viên mới: ${res.TenHienThi || res.Ten || ''} (Mã: ${res.MaNhanVien})`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: [
        { truong: 'MaNhanVien', giaTriCu: '', giaTriMoi: res.MaNhanVien },
        { truong: 'TenTruyCap', giaTriCu: '', giaTriMoi: res.TenTruyCap },
        { truong: 'LoaiTaiKhoan', giaTriCu: '', giaTriMoi: res.LoaiTaiKhoan },
      ],
    }).catch(err => console.error('Failed to write activity log:', err));

    return this.mapToFrontend(res);
  }

  // ===== CẬP NHẬT TÀI KHOẢN =====
  async update(id: string, dto: Prisma.NHAN_VIENUncheckedUpdateInput) {
    const original = await this.getById(id); // Check existence
    const originalDbRole = original?.LoaiTaiKhoan === 'BanVe' ? 'NhanVienBanVe' : (original?.LoaiTaiKhoan === 'DieuPhoi' ? 'NhanVienDieuPhoi' : original?.LoaiTaiKhoan);

    const data: any = { ...dto };
    if (dto.LoaiTaiKhoan) {
      data.LoaiTaiKhoan = this.mapToBackend(dto.LoaiTaiKhoan as string);
    }
    if (dto.GioiTinh) {
      data.GioiTinh = this.mapGenderToBackend(dto.GioiTinh as string);
    }
    if (dto.NgaySinh) {
      data.NgaySinh = new Date(dto.NgaySinh as any);
    }

    const res = await this.prisma.nHAN_VIEN.update({
      where: { MaNhanVien: id },
      data,
    });

    // If role changed, migrate child role tables safely
    if (data.LoaiTaiKhoan && data.LoaiTaiKhoan !== originalDbRole) {
      if (originalDbRole === 'NhanVienBanVe') {
        await this.prisma.nHAN_VIEN_BAN_VE.deleteMany({ where: { MaNVBanVe: id } });
      } else if (originalDbRole === 'QuanTriVien') {
        await this.prisma.qUAN_TRI_VIEN.deleteMany({ where: { MaQuanTriVien: id } });
      } else if (originalDbRole === 'BanQuanLy') {
        await this.prisma.bAN_QUAN_LY.deleteMany({ where: { MaBanQuanLy: id } });
      } else if (originalDbRole === 'NhanVienDieuPhoi') {
        await this.prisma.nHAN_VIEN_DIEU_PHOI.deleteMany({ where: { MaNVDieuPhoi: id } });
      }

      if (data.LoaiTaiKhoan === 'NhanVienBanVe') {
        await this.prisma.nHAN_VIEN_BAN_VE.create({ data: { MaNVBanVe: id } });
      } else if (data.LoaiTaiKhoan === 'QuanTriVien') {
        await this.prisma.qUAN_TRI_VIEN.create({ data: { MaQuanTriVien: id } });
      } else if (data.LoaiTaiKhoan === 'BanQuanLy') {
        await this.prisma.bAN_QUAN_LY.create({ data: { MaBanQuanLy: id } });
      } else if (data.LoaiTaiKhoan === 'NhanVienDieuPhoi') {
        await this.prisma.nHAN_VIEN_DIEU_PHOI.create({ data: { MaNVDieuPhoi: id } });
      }
    }

    const changes: any[] = [];
    if (dto.TenHienThi && dto.TenHienThi !== original?.TenHienThi) {
      changes.push({ truong: 'TenHienThi', giaTriCu: original?.TenHienThi || '', giaTriMoi: dto.TenHienThi as string });
    }
    if (dto.SoDienThoai && dto.SoDienThoai !== original?.SoDienThoai) {
      changes.push({ truong: 'SoDienThoai', giaTriCu: original?.SoDienThoai || '', giaTriMoi: dto.SoDienThoai as string });
    }
    if (dto.Email && dto.Email !== original?.Email) {
      changes.push({ truong: 'Email', giaTriCu: original?.Email || '', giaTriMoi: dto.Email as string });
    }
    if (dto.TrangThai && dto.TrangThai !== original?.TrangThai) {
      changes.push({ truong: 'TrangThai', giaTriCu: original?.TrangThai || '', giaTriMoi: dto.TrangThai as string });
    }
    if (dto.Quyen) {
      const origQuyen = original?.Quyen || [];
      const newQuyen = dto.Quyen as string[];
      if (JSON.stringify(origQuyen) !== JSON.stringify(newQuyen)) {
        changes.push({ truong: 'Quyen', giaTriCu: origQuyen.join(','), giaTriMoi: newQuyen.join(',') });
      }
    }

    this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý tài khoản',
      NoiDungChiTiet: `Cập nhật tài khoản nhân viên: ${res.TenHienThi || res.Ten || ''} (Mã: ${id}). Chi tiết: ${changes.map(c => `${c.truong}: ${c.giaTriCu} -> ${c.giaTriMoi}`).join(', ') || 'Không thay đổi trường cốt lõi'}`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: changes,
    }).catch(err => console.error('Failed to write activity log:', err));

    return this.mapToFrontend(res);
  }

  // ===== CẬP NHẬT TRẠNG THÁI =====
  async updateStatus(id: string, trangThai: string) {
    if (id === 'QTV001' && trangThai === 'DaKhoa') {
      throw new BadRequestException('Không thể thực hiện thao tác do tài khoản đang giữ vai trò quan trọng trong hệ thống');
    }
    const original = await this.getById(id);
    const res = await this.prisma.nHAN_VIEN.update({
      where: { MaNhanVien: id },
      data: { TrangThai: trangThai as TrangThaiTaiKhoanEnum },
    });

    this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý tài khoản',
      NoiDungChiTiet: `Thay đổi trạng thái tài khoản nhân viên ${res.TenHienThi || res.Ten || ''} (Mã: ${id}) sang ${trangThai === 'HoatDong' ? 'Đang hoạt động' : 'Đã khóa'}`,
      TrangThai: 'Thành công',
      TrangThaiCu: original?.TrangThai || '',
      TrangThaiMoi: trangThai,
      DuLieuThayDoi: [
        { truong: 'TrangThai', giaTriCu: original?.TrangThai || '', giaTriMoi: trangThai },
      ],
    }).catch(err => console.error('Failed to write activity log:', err));

    return this.mapToFrontend(res);
  }

  // ===== XÓA NHÂN VIÊN =====
  async delete(id: string) {
    const original = await this.getById(id); // mapped (original.LoaiTaiKhoan is 'BanVe' / 'DieuPhoi')
    const originalDbRole = original?.LoaiTaiKhoan === 'BanVe' ? 'NhanVienBanVe' : (original?.LoaiTaiKhoan === 'DieuPhoi' ? 'NhanVienDieuPhoi' : original?.LoaiTaiKhoan);

    // Delete linked child records first to satisfy foreign key constraints
    if (originalDbRole === 'NhanVienBanVe') {
      await this.prisma.nHAN_VIEN_BAN_VE.deleteMany({ where: { MaNVBanVe: id } });
    } else if (originalDbRole === 'QuanTriVien') {
      await this.prisma.qUAN_TRI_VIEN.deleteMany({ where: { MaQuanTriVien: id } });
    } else if (originalDbRole === 'BanQuanLy') {
      await this.prisma.bAN_QUAN_LY.deleteMany({ where: { MaBanQuanLy: id } });
    } else if (originalDbRole === 'NhanVienDieuPhoi') {
      await this.prisma.nHAN_VIEN_DIEU_PHOI.deleteMany({ where: { MaNVDieuPhoi: id } });
    }

    const res = await this.prisma.nHAN_VIEN.delete({
      where: { MaNhanVien: id },
    });

    this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý tài khoản',
      NoiDungChiTiet: `Xóa tài khoản nhân viên: ${original?.TenHienThi || original?.Ten || ''} (Mã: ${id})`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: [
        { truong: 'MaNhanVien', giaTriCu: id, giaTriMoi: '' },
      ],
    }).catch(err => console.error('Failed to write activity log:', err));

    return this.mapToFrontend(res);
  }
}

