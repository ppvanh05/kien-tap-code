import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NhatKyHeThongService } from '../nhat-ky-he-thong/nhat-ky-he-thong.service';
import { AdminJwtHelper } from './admin-jwt.helper';

type AdminProfileUpdateDto = {
  HoVaTenDem?: string;
  Ten?: string;
  TenHienThi?: string;
  GioiTinh?: string;
  NgaySinh?: string | null;
  DiaChi?: string | null;
  SoDienThoai?: string;
  Email?: string;
  AnhDaiDien?: string | null;
  GhiChu?: string | null;
};

type AdminPasswordChangeDto = {
  MatKhauCu: string;
  MatKhauMoi: string;
  XacNhanMatKhau: string;
};

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) {}

  private mapRoleToFrontend(loai: string): string {
    if (loai === 'NhanVienBanVe') return 'BanVe';
    if (loai === 'NhanVienDieuPhoi') return 'DieuPhoi';
    return loai;
  }

  private mapGenderToBackend(gioiTinh: string): string {
    return gioiTinh === 'Nữ' || gioiTinh === 'Nu' ? 'Nu' : 'Nam';
  }

  private toSafeAdmin(admin: any) {
    const { MatKhau, ...adminData } = admin;
    return {
      ...adminData,
      LoaiTaiKhoan: this.mapRoleToFrontend(admin.LoaiTaiKhoan),
      GioiTinh: admin.GioiTinh === 'Nu' ? 'Nữ' : admin.GioiTinh,
    };
  }

  private signToken(admin: any): string {
    return AdminJwtHelper.sign({
      maNhanVien: admin.MaNhanVien,
      email: admin.Email || '',
      loaiTaiKhoan: admin.LoaiTaiKhoan,
      tenHienThi: admin.TenHienThi || admin.Ten || '',
      quyen: admin.Quyen,
    });
  }

  async login(dto: { email: string; matKhau: string }) {
    const usernameOrEmail = dto.email.trim();

    const admin = await this.prisma.nHAN_VIEN.findFirst({
      where: {
        OR: [
          { Email: usernameOrEmail },
          { TenTruyCap: usernameOrEmail },
        ],
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác!');
    }

    if (admin.TrangThai === 'DaKhoa') {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa!');
    }

    // Compare plain passwords
    if (admin.MatKhau !== dto.matKhau) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác!');
    }

    const token = this.signToken(admin);

    // Record log
    await this.nhatKyService.ghiLog({
      MaNhanVien: admin.MaNhanVien,
      LoaiThaoTac: 'Đăng nhập',
      NoiDungChiTiet: `Nhân viên đăng nhập thành công vào hệ thống Admin.`,
      TrangThai: 'Thành công',
    }).catch(err => console.error('Failed to log admin login:', err));

    return {
      token,
      admin: this.toSafeAdmin(admin),
    };
  }

  async getProfile(maNhanVien: string) {
    const admin = await this.prisma.nHAN_VIEN.findUnique({
      where: { MaNhanVien: maNhanVien },
    });

    if (!admin) {
      throw new NotFoundException('Khong tim thay tai khoan nhan vien!');
    }

    return this.toSafeAdmin(admin);
  }

  async updateProfile(maNhanVien: string, dto: AdminProfileUpdateDto) {
    const current = await this.prisma.nHAN_VIEN.findUnique({
      where: { MaNhanVien: maNhanVien },
    });

    if (!current) {
      throw new NotFoundException('Khong tim thay tai khoan nhan vien de cap nhat!');
    }

    const updateData: any = {};
    const requiredTextFields: Array<keyof AdminProfileUpdateDto> = [
      'HoVaTenDem',
      'Ten',
      'TenHienThi',
      'SoDienThoai',
      'Email',
    ];

    for (const field of requiredTextFields) {
      const value = dto[field];
      if (value !== undefined) {
        const trimmed = String(value).trim();
        if (!trimmed) {
          throw new BadRequestException('Ho ten, so dien thoai va email khong duoc de trong!');
        }
        updateData[field] = trimmed;
      }
    }

    const namePattern = /^[\p{L}\s'.-]+$/u;
    for (const field of ['HoVaTenDem', 'Ten', 'TenHienThi'] as const) {
      if (updateData[field] && !namePattern.test(updateData[field])) {
        throw new BadRequestException('Ho ten khong duoc chua so hoac ky tu dac biet!');
      }
    }

    if (updateData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(updateData.Email)) {
      throw new BadRequestException('Email khong dung dinh dang!');
    }

    if (updateData.SoDienThoai) {
      const phone = updateData.SoDienThoai.replace(/\s/g, '');
      if (!/^(0\d{9,10}|\+84\d{9,10})$/.test(phone)) {
        throw new BadRequestException('So dien thoai phai bat dau bang 0 hoac +84 va co 10-11 chu so!');
      }
      updateData.SoDienThoai = phone;
    }

    if (dto.Email !== undefined && updateData.Email !== current.Email) {
      const existingEmail = await this.prisma.nHAN_VIEN.findFirst({
        where: {
          Email: updateData.Email,
          NOT: { MaNhanVien: maNhanVien },
        },
      });
      if (existingEmail) {
        throw new BadRequestException('Email nay da duoc su dung boi nhan vien khac!');
      }
    }

    if (dto.SoDienThoai !== undefined && updateData.SoDienThoai !== current.SoDienThoai) {
      const existingPhone = await this.prisma.nHAN_VIEN.findFirst({
        where: {
          SoDienThoai: updateData.SoDienThoai,
          NOT: { MaNhanVien: maNhanVien },
        },
      });
      if (existingPhone) {
        throw new BadRequestException('So dien thoai nay da duoc su dung boi nhan vien khac!');
      }
    }

    if (dto.GioiTinh !== undefined) updateData.GioiTinh = this.mapGenderToBackend(dto.GioiTinh);
    if (dto.NgaySinh !== undefined) {
      if (dto.NgaySinh) {
        const birthDate = new Date(dto.NgaySinh);
        const today = new Date();
        birthDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        if (Number.isNaN(birthDate.getTime())) {
          throw new BadRequestException('Ngay sinh khong hop le!');
        }
        if (birthDate > today) {
          throw new BadRequestException('Ngay sinh khong duoc lon hon ngay hien tai!');
        }
        updateData.NgaySinh = birthDate;
      } else {
        updateData.NgaySinh = null;
      }
    }
    if (dto.DiaChi !== undefined) updateData.DiaChi = dto.DiaChi?.trim() || null;
    if (dto.AnhDaiDien !== undefined) updateData.AnhDaiDien = dto.AnhDaiDien || null;
    if (dto.GhiChu !== undefined) updateData.GhiChu = dto.GhiChu?.trim() || null;

    const updated = await this.prisma.nHAN_VIEN.update({
      where: { MaNhanVien: maNhanVien },
      data: updateData,
    });

    await this.nhatKyService.ghiLog({
      MaNhanVien: maNhanVien,
      LoaiThaoTac: 'Cap nhat thong tin ca nhan',
      NoiDungChiTiet: 'Nhan vien cap nhat thong tin ca nhan trong he thong Admin.',
      TrangThai: 'Thành công',
    }).catch(err => console.error('Failed to log admin profile update:', err));

    return {
      token: this.signToken(updated),
      admin: this.toSafeAdmin(updated),
    };
  }

  async changePassword(maNhanVien: string, dto: AdminPasswordChangeDto) {
    const current = await this.prisma.nHAN_VIEN.findUnique({
      where: { MaNhanVien: maNhanVien },
    });

    if (!current) {
      throw new NotFoundException('Khong tim thay tai khoan nhan vien!');
    }

    const oldPassword = String(dto.MatKhauCu || '');
    const newPassword = String(dto.MatKhauMoi || '');
    const confirmPassword = String(dto.XacNhanMatKhau || '');

    if (!oldPassword || !newPassword || !confirmPassword) {
      throw new BadRequestException('Vui long nhap day du mat khau hien tai, mat khau moi va xac nhan mat khau!');
    }

    if (current.MatKhau !== oldPassword) {
      throw new BadRequestException('Mat khau hien tai khong chinh xac!');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Xac nhan mat khau moi khong khop!');
    }

    if (newPassword === oldPassword) {
      throw new BadRequestException('Mat khau moi phai khac mat khau hien tai!');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('Mat khau moi phai co it nhat 8 ky tu!');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      throw new BadRequestException('Mat khau moi can co chu hoa, chu thuong va so!');
    }

    await this.prisma.nHAN_VIEN.update({
      where: { MaNhanVien: maNhanVien },
      data: { MatKhau: newPassword },
    });

    await this.nhatKyService.ghiLog({
      MaNhanVien: maNhanVien,
      LoaiThaoTac: 'Doi mat khau',
      NoiDungChiTiet: 'Nhan vien doi mat khau tai khoan Admin.',
      TrangThai: 'Thành công',
    }).catch(err => console.error('Failed to log admin password change:', err));

    return { message: 'Đã đổi mật khẩu thành công.' };
  }
}
