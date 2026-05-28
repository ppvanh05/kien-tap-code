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
