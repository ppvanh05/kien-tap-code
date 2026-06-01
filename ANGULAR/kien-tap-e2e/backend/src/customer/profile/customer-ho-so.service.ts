import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GioiTinhEnum, TrangThaiTaiKhoanEnum } from '@prisma/client';

@Injectable()
export class CustomerHoSoService {
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

    // Chỉ cho phép sửa các trường yêu cầu
    if (data.HoTenKhachHang !== undefined) {
      const hoTen = data.HoTenKhachHang.trim();
      if (!hoTen || hoTen.length < 2 || hoTen.length > 100) {
        throw new BadRequestException('Họ tên phải từ 2 đến 100 ký tự và không được để trống');
      }
      updateData.HoTenKhachHang = hoTen;
    }

    if (data.Email !== undefined) {
      if (data.Email) {
        const email = data.Email.trim();
        // Regex validate email chuẩn hơn
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (email.includes(' ') || !emailRegex.test(email) || email.endsWith('.') || email.length > 254) {
          throw new BadRequestException('Định dạng email không hợp lệ hoặc quá dài');
        }

        // Kiểm tra trùng email với khách hàng khác
        const existingEmail = await this.prisma.kHACH_HANG.findFirst({
          where: {
            Email: email,
            NOT: { MaKhachHang: id }
          }
        });
        if (existingEmail) {
          throw new BadRequestException('Email này đã được sử dụng bởi một tài khoản khác');
        }
        updateData.Email = email;
      } else {
        updateData.Email = null;
      }
    }

    if (data.AnhDaiDien !== undefined) updateData.AnhDaiDien = data.AnhDaiDien;

    // Validate GioiTinh theo enum trong schema
    if (data.GioiTinh !== undefined) {
      if (!Object.values(GioiTinhEnum).includes(data.GioiTinh as GioiTinhEnum)) {
        throw new BadRequestException(`Giới tính không hợp lệ. Chỉ chấp nhận: ${Object.values(GioiTinhEnum).join(', ')}`);
      }
      updateData.GioiTinh = data.GioiTinh;
    }

    // Convert NgaySinh sang Date nếu có
    if (data.NgaySinh !== undefined) {
      if (data.NgaySinh) {
        const ngaySinh = new Date(data.NgaySinh);
        if (ngaySinh > new Date()) {
          throw new BadRequestException('Ngày sinh không được lớn hơn ngày hiện tại');
        }
        updateData.NgaySinh = ngaySinh;
      } else {
        updateData.NgaySinh = null;
      }
    }

    // Thực hiện cập nhật và trả về dữ liệu (không có MatKhau)
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
