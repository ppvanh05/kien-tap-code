import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GioiTinhEnum, TrangThaiTaiKhoanEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

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

  async sendOtpForPasswordChange(id: string) {
    const customer = await this.prisma.kHACH_HANG.findUnique({
      where: { MaKhachHang: id },
      select: { SoDienThoai: true },
    });

    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng với mã ${id}`);
    }

    return this.authService.sendOtp({
      SoDienThoai: customer.SoDienThoai,
      MucDich: 'DoiMatKhau',
    });
  }

  async changePassword(id: string, dto: { MatKhauCu: string; MatKhauMoi: string; XacNhanMatKhauMoi: string }) {
    const customer = await this.prisma.kHACH_HANG.findUnique({
      where: { MaKhachHang: id },
    });

    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng với mã ${id}`);
    }

    // Validate mật khẩu mới không được rỗng
    if (!dto.MatKhauMoi || dto.MatKhauMoi.trim() === '') {
      throw new BadRequestException('Mật khẩu mới không được để trống.');
    }

    // Validate mật khẩu mới và xác nhận mật khẩu mới phải giống nhau
    if (dto.MatKhauMoi !== dto.XacNhanMatKhauMoi) {
      throw new BadRequestException('Mật khẩu mới và xác nhận mật khẩu mới không khớp.');
    }

    // Validate mật khẩu mới không được trùng mật khẩu cũ
    if (dto.MatKhauMoi === dto.MatKhauCu) {
      throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu cũ.');
    }

    // So sánh mật khẩu cũ
    const isPasswordValid = await bcrypt.compare(dto.MatKhauCu, customer.MatKhau);
    if (!isPasswordValid && customer.MatKhau !== dto.MatKhauCu) {
      throw new BadRequestException('Mật khẩu cũ không đúng.');
    }

    // Hash mật khẩu mới và cập nhật
    const hashedPassword = await bcrypt.hash(dto.MatKhauMoi, 10);
    await this.prisma.kHACH_HANG.update({
      where: { MaKhachHang: id },
      data: { MatKhau: hashedPassword },
    });

    return {
      success: true,
      message: 'Đổi mật khẩu thành công!',
    };
  }

  // Helper to map order details for frontend output
  private mapOrderToFrontend(order: any) {
    if (!order) return null;
    const firstTicket = order.VE_DIEN_TU?.[0];
    const schedule = firstTicket?.LICH_TRINH;
    const route = schedule?.TUYEN_XE;
    const vehicle = firstTicket?.PHUONG_TIEN;

    const statusMap: Record<string, string> = {
      ChoThanhToan: 'Chờ thanh toán',
      ChoKhoiHanh: 'Chờ khởi hành',
      DaHoanThanh: 'Đã hoàn thành',
      DaHuy: 'Đã hủy',
      DaDanhGia: 'Đã đánh giá',
    };
    const trangThaiDonHang = statusMap[order.TrangThaiDonHang] || order.TrangThaiDonHang || 'Chờ thanh toán';

    const tickets = (order.VE_DIEN_TU || []).map((ticket: any) => {
      const ticketStatusMap: Record<string, string> = {
        ChoThanhToan: 'Chờ thanh toán',
        ConHieuLuc: 'Chờ khởi hành',
        DaSuDung: 'Đã hoàn thành',
        DaHuy: 'Đã hủy',
        DaDanhGia: 'Đã đánh giá',
      };
      
      const departureDateStr = schedule?.NgayKhoiHanh
        ? new Date(schedule.NgayKhoiHanh).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
        : '';

      const pickupTime = ticket.DIEM_DON?.GioCanCoMat 
        ? new Date(ticket.DIEM_DON.GioCanCoMat).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
        : (schedule?.GioKhoiHanh ? new Date(schedule.GioKhoiHanh).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '');

      const dropoffTime = ticket.DIEM_TRA?.GioCanCoMat 
        ? new Date(ticket.DIEM_TRA.GioCanCoMat).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
        : (schedule?.GioDenDuKien ? new Date(schedule.GioDenDuKien).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '');

      return {
        maVe: ticket.MaVe,
        soGhe: ticket.GHE_CHUYEN_XE?.GHE?.SoGhe || ticket.MaGheChuyen.split('_').pop() || '',
        bienSoXe: ticket.PHUONG_TIEN?.BienSoXe || vehicle?.BienSoXe || '',
        diemDon: ticket.DIEM_DON?.TenDiem || '',
        diemDonThoiGian: `${pickupTime} ngày ${departureDateStr}`,
        diemTra: ticket.DIEM_TRA?.TenDiem || '',
        diemTraThoiGian: `${dropoffTime} ngày ${departureDateStr}`,
        giaVe: ticket.GiaVe.toNumber(),
        trangThaiVe: ticketStatusMap[ticket.TrangThaiVe] || ticket.TrangThaiVe || 'Chờ khởi hành',
        maQRVe: ticket.MaQRVe,
      };
    });

    const departureDateFormatted = schedule?.NgayKhoiHanh 
      ? new Date(schedule.NgayKhoiHanh).toISOString().slice(0, 10) 
      : '';

    const pickupTimeStr = firstTicket?.DIEM_DON?.GioCanCoMat 
      ? new Date(firstTicket.DIEM_DON.GioCanCoMat).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
      : '';

    const dropoffTimeStr = firstTicket?.DIEM_TRA?.GioCanCoMat 
      ? new Date(firstTicket.DIEM_TRA.GioCanCoMat).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
      : '';

    return {
      maDonHang: order.MaDonHang,
      hoTenNguoiDi: order.HoTenNguoiDi,
      soDienThoai: order.SdtNguoiDi,
      email: order.EmailNguoiDi,
      thoiGianDat: order.ThoiGianDat ? new Date(order.ThoiGianDat).toISOString().replace('T', ' ').slice(0, 16) : '',
      soLuongVeDaDat: order.SoLuongVeDaDat,
      tenTuyen: route?.TenTuyenXe || '',
      gioKhoiHanh: schedule?.GioKhoiHanh ? new Date(schedule.GioKhoiHanh).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
      gioTra: schedule?.GioDenDuKien ? new Date(schedule.GioDenDuKien).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
      departureDate: departureDateFormatted,
      diemDon: firstTicket?.DIEM_DON?.TenDiem || '',
      diemTra: firstTicket?.DIEM_TRA?.TenDiem || '',
      thoiGianCoMatTruoc: firstTicket?.DIEM_DON?.ThoiGianCoMatTruoc ? `${firstTicket.DIEM_DON.ThoiGianCoMatTruoc} phút` : '30 phút',
      gioCanCoMat: pickupTimeStr || 'Chưa xếp',
      tongGiaVe: order.TongGiaVe.toNumber(),
      phuongThucThanhToan: order.PhuongThucThanhToan,
      trangThaiDonHang,
      bienSoXe: vehicle?.BienSoXe || '',
      maDiemDon: firstTicket?.MaDiemDon || '',
      maDiemTra: firstTicket?.MaDiemTra || '',
      soLanDaSua: firstTicket?.SoLanDaSua || 0,
      gioiHanChinhSua: 2,
      tickets,
    };
  }

  // ===== GET BOOKING HISTORY =====
  async getBookingHistory(
    maKhachHang: string,
    trangThai?: string,
    sortByDate: 'asc' | 'desc' = 'desc',
  ) {
    const where: any = { MaKhachHang: maKhachHang };

    if (trangThai) {
      where.TrangThaiDonHang = trangThai;
    }

    const list = await this.prisma.dON_HANG.findMany({
      where,
      include: {
        VE_DIEN_TU: {
          include: {
            LICH_TRINH: {
              include: { TUYEN_XE: true },
            },
            PHUONG_TIEN: true,
            GHE_CHUYEN_XE: {
              include: { GHE: true },
            },
            DIEM_DON: true,
            DIEM_TRA: true,
            LICH_SU_VE: true,
          },
        },
        THANH_TOAN: true,
      },
      orderBy: { ThoiGianDat: sortByDate },
    });

    return list.map(order => this.mapOrderToFrontend(order)).filter(Boolean);
  }
}