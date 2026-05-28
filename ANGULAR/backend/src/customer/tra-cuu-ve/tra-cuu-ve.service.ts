import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NhatKyHeThongService } from '../../admin/nhat-ky-he-thong/nhat-ky-he-thong.service';
import { Prisma, TrangThaiVe, TrangThaiGhe, TrangThaiChinhSachEnum } from '@prisma/client';

@Injectable()
export class TraCuuVeService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) {}

  // Helper mapper to structure database orders into the exact JSON output expected by the Angular frontend
  private mapOrderToFrontend(order: any) {
    if (!order) return null;
    const firstTicket = order.VE_DIEN_TU?.[0];
    const schedule = firstTicket?.LICH_TRINH;
    const route = schedule?.TUYEN_XE;
    const vehicle = firstTicket?.PHUONG_TIEN;

    // DB TrangThaiDonHang: Ch__thanh_to_n, Ch__kh_i_h_nh, ho_n_th_nh, h_y
    // Frontend expects: 'Chờ thanh toán', 'Chờ khởi hành', 'Đã hoàn thành', 'Đã hủy', 'Đã đánh giá'
    const statusMap: Record<string, string> = {
      [TrangThaiVe.Ch__thanh_to_n]: 'Chờ thanh toán',
      [TrangThaiVe.Ch__kh_i_h_nh]: 'Chờ khởi hành',
      [TrangThaiVe.ho_n_th_nh]: 'Đã hoàn thành',
      [TrangThaiVe.h_y]: 'Đã hủy',
    };
    const trangThaiDonHang = statusMap[order.TrangThaiDonHang] || order.TrangThaiDonHang || 'Chờ thanh toán';

    // Map tickets list
    const tickets = (order.VE_DIEN_TU || []).map((ticket: any) => {
      const ticketStatusMap: Record<string, string> = {
        [TrangThaiVe.Ch__thanh_to_n]: 'Chờ thanh toán',
        [TrangThaiVe.Ch__kh_i_h_nh]: 'Chờ khởi hành',
        [TrangThaiVe.ho_n_th_nh]: 'Đã hoàn thành',
        [TrangThaiVe.h_y]: 'Đã hủy',
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

  // ===== LOOKUP TICKET (NO LOGIN) =====
  async lookup(code: string, phone: string) {
    const trimmedCode = code.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    // Query order that matches code and phone
    const order = await this.prisma.dON_HANG.findFirst({
      where: {
        OR: [
          { MaDonHang: { equals: code, mode: 'insensitive' } },
          { VE_DIEN_TU: { some: { MaVe: { equals: code, mode: 'insensitive' } } } },
        ],
        SdtNguoiDi: trimmedPhone,
      },
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
          },
        },
        THANH_TOAN: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn đặt vé nào khớp với thông tin cung cấp!');
    }

    return this.mapOrderToFrontend(order);
  }

  // ===== GET TICKET HISTORY (JWT) =====
  async getHistory(maKhachHang: string) {
    const list = await this.prisma.dON_HANG.findMany({
      where: { MaKhachHang: maKhachHang },
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
          },
        },
        THANH_TOAN: true,
      },
      orderBy: { ThoiGianDat: 'desc' },
    });

    return list.map(order => this.mapOrderToFrontend(order)).filter(Boolean);
  }

  // ===== UPDATE TICKET INFO (MAX 2 EDITS, > 2 HOURS BEFORE DEPARTURE) =====
  async updateInfo(
    maDonHang: string,
    dto: {
      HoTenNguoiDi: string;
      SdtNguoiDi: string;
      EmailNguoiDi?: string;
      MaDiemDon: string;
      MaDiemTra: string;
    },
  ) {
    const order = await this.prisma.dON_HANG.findUnique({
      where: { MaDonHang: maDonHang },
      include: {
        VE_DIEN_TU: {
          include: { LICH_TRINH: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với mã ${maDonHang}`);
    }

    if (order.VE_DIEN_TU.length === 0) {
      throw new BadRequestException('Đơn hàng không chứa vé điện tử nào!');
    }

    // 1. Check edit limit (max 2 times)
    const firstTicket = order.VE_DIEN_TU[0];
    if (firstTicket.SoLanDaSua >= 2) {
      throw new BadRequestException('Bạn đã hết lượt chỉnh sửa thông tin cho vé này (tối đa 2 lần)!');
    }

    // 2. Check time limitation (at least 2 hours before departure)
    const schedule = firstTicket.LICH_TRINH;
    const ngayKhoiHanh = new Date(schedule.NgayKhoiHanh);
    const gioKhoiHanh = new Date(schedule.GioKhoiHanh);
    
    // Combine date and time components
    const departureTime = new Date(ngayKhoiHanh);
    departureTime.setHours(gioKhoiHanh.getHours(), gioKhoiHanh.getMinutes(), 0, 0);

    const diffMs = departureTime.getTime() - Date.now();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 2) {
      throw new BadRequestException('Chỉ có thể sửa thông tin vé trước giờ khởi hành tối thiểu 2 tiếng!');
    }

    // 3. Process database transaction update
    const updated = await this.prisma.$transaction(async (tx) => {
      // Update DON_HANG details
      const uOrder = await tx.dON_HANG.update({
        where: { MaDonHang: maDonHang },
        data: {
          HoTenNguoiDi: dto.HoTenNguoiDi,
          SdtNguoiDi: dto.SdtNguoiDi,
          EmailNguoiDi: dto.EmailNguoiDi || null,
        },
      });

      // Update each E-Ticket
      for (const ticket of order.VE_DIEN_TU) {
        await tx.vE_DIEN_TU.update({
          where: { MaVe: ticket.MaVe },
          data: {
            SoLanDaSua: ticket.SoLanDaSua + 1,
            MaDiemDon: dto.MaDiemDon,
            MaDiemTra: dto.MaDiemTra,
          },
        });

        // Add to E-ticket update history logs
        await tx.lICH_SU_VE.create({
          data: {
            MaLichSu: `LSV_${Date.now()}_${ticket.MaVe}`,
            HanhDong: 'Cập nhật thông tin',
            TrangThaiCu: ticket.TrangThaiVe,
            TrangThaiMoi: ticket.TrangThaiVe,
            ThoiGianThayDoi: new Date(),
            GhiChu: `Khách hàng tự cập nhật thông tin: Người đi (${dto.HoTenNguoiDi}), Trạm đón (${dto.MaDiemDon}), Trạm trả (${dto.MaDiemTra})`,
            MaVe: ticket.MaVe,
            MaKhachHang: order.MaKhachHang,
            MaNVBanVe: '', // Emptied because customer updated online
          },
        });
      }

      return uOrder;
    });

    // Write system log
    await this.nhatKyService.ghiLog({
      MaKhachHang: order.MaKhachHang,
      LoaiThaoTac: 'Sửa thông tin vé',
      NoiDungChiTiet: `Khách hàng chỉnh sửa thông tin đơn hàng ${maDonHang} lần thứ ${firstTicket.SoLanDaSua + 1}`,
      TrangThai: 'Thành công',
    });

    // Re-query with includes to return updated mapped model
    const refreshed = await this.prisma.dON_HANG.findUnique({
      where: { MaDonHang: maDonHang },
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
          },
        },
        THANH_TOAN: true,
      },
    });

    return this.mapOrderToFrontend(refreshed);
  }

  // ===== CANCEL TICKET (REFUND COMPUTATION + SEAT RELEASE + LOG CANCELLATION) =====
  async cancelTicket(maVe: string, lyDo: string) {
    const ticket = await this.prisma.vE_DIEN_TU.findUnique({
      where: { MaVe: maVe },
      include: {
        LICH_TRINH: true,
        DON_HANG: true,
        GHE_CHUYEN_XE: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Không tìm thấy vé với mã ${maVe}`);
    }

    if (ticket.TrangThaiVe === 'DaHuy') {
      throw new BadRequestException('Vé này đã được huỷ bỏ trước đó!');
    }

    // 1. Fetch active cancellation policy
    const policy = await this.prisma.cHINH_SACH_HUY_VE.findFirst({
      where: { TrangThai: TrangThaiChinhSachEnum.DangApDung },
    });

    // 2. Compute remaining time before departure
    const schedule = ticket.LICH_TRINH;
    const ngayKhoiHanh = new Date(schedule.NgayKhoiHanh);
    const gioKhoiHanh = new Date(schedule.GioKhoiHanh);
    
    const departureTime = new Date(ngayKhoiHanh);
    departureTime.setHours(gioKhoiHanh.getHours(), gioKhoiHanh.getMinutes(), 0, 0);

    const diffHours = (departureTime.getTime() - Date.now()) / (1000 * 60 * 60);

    let limitHours = policy ? policy.GioiHanGioTruocKhoiHanh : 12; // default 12 hours
    let tyLePhiHuy = policy ? policy.TyLePhiHuy : 0.0; // default 0% fee if not specified

    // Calculate refund fee depending on hours left if using fallback default policy
    if (!policy) {
      if (diffHours >= 24) {
        tyLePhiHuy = 0.0; // 0% fee -> 100% refund
      } else if (diffHours >= 12) {
        tyLePhiHuy = 0.5; // 50% fee -> 50% refund
      } else {
        tyLePhiHuy = 1.0; // 100% fee -> 0% refund (cancellation denied)
      }
    }

    // Verify time constraint
    if (diffHours < limitHours && tyLePhiHuy === 1.0) {
      throw new BadRequestException(`Không được phép hủy vé trước giờ khởi hành dưới ${limitHours} tiếng!`);
    }

    const price = ticket.GiaVe.toNumber();
    const fee = price * tyLePhiHuy;
    const refund = price - fee;

    const maGiaoDichHoan = `GD_HOAN_${Date.now()}`;

    // Execute cancellation database transaction
    await this.prisma.$transaction(async (tx) => {
      // A. Update ticket status to h_y
      await tx.vE_DIEN_TU.update({
        where: { MaVe: maVe },
        data: { TrangThaiVe: TrangThaiVe.h_y },
      });

      // B. Release seat back to 'C_n_Tr_ng'
      await tx.gHE_CHUYEN_XE.update({
        where: { MaGheChuyen: ticket.MaGheChuyen },
        data: {
          TrangThaiGhe: TrangThaiGhe.C_n_Tr_ng,
          ThoiGianCapNhatTrangThai: new Date(),
        },
      });

      // C. Create refund transaction in THANH_TOAN
      await tx.tHANH_TOAN.create({
        data: {
          MaGiaoDich: maGiaoDichHoan,
          MaDonHang: ticket.MaDonHang,
          LoaiGiaoDich: 'HoanTien',
          PhuongThucThanhToan: 'ChuyenKhoan',
          SoTien: new Prisma.Decimal(refund),
          ThoiGianGiaoDich: new Date(),
          TrangThaiGiaoDich: 'ThanhCong',
          LichSuHoanTien: `Hoàn tiền hủy vé ${maVe}. Số tiền: ${refund}đ (Phí hủy: ${fee}đ)`,
        },
      });

      // D. Create LICH_SU_HUY_VE record
      await tx.lICH_SU_HUY_VE.create({
        data: {
          MaLichSuHuy: `LSHV_${Date.now()}`,
          MaVe: maVe,
          MaChinhSach: policy ? policy.MaChinhSach : 'DEFAULT',
          NguonHuy: 'KhachHang',
          MaKhachHang: ticket.DON_HANG.MaKhachHang,
          MaNVBanVe: null,
          TienVeGoc: ticket.GiaVe,
          TyLePhiHuyApDung: tyLePhiHuy,
          LePhiHuy: new Prisma.Decimal(fee),
          TienHoanLai: new Prisma.Decimal(refund),
          MaGiaoDichHoan: maGiaoDichHoan,
        },
      });

      // E. Create LICH_SU_VE record
      await tx.lICH_SU_VE.create({
        data: {
          MaLichSu: `LSV_${Date.now()}`,
          HanhDong: 'Huỷ vé',
          TrangThaiCu: ticket.TrangThaiVe,
          TrangThaiMoi: TrangThaiVe.h_y,
          ThoiGianThayDoi: new Date(),
          GhiChu: `Khách hàng yêu cầu hủy vé. Lý do: ${lyDo || 'Đổi kế hoạch'}`,
          MaVe: maVe,
          MaKhachHang: ticket.DON_HANG.MaKhachHang,
          MaNVBanVe: '',
        },
      });

      // F. Check if all other tickets in the same order are also h_y. If yes, cancel the whole DON_HANG.
      const otherTickets = await tx.vE_DIEN_TU.findMany({
        where: {
          MaDonHang: ticket.MaDonHang,
          MaVe: { not: maVe },
        },
      });

      const allCancelled = otherTickets.every(t => t.TrangThaiVe === TrangThaiVe.h_y);
      if (allCancelled) {
        await tx.dON_HANG.update({
          where: { MaDonHang: ticket.MaDonHang },
          data: { TrangThaiDonHang: TrangThaiVe.h_y },
        });
      }
    });

    // Write system log
    await this.nhatKyService.ghiLog({
      MaKhachHang: ticket.DON_HANG.MaKhachHang,
      MaVe: maVe,
      LoaiThaoTac: 'Hủy vé',
      NoiDungChiTiet: `Khách hàng hủy vé ${maVe} thành công. Tiền hoàn: ${refund}đ, Phí hủy: ${fee}đ. Lý do: ${lyDo || 'Đổi kế hoạch'}`,
      TrangThai: 'Thành công',
    });

    return {
      success: true,
      message: 'Hủy vé và lập lệnh hoàn tiền thành công!',
      refundAmount: refund,
      feeAmount: fee,
      maGiaoDichHoan,
    };
  }
}
