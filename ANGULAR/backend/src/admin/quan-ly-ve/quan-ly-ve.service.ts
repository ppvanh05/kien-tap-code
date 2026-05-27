import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NhatKyHeThongService } from '../nhat-ky-he-thong/nhat-ky-he-thong.service';

@Injectable()
export class QuanLyVeService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) {}

  // ===== LẤY TẤT CẢ VÉ =====
  async getAllVe() {
    return this.prisma.vE_DIEN_TU.findMany({
      include: {
        DON_HANG: {
          include: {
            KHACH_HANG: true,
          },
        },
        LICH_TRINH: {
          include: {
            TUYEN_XE: true,
          },
        },
        GHE_CHUYEN_XE: true,
        DIEM_DON: true,
        DIEM_TRA: true,
      },
      orderBy: { ThoiGianXuatVe: 'desc' },
    });
  }

  // ===== LẤY VÉ THEO MÃ =====
  async getVeById(id: string) {
    const ve = await this.prisma.vE_DIEN_TU.findUnique({
      where: { MaVe: id },
      include: {
        DON_HANG: {
          include: {
            KHACH_HANG: true,
          },
        },
        LICH_TRINH: {
          include: {
            TUYEN_XE: true,
          },
        },
        GHE_CHUYEN_XE: true,
        DIEM_DON: true,
        DIEM_TRA: true,
        LICH_SU_VE: true,
        LICH_SU_HUY_VE: true,
      },
    });
    if (!ve) throw new NotFoundException(`Không tìm thấy vé với mã ${id}`);
    return ve;
  }

  // ===== LẤY TẤT CẢ ĐƠN HÀNG =====
  async getAllDonHang() {
    return this.prisma.dON_HANG.findMany({
      include: {
        KHACH_HANG: true,
        VE_DIEN_TU: true,
        THANH_TOAN: true,
      },
      orderBy: { ThoiGianDat: 'desc' },
    });
  }

  // ===== LẤY ĐƠN HÀNG THEO MÃ =====
  async getDonHangById(id: string) {
    const donHang = await this.prisma.dON_HANG.findUnique({
      where: { MaDonHang: id },
      include: {
        KHACH_HANG: true,
        VE_DIEN_TU: {
          include: {
            LICH_TRINH: {
              include: { TUYEN_XE: true },
            },
            GHE_CHUYEN_XE: true,
            DIEM_DON: true,
            DIEM_TRA: true,
          },
        },
        THANH_TOAN: true,
      },
    });
    if (!donHang) throw new NotFoundException(`Không tìm thấy đơn hàng với mã ${id}`);
    return donHang;
  }

  private mapTrangThaiVe(trangThai: string): any {
    if (trangThai === 'DaHuy' || trangThai === 'h_y' || trangThai === 'Huy') {
      return 'h_y';
    }
    if (trangThai === 'ConHieuLuc' || trangThai === 'Ch__kh_i_h_nh' || trangThai === 'ChoKhoiHanh') {
      return 'Ch__kh_i_h_nh';
    }
    if (trangThai === 'HoanThanh' || trangThai === 'ho_n_th_nh') {
      return 'ho_n_th_nh';
    }
    return 'Ch__thanh_to_n';
  }

  // ===== CẬP NHẬT TRẠNG THÁI VÉ =====
  async updateTrangThaiVe(id: string, trangThai: string, maNhanVien?: string) {
    const ve = await this.getVeById(id);
    const oldTrangThai = ve.TrangThaiVe;
    const mappedStatus = this.mapTrangThaiVe(trangThai);

    const updatedVe = await this.prisma.vE_DIEN_TU.update({
      where: { MaVe: id },
      data: { TrangThaiVe: mappedStatus },
    });

    await this.prisma.lICH_SU_VE.create({
      data: {
        MaLichSu: `LSV_${Date.now()}`,
        HanhDong: 'Cập nhật trạng thái vé',
        TrangThaiCu: oldTrangThai,
        TrangThaiMoi: mappedStatus,
        ThoiGianThayDoi: new Date(),
        GhiChu: 'Cập nhật trạng thái vé bởi quản trị viên',
        MaVe: id,
        MaKhachHang: ve.DON_HANG?.MaKhachHang || '',
        MaNVBanVe: maNhanVien || ve.DON_HANG?.MaNVBanVe || '',
      },
    });

    this.nhatKyService.ghiLog({
      MaNhanVien: maNhanVien || 'NVDP001',
      MaVe: id,
      LoaiThaoTac: 'Quản lý vé',
      NoiDungChiTiet: `Cập nhật trạng thái vé ${id} từ ${oldTrangThai} sang ${mappedStatus}`,
      TrangThai: 'Thành công',
      TrangThaiCu: oldTrangThai,
      TrangThaiMoi: mappedStatus,
      DuLieuThayDoi: [
        { truong: 'TrangThaiVe', giaTriCu: oldTrangThai, giaTriMoi: mappedStatus },
      ],
    });

    return updatedVe;
  }

  // ===== HUỶ VÉ =====
  async huyVe(id: string, lyDo: string, maNVBanVe?: string) {
    const ve = await this.getVeById(id);
    
    if (ve.TrangThaiVe === 'h_y') {
      throw new BadRequestException('Vé này đã được huỷ trước đó!');
    }

    const chinhSachHuyVe = await this.prisma.cHINH_SACH_HUY_VE.findFirst({
      where: { TrangThai: 'DangApDung' },
    });

    if (!chinhSachHuyVe) {
      throw new BadRequestException('Không tìm thấy chính sách huỷ vé hiện hành!');
    }

    const ngayKhoiHanh = new Date(ve.LICH_TRINH.NgayKhoiHanh);
    const gioKhoiHanh = ve.LICH_TRINH.GioKhoiHanh;
    const thoiGianKhoiHanh = new Date(ngayKhoiHanh);
    if (typeof gioKhoiHanh === 'string') {
      const [hours, minutes] = (gioKhoiHanh as string).split(':').map(Number);
      thoiGianKhoiHanh.setHours(hours, minutes, 0, 0);
    } else if (gioKhoiHanh instanceof Date) {
      thoiGianKhoiHanh.setHours(gioKhoiHanh.getHours(), gioKhoiHanh.getMinutes(), 0, 0);
    }

    const thoiGianHienTai = new Date();
    const soGioConLai = (thoiGianKhoiHanh.getTime() - thoiGianHienTai.getTime()) / (1000 * 60 * 60);

    if (soGioConLai < chinhSachHuyVe.GioiHanGioTruocKhoiHanh) {
      throw new BadRequestException(
        `Đã quá thời gian cho phép huỷ vé (phải huỷ trước ${chinhSachHuyVe.GioiHanGioTruocKhoiHanh} giờ trước khi khởi hành)!`,
      );
    }

    const tyLePhiHuy = chinhSachHuyVe.TyLePhiHuy;
    const lePhiHuy = ve.GiaVe.toNumber() * tyLePhiHuy;
    const tienHoanLai = ve.GiaVe.toNumber() - lePhiHuy;

    const updatedVe = await this.prisma.vE_DIEN_TU.update({
      where: { MaVe: id },
      data: { TrangThaiVe: 'h_y' },
    });

    const maGiaoDichHoan = `GD_HOAN_${Date.now()}`;
    await this.prisma.tHANH_TOAN.create({
      data: {
        MaGiaoDich: maGiaoDichHoan,
        MaDonHang: ve.MaDonHang,
        LoaiGiaoDich: 'HoanTien',
        PhuongThucThanhToan: 'ChuyenKhoan',
        SoTien: new Prisma.Decimal(tienHoanLai),
        ThoiGianGiaoDich: new Date(),
        TrangThaiGiaoDich: 'ThanhCong',
        LichSuHoanTien: '',
      },
    });

    await this.prisma.lICH_SU_HUY_VE.create({
      data: {
        MaLichSuHuy: `LSHV_${Date.now()}`,
        MaVe: id,
        MaChinhSach: chinhSachHuyVe.MaChinhSach,
        NguonHuy: 'QuanTriVien',
        MaKhachHang: ve.DON_HANG?.MaKhachHang,
        MaNVBanVe: maNVBanVe,
        TienVeGoc: ve.GiaVe,
        TyLePhiHuyApDung: tyLePhiHuy,
        LePhiHuy: new Prisma.Decimal(lePhiHuy),
        TienHoanLai: new Prisma.Decimal(tienHoanLai),
        MaGiaoDichHoan: maGiaoDichHoan,
      },
    });

    await this.prisma.lICH_SU_VE.create({
      data: {
        MaLichSu: `LSV_${Date.now()}`,
        HanhDong: 'Huỷ vé',
        TrangThaiCu: ve.TrangThaiVe,
        TrangThaiMoi: 'h_y',
        ThoiGianThayDoi: new Date(),
        GhiChu: lyDo,
        MaVe: id,
        MaKhachHang: ve.DON_HANG?.MaKhachHang || '',
        MaNVBanVe: maNVBanVe || '',
      },
    });

    this.nhatKyService.ghiLog({
      MaNhanVien: maNVBanVe || 'NVDP001',
      MaVe: id,
      MaKhachHang: ve.DON_HANG?.MaKhachHang,
      LoaiThaoTac: 'Quản lý vé',
      NoiDungChiTiet: `Huỷ vé ${id}. Lý do: ${lyDo}. Tiền hoàn lại: ${tienHoanLai}`,
      TrangThai: 'Thành công',
      TrangThaiCu: ve.TrangThaiVe,
      TrangThaiMoi: 'h_y',
      DuLieuThayDoi: [
        { truong: 'TrangThaiVe', giaTriCu: ve.TrangThaiVe, giaTriMoi: 'h_y' },
        { truong: 'LyDoHuy', giaTriCu: null, giaTriMoi: lyDo },
        { truong: 'TienHoanLai', giaTriCu: null, giaTriMoi: tienHoanLai },
      ],
    });

    return updatedVe;
  }
}
