import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TrangThaiTaiKhoanEnum } from '@prisma/client';
import { NhatKyHeThongService } from '../nhat-ky-he-thong/nhat-ky-he-thong.service';

@Injectable()
export class KhachHangService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) {}

  private mapToFrontend(kh: any) {
    if (!kh) return null;
    return {
      ...kh,
      GioiTinh: kh.GioiTinh === 'Nu' ? 'Nữ' : kh.GioiTinh,
    };
  }

  // ===== TẠO MỚI KHÁCH HÀNG =====
  async create(dto: Prisma.KHACH_HANGCreateInput) {
    // Kiểm tra email đã tồn tại chưa
    const existingKh = await this.prisma.kHACH_HANG.findFirst({
      where: { Email: dto.Email as string },
    });

    if (existingKh) {
      throw new BadRequestException('Email này đã được đăng ký trước đó!');
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    if (dto.SoDienThoai) {
      const existingPhone = await this.prisma.kHACH_HANG.findFirst({
        where: { SoDienThoai: dto.SoDienThoai as string },
      });

      if (existingPhone) {
        throw new BadRequestException('Số điện thoại này đã được đăng ký trước đó!');
      }
    }

    // Xử lý ngày sinh
    const data: any = { ...dto };
    if (dto.NgaySinh) {
      data.NgaySinh = new Date(dto.NgaySinh as any);
    }

    if (dto.GioiTinh) {
      data.GioiTinh = (dto.GioiTinh as any) === 'Nữ' ? 'Nu' : dto.GioiTinh;
    }

    // Nếu không có trạng thái, mặc định là HoatDong
    if (!data.TrangThaiTaiKhoan) {
      data.TrangThaiTaiKhoan = 'HoatDong';
    }

    const res = await this.prisma.kHACH_HANG.create({
      data,
    });

    // Ghi log tạo mới khách hàng
    await this.nhatKyService.ghiLog({
      MaKhachHang: res.MaKhachHang,
      LoaiThaoTac: 'Tạo mới',
      NoiDungChiTiet: `Tạo mới tài khoản khách hàng: ${res.HoTenKhachHang}`,
      TrangThai: 'Thành công',
    });

    return this.mapToFrontend(res);
  }

  // ===== LẤY TẤT CẢ KHÁCH HÀNG =====
  async getAll() {
    const list = await this.prisma.kHACH_HANG.findMany({
      orderBy: { NgayDangKy: 'desc' },
      include: {
        DON_HANG: {
          select: {
            _count: {
              select: {
                VE_DIEN_TU: true,
              },
            },
          },
        },
      },
    });

    return list.map((kh) => {
      const ticketCount = kh.DON_HANG.reduce(
        (sum, dh) => sum + (dh._count?.VE_DIEN_TU || 0),
        0,
      );
      const { DON_HANG, ...rest } = kh;
      return this.mapToFrontend({
        ...rest,
        tongSoVeDaDat: ticketCount,
      });
    });
  }

  // ===== LẤY THEO ID =====
  async getById(id: string) {
    const kh = await this.prisma.kHACH_HANG.findUnique({
      where: { MaKhachHang: id },
    });
    if (!kh) throw new NotFoundException(`Không tìm thấy khách hàng với mã ${id}`);
    return this.mapToFrontend(kh);
  }

  // ===== LẤY THEO TRẠNG THÁI =====
  async getByTrangThai(trangThai: string) {
    const list = await this.prisma.kHACH_HANG.findMany({
      where: { TrangThaiTaiKhoan: trangThai as TrangThaiTaiKhoanEnum },
      orderBy: { NgayDangKy: 'desc' },
    });
    return list.map(item => this.mapToFrontend(item));
  }

  // ===== CẬP NHẬT THÔNG TIN CƠ BẢN =====
  async update(id: string, dto: Prisma.KHACH_HANGUncheckedUpdateInput) {
    const original = await this.getById(id); // kiểm tra tồn tại
    const data: any = { ...dto };
    if (dto.NgaySinh) {
      data.NgaySinh = new Date(dto.NgaySinh as any);
    }
    if (dto.GioiTinh) {
      data.GioiTinh = (dto.GioiTinh as any) === 'Nữ' ? 'Nu' : dto.GioiTinh;
    }
    const res = await this.prisma.kHACH_HANG.update({
      where: { MaKhachHang: id },
      data,
    });

    const changes: any[] = [];
    if (dto.HoTenKhachHang && dto.HoTenKhachHang !== original.HoTenKhachHang) {
      changes.push({ truong: 'HoTenKhachHang', giaTriCu: original.HoTenKhachHang, giaTriMoi: dto.HoTenKhachHang as string });
    }
    if (dto.SoDienThoai && dto.SoDienThoai !== original.SoDienThoai) {
      changes.push({ truong: 'SoDienThoai', giaTriCu: original.SoDienThoai, giaTriMoi: dto.SoDienThoai as string });
    }
    if (dto.Email && dto.Email !== original.Email) {
      changes.push({ truong: 'Email', giaTriCu: original.Email, giaTriMoi: dto.Email as string });
    }

    await this.nhatKyService.ghiLog({
      MaKhachHang: id,
      LoaiThaoTac: 'Cập nhật thông tin cá nhân',
      NoiDungChiTiet: `Cập nhật thông tin khách hàng ${res.HoTenKhachHang}. Chi tiết: ${changes.map(c => `${c.truong}: ${c.giaTriCu} -> ${c.giaTriMoi}`).join(', ') || 'Không thay đổi trường cốt lõi'}`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: changes,
    });

    return this.mapToFrontend(res);
  }

  // ===== KHÓA TÀI KHOẢN =====
  async khoaTaiKhoan(id: string, dto: { LyDoKhoa: string }) {
    const kh = await this.getById(id);

    // Kiểm tra đã khóa chưa
    if (kh.TrangThaiTaiKhoan === 'DaKhoa') {
      throw new BadRequestException('Tài khoản này đã bị khóa trước đó!');
    }

    // Kiểm tra khách hàng còn vé chưa đi không
    const veConHieuLuc = await this.prisma.vE_DIEN_TU.findFirst({
      where: {
        DON_HANG: {
          MaKhachHang: id,
        },
        TrangThaiVe: 'ChoKhoiHanh',
      },
    });

    if (veConHieuLuc) {
      throw new BadRequestException(
        `Tài khoản đang có vé chưa hoàn thành (Mã vé: ${veConHieuLuc.MaVe}). Vui lòng xử lý xong vé trước khi khóa tài khoản!`,
      );
    }

    const res = await this.prisma.kHACH_HANG.update({
      where: { MaKhachHang: id },
      data: {
        TrangThaiTaiKhoan: 'DaKhoa',
        LyDoKhoa: dto.LyDoKhoa,
      },
    });

    await this.nhatKyService.ghiLog({
      MaKhachHang: id,
      LoaiThaoTac: 'Quản lý tài khoản',
      NoiDungChiTiet: `Khóa tài khoản khách hàng. Lý do: ${dto.LyDoKhoa}`,
      TrangThai: 'Thành công',
      TrangThaiCu: 'HoatDong',
      TrangThaiMoi: 'DaKhoa',
      DuLieuThayDoi: [
        { truong: 'TrangThaiTaiKhoan', giaTriCu: 'HoatDong', giaTriMoi: 'DaKhoa' },
        { truong: 'LyDoKhoa', giaTriCu: null, giaTriMoi: dto.LyDoKhoa },
      ],
    });

    return this.mapToFrontend(res);
  }

  // ===== MỞ KHÓA TÀI KHOẢN =====
  async moKhoaTaiKhoan(id: string) {
    const kh = await this.getById(id);

    if (kh.TrangThaiTaiKhoan === 'HoatDong') {
      throw new BadRequestException('Tài khoản này đang hoạt động bình thường!');
    }

    const res = await this.prisma.kHACH_HANG.update({
      where: { MaKhachHang: id },
      data: {
        TrangThaiTaiKhoan: 'HoatDong',
        LyDoKhoa: null,
      },
    });

    await this.nhatKyService.ghiLog({
      MaKhachHang: id,
      LoaiThaoTac: 'Quản lý tài khoản',
      NoiDungChiTiet: 'Mở khóa tài khoản khách hàng',
      TrangThai: 'Thành công',
      TrangThaiCu: 'DaKhoa',
      TrangThaiMoi: 'HoatDong',
      DuLieuThayDoi: [
        { truong: 'TrangThaiTaiKhoan', giaTriCu: 'DaKhoa', giaTriMoi: 'HoatDong' },
      ],
    });

    return this.mapToFrontend(res);
  }

  // ===== LẤY LỊCH SỬ VÉ CỦA KHÁCH HÀNG =====
  async getVeByKhachHang(id: string) {
    return this.prisma.vE_DIEN_TU.findMany({
      where: {
        DON_HANG: {
          MaKhachHang: id,
        },
      },
      include: {
        LICH_TRINH: {
          include: {
            TUYEN_XE: true,
          },
        },
        GHE_CHUYEN_XE: true,
      },
      orderBy: {
        ThoiGianXuatVe: 'desc',
      },
    });
  }

  // ===== LẤY NHẬT KÝ HOẠT ĐỘNG CỦA KHÁCH HÀNG =====
  async getNhatKyByKhachHang(id: string) {
    const list = await this.prisma.nHAT_KY_HE_THONG.findMany({
      where: { MaKhachHang: id },
      orderBy: { ThoiGian: 'desc' },
    });
    return list.map(item => ({
      ...item,
      TrangThai: item.TrangThai === 'ThatBai' ? 'Thất bại' : 'Thành công',
    }));
  }
}
