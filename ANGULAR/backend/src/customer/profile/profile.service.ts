import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GioiTinhEnum, TrangThaiTaiKhoanEnum } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  // 1. GET /customer/ho-so/:id
  async getProfile(id: string) {
    const customer = await this.prisma.kHACH_HANG.findUnique({
      where: { MaKhachHang: id },
      select: {
        MaKhachHang: true,
        HoTenKhachHang: true,
        SoDienThoai: true,
        Email: true,
        AnhDaiDien: true,
        GioiTinh: true,
        NgaySinh: true,
        TrangThaiTaiKhoan: true,
        NgayDangKy: true,
        // MatKhau: false (Mặc định không chọn là không trả về)
      },
    });

    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng với mã ${id}`);
    }

    return customer;
  }

  // 2. PATCH /customer/ho-so/:id
  async updateProfile(id: string, data: any) {
    const customer = await this.prisma.kHACH_HANG.findUnique({
      where: { MaKhachHang: id },
    });

    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng với mã ${id}`);
    }

    // Nếu tài khoản bị khóa thì không cho sửa
    if (customer.TrangThaiTaiKhoan === TrangThaiTaiKhoanEnum.DaKhoa) {
      throw new BadRequestException('Tài khoản đang bị khóa, không thể cập nhật thông tin');
    }

    const updateData: any = {};

    // Cho phép sửa các trường cụ thể
    if (data.HoTenKhachHang !== undefined) updateData.HoTenKhachHang = data.HoTenKhachHang;
    if (data.Email !== undefined) updateData.Email = data.Email;
    if (data.AnhDaiDien !== undefined) updateData.AnhDaiDien = data.AnhDaiDien;

    // Validate GioiTinh
    if (data.GioiTinh !== undefined) {
      if (!Object.values(GioiTinhEnum).includes(data.GioiTinh as GioiTinhEnum)) {
        throw new BadRequestException(`Giới tính không hợp lệ. Chỉ chấp nhận: ${Object.values(GioiTinhEnum).join(', ')}`);
      }
      updateData.GioiTinh = data.GioiTinh;
    }

    // Convert NgaySinh sang Date
    if (data.NgaySinh !== undefined) {
      updateData.NgaySinh = data.NgaySinh ? new Date(data.NgaySinh) : null;
    }

    // Thực hiện cập nhật
    const updatedCustomer = await this.prisma.kHACH_HANG.update({
      where: { MaKhachHang: id },
      data: updateData,
      select: {
        MaKhachHang: true,
        HoTenKhachHang: true,
        SoDienThoai: true,
        Email: true,
        AnhDaiDien: true,
        GioiTinh: true,
        NgaySinh: true,
        TrangThaiTaiKhoan: true,
        NgayDangKy: true,
      },
    });

    return updatedCustomer;
  }
}
