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

  private unique(values: Array<string | null | undefined>): string[] {
    return Array.from(new Set(values.filter((value): value is string => !!value)));
  }

  private toNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value?.toNumber === 'function') return value.toNumber();
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private formatMoney(value: any): string {
    return `${this.toNumber(value).toLocaleString('vi-VN')}đ`;
  }

  private formatDate(value?: Date | string | null): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  }

  private formatTime(value?: Date | string | null): string {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  private formatCode(prefix: string, width: number, value: number): string {
    return `${prefix}${String(value).padStart(width, '0')}`;
  }

  private getNumberPart(id: string | null | undefined, prefix: string): number {
    if (!id?.startsWith(prefix)) return 0;
    const parsed = Number(id.slice(prefix.length));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private nextNumber(ids: string[], prefix: string, minValue: number): number {
    const max = ids.reduce((current, id) => Math.max(current, this.getNumberPart(id, prefix)), 0);
    return Math.max(max + 1, minValue);
  }

  private async nextDonHangCode(): Promise<string> {
    const rows = await this.prisma.dON_HANG.findMany({
      where: { MaDonHang: { startsWith: 'DH' } },
      select: { MaDonHang: true },
      take: 2000,
    });
    return this.formatCode('DH', 8, this.nextNumber(rows.map(row => row.MaDonHang), 'DH', 10000001));
  }

  private async nextVeNumber(): Promise<number> {
    const rows = await this.prisma.vE_DIEN_TU.findMany({
      where: { MaVe: { startsWith: 'VE' } },
      select: { MaVe: true },
      take: 3000,
    });
    return this.nextNumber(rows.map(row => row.MaVe), 'VE', 100001);
  }

  private async nextGiaoDichNumber(): Promise<number> {
    const rows = await this.prisma.tHANH_TOAN.findMany({
      where: { MaGiaoDich: { startsWith: 'GD' } },
      select: { MaGiaoDich: true },
      take: 3000,
    });
    return this.nextNumber(rows.map(row => row.MaGiaoDich), 'GD', 100001);
  }

  private async nextKhachHangCode(): Promise<string> {
    const rows = await this.prisma.kHACH_HANG.findMany({
      where: { MaKhachHang: { startsWith: 'KH' } },
      select: { MaKhachHang: true },
      take: 3000,
    });
    return this.formatCode('KH', 6, this.nextNumber(rows.map(row => row.MaKhachHang), 'KH', 100001));
  }

  private async resolveTicketSeller(maNVBanVe?: string): Promise<string | undefined> {
    if (!maNVBanVe) return undefined;
    const seller = await this.prisma.nHAN_VIEN_BAN_VE.findUnique({
      where: { MaNVBanVe: maNVBanVe },
      select: { MaNVBanVe: true },
    });
    return seller?.MaNVBanVe;
  }

  private async resolveCustomer(data: {
    maKhachHang?: string;
    hoTenNguoiDi?: string;
    sdtNguoiDi?: string;
    emailNguoiDi?: string;
  }): Promise<string> {
    if (data.maKhachHang) {
      const existingById = await this.prisma.kHACH_HANG.findUnique({
        where: { MaKhachHang: data.maKhachHang },
      });
      if (existingById) return existingById.MaKhachHang;
    }

    const phone = data.sdtNguoiDi?.trim();
    if (phone) {
      const existingByPhone = await this.prisma.kHACH_HANG.findFirst({
        where: { SoDienThoai: phone },
      });
      if (existingByPhone) {
        await this.prisma.kHACH_HANG.update({
          where: { MaKhachHang: existingByPhone.MaKhachHang },
          data: {
            HoTenKhachHang: data.hoTenNguoiDi?.trim() || existingByPhone.HoTenKhachHang,
            Email: data.emailNguoiDi?.trim() || existingByPhone.Email,
          },
        });
        return existingByPhone.MaKhachHang;
      }
    }

    const maKhachHang = await this.nextKhachHangCode();
    await this.prisma.kHACH_HANG.create({
      data: {
        MaKhachHang: maKhachHang,
        HoTenKhachHang: data.hoTenNguoiDi?.trim() || 'Khach dat ve',
        SoDienThoai: phone || `090${Date.now().toString().slice(-7)}`,
        Email: data.emailNguoiDi?.trim() || null,
        MatKhau: 'Khachhang@123',
        GioiTinh: 'Nam',
        NgaySinh: null,
        TrangThaiTaiKhoan: 'HoatDong',
        NgayDangKy: new Date(),
      },
    });
    return maKhachHang;
  }

  private async resolveTripStop(maLichTrinh: string, maDiem?: string, fallback: 'first' | 'last' = 'first'): Promise<string> {
    if (maDiem) {
      const stop = await this.prisma.dIEM_DON_TRA_DUNG.findUnique({
        where: { MaDiem: maDiem },
        select: { MaDiem: true },
      });
      if (stop) return stop.MaDiem;
    }

    const stop = await this.prisma.lICH_TRINH_DIEM_DUNG.findFirst({
      where: { MaLichTrinh: maLichTrinh },
      orderBy: { ThuTuDung: fallback === 'first' ? 'asc' : 'desc' },
      select: { MaDiem: true },
    });
    if (!stop) throw new BadRequestException('Lich trinh chua co diem don/tra hop le.');
    return stop.MaDiem;
  }

  private mapTicketStatus(status?: string | null): string {
    const map: Record<string, string> = {
      ChoThanhToan: 'Chờ thanh toán',
      ChoKhoiHanh: 'Chờ khởi hành',
      DaHoanThanh: 'Đã hoàn thành',
      DaHuy: 'Đã hủy',
    };
    return status ? map[status] || status : 'Chưa xác định';
  }

  private mapPaymentMethod(method?: string | null): string {
    const map: Record<string, string> = {
      VietQR: 'VietQR',
      MoMo: 'MoMo',
      VNPay: 'VNPay',
      ZaloPay: 'ZaloPay',
      ATM: 'ATM nội địa',
      VisaMaster: 'Visa/Master/JCB',
      TienMat: 'Tiền mặt',
    };
    return method ? map[method] || method : 'Chưa thanh toán';
  }

  private mapPaymentStatus(donHang: any, thanhToanList: any[], trangThaiVe?: string | null): string {
    const latestPayment = thanhToanList[0];
    const paidPayment = thanhToanList.find(
      item => item.LoaiGiaoDich === 'ThanhToan' && item.TrangThaiGiaoDich === 'ThanhCong',
    );
    const refundPayment = thanhToanList.find(item => item.LoaiGiaoDich === 'HoanTien');

    if (trangThaiVe === 'DaHuy' && !paidPayment) return 'Đã hủy';
    if (refundPayment?.TrangThaiGiaoDich === 'ThanhCong') return 'Đã hoàn tiền';
    if (refundPayment) return 'Chờ hoàn tiền';
    if (paidPayment) return 'Đã thanh toán';
    if (latestPayment?.TrangThaiGiaoDich === 'DaHuy' || donHang?.TrangThaiDonHang === 'DaHuy') return 'Đã hủy';
    if (trangThaiVe === 'DaHuy') return 'Đã hủy';
    return 'Chờ thanh toán';
  }

  private async hydrateVeList(veList: any[]) {
    if (veList.length === 0) return [];

    const donHangIds = this.unique(veList.map(ve => ve.MaDonHang));
    const lichTrinhIds = this.unique(veList.map(ve => ve.MaLichTrinh));
    const gheChuyenIds = this.unique(veList.map(ve => ve.MaGheChuyen));
    const diemIds = this.unique([
      ...veList.map(ve => ve.MaDiemDon),
      ...veList.map(ve => ve.MaDiemTra),
    ]);

    const [donHangList, lichTrinhList, gheChuyenList, diemList, thanhToanList] = await Promise.all([
      donHangIds.length
        ? this.prisma.dON_HANG.findMany({ where: { MaDonHang: { in: donHangIds } } })
        : Promise.resolve([]),
      lichTrinhIds.length
        ? this.prisma.lICH_TRINH.findMany({ where: { MaLichTrinh: { in: lichTrinhIds } } })
        : Promise.resolve([]),
      gheChuyenIds.length
        ? this.prisma.gHE_CHUYEN_XE.findMany({ where: { MaGheChuyen: { in: gheChuyenIds } } })
        : Promise.resolve([]),
      diemIds.length
        ? this.prisma.dIEM_DON_TRA_DUNG.findMany({ where: { MaDiem: { in: diemIds } } })
        : Promise.resolve([]),
      donHangIds.length
        ? this.prisma.tHANH_TOAN.findMany({
            where: { MaDonHang: { in: donHangIds } },
            orderBy: { ThoiGianGiaoDich: 'desc' },
          })
        : Promise.resolve([]),
    ]);

    const khachHangIds = this.unique(donHangList.map(donHang => donHang.MaKhachHang));
    const tuyenXeIds = this.unique(lichTrinhList.map(lichTrinh => lichTrinh.MaTuyenXe));
    const maGheIds = this.unique(gheChuyenList.map(gheChuyen => gheChuyen.MaGhe));
    const maXeIds = this.unique([
      ...veList.map(ve => ve.MaXe),
      ...lichTrinhList.map(lichTrinh => lichTrinh.MaXe),
    ]);

    const [khachHangList, tuyenXeList, gheList, phuongTienList] = await Promise.all([
      khachHangIds.length
        ? this.prisma.kHACH_HANG.findMany({ where: { MaKhachHang: { in: khachHangIds } } })
        : Promise.resolve([]),
      tuyenXeIds.length
        ? this.prisma.tUYEN_XE.findMany({ where: { MaTuyenXe: { in: tuyenXeIds } } })
        : Promise.resolve([]),
      maGheIds.length
        ? this.prisma.gHE.findMany({ where: { MaGhe: { in: maGheIds } } })
        : Promise.resolve([]),
      maXeIds.length
        ? this.prisma.pHUONG_TIEN.findMany({ where: { MaXe: { in: maXeIds } } })
        : Promise.resolve([]),
    ]);

    const donHangById = new Map(donHangList.map(item => [item.MaDonHang, item]));
    const khachHangById = new Map(khachHangList.map(item => [item.MaKhachHang, item]));
    const lichTrinhById = new Map(lichTrinhList.map(item => [item.MaLichTrinh, item]));
    const tuyenXeById = new Map(tuyenXeList.map(item => [item.MaTuyenXe, item]));
    const gheChuyenById = new Map(gheChuyenList.map(item => [item.MaGheChuyen, item]));
    const gheById = new Map(gheList.map(item => [item.MaGhe, item]));
    const diemById = new Map(diemList.map(item => [item.MaDiem, item]));
    const phuongTienById = new Map(phuongTienList.map(item => [item.MaXe, item]));
    const thanhToanByDonHang = new Map<string, any[]>();

    thanhToanList.forEach(thanhToan => {
      const list = thanhToanByDonHang.get(thanhToan.MaDonHang) || [];
      list.push(thanhToan);
      thanhToanByDonHang.set(thanhToan.MaDonHang, list);
    });

    return veList.map(ve => {
      const donHang = donHangById.get(ve.MaDonHang) || null;
      const khachHang = donHang ? khachHangById.get(donHang.MaKhachHang) || null : null;
      const lichTrinh = lichTrinhById.get(ve.MaLichTrinh) || null;
      const tuyenXe = lichTrinh ? tuyenXeById.get(lichTrinh.MaTuyenXe) || null : null;
      const gheChuyen = gheChuyenById.get(ve.MaGheChuyen) || null;
      const ghe = gheChuyen ? gheById.get(gheChuyen.MaGhe) || null : null;
      const diemDon = diemById.get(ve.MaDiemDon) || null;
      const diemTra = diemById.get(ve.MaDiemTra) || null;
      const phuongTien = phuongTienById.get(ve.MaXe || lichTrinh?.MaXe) || null;
      const thanhToan = thanhToanByDonHang.get(ve.MaDonHang) || [];
      const latestPayment = thanhToan[0];
      const routeName = tuyenXe?.TenTuyenXe || (
        tuyenXe ? `${tuyenXe.DiemKhoiHanh} → ${tuyenXe.DiemDen}` : 'Chưa rõ tuyến'
      );
      const customerName = donHang?.HoTenNguoiDi || khachHang?.HoTenKhachHang || 'Chưa rõ khách';
      const phone = donHang?.SdtNguoiDi || khachHang?.SoDienThoai || '';
      const seatName = ghe?.SoGhe || gheChuyen?.NhomGhe || ve.MaGheChuyen;
      const paymentStatus = this.mapPaymentStatus(donHang, thanhToan, ve.TrangThaiVe);
      const paymentMethod = this.mapPaymentMethod(
        latestPayment?.PhuongThucThanhToan || donHang?.PhuongThucThanhToan,
      );

      return {
        ...ve,
        DON_HANG: donHang ? { ...donHang, KHACH_HANG: khachHang, THANH_TOAN: thanhToan } : null,
        KHACH_HANG: khachHang,
        THANH_TOAN: thanhToan,
        LICH_TRINH: lichTrinh ? { ...lichTrinh, TUYEN_XE: tuyenXe, PHUONG_TIEN: phuongTien } : null,
        TUYEN_XE: tuyenXe,
        GHE_CHUYEN_XE: gheChuyen ? { ...gheChuyen, GHE: ghe } : null,
        GHE: ghe,
        DIEM_DON: diemDon,
        DIEM_TRA: diemTra,
        PHUONG_TIEN: phuongTien,
        maVe: ve.MaVe,
        maDonHang: ve.MaDonHang,
        tenKhachHang: customerName,
        soDienThoai: phone,
        tuyenXe: routeName,
        ngayDi: this.formatDate(lichTrinh?.NgayKhoiHanh || ve.ThoiGianXuatVe),
        gioDi: this.formatTime(lichTrinh?.GioKhoiHanh),
        soGhe: seatName,
        bienSoXe: phuongTien?.BienSoXe || '',
        giaVe: this.toNumber(ve.GiaVe),
        giaVeText: this.formatMoney(ve.GiaVe),
        trangThaiVe: ve.TrangThaiVe,
        trangThaiVeText: this.mapTicketStatus(ve.TrangThaiVe),
        trangThaiThanhToan: paymentStatus,
        phuongThucThanhToan: paymentMethod,
        diemDon: diemDon?.TenDiem || '',
        diemTra: diemTra?.TenDiem || '',
        display: {
          id: ve.MaVe,
          customer: customerName,
          phone,
          route: routeName,
          date: this.formatDate(lichTrinh?.NgayKhoiHanh || ve.ThoiGianXuatVe),
          arrivalDate: this.formatDate(lichTrinh?.NgayKhoiHanh || ve.ThoiGianXuatVe),
          time: this.formatTime(lichTrinh?.GioKhoiHanh),
          total: this.formatMoney(ve.GiaVe),
          paymentStatus,
          ticketStatus: this.mapTicketStatus(ve.TrangThaiVe),
          paymentMethod,
          seat: seatName,
        },
      };
    });
  }

  private async hydrateDonHangList(donHangList: any[]) {
    if (donHangList.length === 0) return [];

    const donHangIds = this.unique(donHangList.map(donHang => donHang.MaDonHang));
    const khachHangIds = this.unique(donHangList.map(donHang => donHang.MaKhachHang));

    const [khachHangList, thanhToanList, veList] = await Promise.all([
      khachHangIds.length
        ? this.prisma.kHACH_HANG.findMany({ where: { MaKhachHang: { in: khachHangIds } } })
        : Promise.resolve([]),
      donHangIds.length
        ? this.prisma.tHANH_TOAN.findMany({
            where: { MaDonHang: { in: donHangIds } },
            orderBy: { ThoiGianGiaoDich: 'desc' },
          })
        : Promise.resolve([]),
      donHangIds.length
        ? this.prisma.vE_DIEN_TU.findMany({ where: { MaDonHang: { in: donHangIds } } })
        : Promise.resolve([]),
    ]);

    const hydratedVeList = await this.hydrateVeList(veList);
    const khachHangById = new Map(khachHangList.map(item => [item.MaKhachHang, item]));
    const thanhToanByDonHang = new Map<string, any[]>();
    const veByDonHang = new Map<string, any[]>();

    thanhToanList.forEach(thanhToan => {
      const list = thanhToanByDonHang.get(thanhToan.MaDonHang) || [];
      list.push(thanhToan);
      thanhToanByDonHang.set(thanhToan.MaDonHang, list);
    });

    hydratedVeList.forEach(ve => {
      const list = veByDonHang.get(ve.MaDonHang) || [];
      list.push(ve);
      veByDonHang.set(ve.MaDonHang, list);
    });

    return donHangList.map(donHang => {
      const khachHang = khachHangById.get(donHang.MaKhachHang) || null;
      const thanhToan = thanhToanByDonHang.get(donHang.MaDonHang) || [];
      const ve = veByDonHang.get(donHang.MaDonHang) || [];
      const paymentStatus = this.mapPaymentStatus(donHang, thanhToan, donHang.TrangThaiDonHang);

      return {
        ...donHang,
        KHACH_HANG: khachHang,
        THANH_TOAN: thanhToan,
        VE_DIEN_TU: ve,
        maDonHang: donHang.MaDonHang,
        tenKhachHang: donHang.HoTenNguoiDi || khachHang?.HoTenKhachHang || 'Chưa rõ khách',
        soDienThoai: donHang.SdtNguoiDi || khachHang?.SoDienThoai || '',
        tongGiaVe: this.toNumber(donHang.TongGiaVe),
        tongGiaVeText: this.formatMoney(donHang.TongGiaVe),
        soLuongVe: donHang.SoLuongVeDaDat || ve.length,
        trangThaiDonHangText: this.mapTicketStatus(donHang.TrangThaiDonHang),
        trangThaiThanhToan: paymentStatus,
        phuongThucThanhToan: this.mapPaymentMethod(thanhToan[0]?.PhuongThucThanhToan || donHang.PhuongThucThanhToan),
      };
    });
  }

  // ===== LẤY TẤT CẢ VÉ =====
  async getAllVe(limit?: number) {
    const veList = await this.prisma.vE_DIEN_TU.findMany({
      orderBy: { ThoiGianXuatVe: 'desc' },
      take: limit,
    });

    return this.hydrateVeList(veList);
  }

  async getStats() {
    const total = await this.prisma.vE_DIEN_TU.count();
    const pendingCount = await this.prisma.vE_DIEN_TU.count({
      where: {
        OR: [
          { TrangThaiVe: 'ChoThanhToan' },
          { DON_HANG: { TrangThaiDonHang: 'ChoThanhToan' } }
        ]
      }
    });
    const canceledCount = await this.prisma.vE_DIEN_TU.count({
      where: {
        OR: [
          { TrangThaiVe: 'DaHuy' },
          { DON_HANG: { TrangThaiDonHang: 'DaHuy' } }
        ]
      }
    });

    const successfulPayments = await this.prisma.tHANH_TOAN.findMany({
      where: {
        LoaiGiaoDich: 'ThanhToan',
        TrangThaiGiaoDich: 'ThanhCong',
      },
      select: {
        SoTien: true,
      }
    });
    const revenue = successfulPayments.reduce((sum, item) => sum + this.toNumber(item.SoTien), 0);

    return {
      total,
      pendingCount,
      canceledCount,
      revenue,
    };
  }

  // ===== LẤY VÉ THEO MÃ =====
  async getVeById(id: string) {
    const ve = await this.prisma.vE_DIEN_TU.findUnique({
      where: { MaVe: id },
    });
    if (!ve) throw new NotFoundException(`Không tìm thấy vé với mã ${id}`);

    const [hydratedVe] = await this.hydrateVeList([ve]);
    const [lichSuVe, lichSuHuyVe] = await Promise.all([
      this.prisma.lICH_SU_VE.findMany({
        where: { MaVe: id },
        orderBy: { ThoiGianThayDoi: 'desc' },
      }),
      this.prisma.lICH_SU_HUY_VE.findMany({
        where: { MaVe: id },
      }),
    ]);

    return {
      ...hydratedVe,
      LICH_SU_VE: lichSuVe,
      LICH_SU_HUY_VE: lichSuHuyVe,
    };
  }

  // ===== LẤY TẤT CẢ ĐƠN HÀNG =====
  async getAllDonHang() {
    const donHangList = await this.prisma.dON_HANG.findMany({
      orderBy: { ThoiGianDat: 'desc' },
    });

    return this.hydrateDonHangList(donHangList);
  }

  // ===== LẤY ĐƠN HÀNG THEO MÃ =====
  async getDonHangById(id: string) {
    const donHang = await this.prisma.dON_HANG.findUnique({
      where: { MaDonHang: id },
    });
    if (!donHang) throw new NotFoundException(`Không tìm thấy đơn hàng với mã ${id}`);

    const [hydratedDonHang] = await this.hydrateDonHangList([donHang]);
    return hydratedDonHang;
  }

  private mapTrangThaiVe(trangThai: string): any {
    if (trangThai === 'DaHuy' || trangThai === 'h_y' || trangThai === 'Huy') {
      return 'DaHuy';
    }
    if (trangThai === 'ConHieuLuc' || trangThai === 'Ch__kh_i_h_nh' || trangThai === 'ChoKhoiHanh') {
      return 'ChoKhoiHanh';
    }
    if (trangThai === 'HoanThanh' || trangThai === 'ho_n_th_nh') {
      return 'DaHoanThanh';
    }
    return 'ChoThanhToan';
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
      MaNhanVien: maNhanVien || 'NVDP100001',
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

  // ===== TẠO ĐƠN HÀNG VÀ VÉ MỚI (CHO NHÂN VIÊN ĐẶT VÉ) =====
  async taoDonHangVaVe(data: {
    maKhachHang?: string;
    maNVBanVe?: string;
    hoTenNguoiDi?: string;
    sdtNguoiDi?: string;
    emailNguoiDi?: string;
    maLichTrinh: string;
    maGheChuyenList: string[];
    maDiemDon?: string;
    maDiemTra?: string;
    phuongThucThanhToan: string;
    ghiChu?: string;
  }) {
    if (!data.maLichTrinh) throw new BadRequestException('Thiếu mã lịch trình.');
    if (!Array.isArray(data.maGheChuyenList) || data.maGheChuyenList.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một ghế.');
    }

    const maDonHang = await this.nextDonHangCode();
    const maKhachHang = await this.resolveCustomer(data);
    const maNVBanVe = await this.resolveTicketSeller(data.maNVBanVe);
    const maDiemDon = await this.resolveTripStop(data.maLichTrinh, data.maDiemDon, 'first');
    const maDiemTra = await this.resolveTripStop(data.maLichTrinh, data.maDiemTra, 'last');

    const lichTrinh = await this.prisma.lICH_TRINH.findUnique({
      where: { MaLichTrinh: data.maLichTrinh },
      include: { GHE_CHUYEN_XE: true },
    });
    if (!lichTrinh) throw new NotFoundException('Không tìm thấy lịch trình!');

    let tongGiaVe = 0;
    const gheDaChon = data.maGheChuyenList.map(maGheChuyen => {
      const ghe = lichTrinh.GHE_CHUYEN_XE.find(g => g.MaGheChuyen === maGheChuyen);
      if (!ghe) throw new NotFoundException(`Không tìm thấy ghế ${maGheChuyen}!`);
      if (ghe.TrangThaiGhe !== 'Trong') throw new BadRequestException(`Ghế ${maGheChuyen} không còn trống.`);
      tongGiaVe += ghe.GiaVe.toNumber();
      return ghe;
    });

    const isCashPayment = data.phuongThucThanhToan === 'TienMat';
    const initialStatus = isCashPayment ? 'ChoThanhToan' : 'ChoKhoiHanh';

    const donHang = await this.prisma.dON_HANG.create({
      data: {
        MaDonHang: maDonHang,
        MaKhachHang: maKhachHang,
        MaNVBanVe: maNVBanVe,
        HoTenNguoiDi: data.hoTenNguoiDi,
        SdtNguoiDi: data.sdtNguoiDi,
        EmailNguoiDi: data.emailNguoiDi,
        ThoiGianDat: new Date(),
        SoLuongVeDaDat: data.maGheChuyenList.length,
        TongGiaVe: new Prisma.Decimal(tongGiaVe),
        PhuongThucThanhToan: data.phuongThucThanhToan as any,
        TrangThaiDonHang: initialStatus,
      },
    });

    const veList = [];
    const nextVe = await this.nextVeNumber();
    for (const [index, ghe] of gheDaChon.entries()) {
      const maVe = this.formatCode('VE', 6, nextVe + index);
      const ve = await this.prisma.vE_DIEN_TU.create({
        data: {
          MaVe: maVe,
          GiaVe: ghe.GiaVe,
          TrangThaiVe: initialStatus,
          SoLanDaSua: 0,
          ThoiGianXuatVe: new Date(),
          MaQRVe: maVe,
          MaDonHang: maDonHang,
          MaLichTrinh: data.maLichTrinh,
          MaXe: lichTrinh.MaXe,
          MaGheChuyen: ghe.MaGheChuyen,
          MaDiemDon: maDiemDon,
          MaDiemTra: maDiemTra,
        },
      });
      veList.push(ve);

      await this.prisma.gHE_CHUYEN_XE.update({
        where: { MaGheChuyen: ghe.MaGheChuyen },
        data: { 
          TrangThaiGhe: 'DaBan',
          ThoiGianCapNhatTrangThai: new Date()
        },
      });
    }

    if (isCashPayment) {
      const maGiaoDich = this.formatCode('GD', 6, await this.nextGiaoDichNumber());
      await this.prisma.tHANH_TOAN.create({
        data: {
          MaGiaoDich: maGiaoDich,
          MaDonHang: maDonHang,
          LoaiGiaoDich: 'ThanhToan',
          PhuongThucThanhToan: data.phuongThucThanhToan as any,
          SoTien: new Prisma.Decimal(tongGiaVe),
          ThoiGianGiaoDich: new Date(),
          TrangThaiGiaoDich: 'ThanhCong',
          LichSuHoanTien: data.ghiChu || '',
        },
      });
    }

    this.nhatKyService.ghiLog({
      MaNhanVien: maNVBanVe || 'NVBV100001',
      LoaiThaoTac: 'Quản lý vé',
      NoiDungChiTiet: `Tạo đơn hàng ${maDonHang} với ${data.maGheChuyenList.length} vé`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: [
        { truong: 'MaDonHang', giaTriMoi: maDonHang },
        { truong: 'SoLuongVe', giaTriMoi: data.maGheChuyenList.length },
        { truong: 'TongGiaVe', giaTriMoi: tongGiaVe },
      ],
    });

    return {
      donHang: await this.getDonHangById(donHang.MaDonHang),
      veList: await this.hydrateVeList(veList),
    };
  }

  async xacNhanThuTienMat(id: string, maNVBanVe?: string) {
    const ve = await this.getVeById(id);
    const maNV = await this.resolveTicketSeller(maNVBanVe || ve.DON_HANG?.MaNVBanVe);
    const paidPayment = (ve.THANH_TOAN || []).find(
      item => item.LoaiGiaoDich === 'ThanhToan' && item.TrangThaiGiaoDich === 'ThanhCong',
    );

    if (paidPayment) {
      return {
        message: 'Vé đã được xác nhận thanh toán trước đó.',
        donHang: await this.getDonHangById(ve.MaDonHang),
      };
    }

    const maGiaoDich = this.formatCode('GD', 6, await this.nextGiaoDichNumber());
    await this.prisma.tHANH_TOAN.create({
      data: {
        MaGiaoDich: maGiaoDich,
        MaDonHang: ve.MaDonHang,
        LoaiGiaoDich: 'ThanhToan',
        PhuongThucThanhToan: 'TienMat',
        SoTien: ve.GiaVe,
        ThoiGianGiaoDich: new Date(),
        TrangThaiGiaoDich: 'ThanhCong',
        LichSuHoanTien: '',
      },
    });

    await this.prisma.dON_HANG.update({
      where: { MaDonHang: ve.MaDonHang },
      data: {
        PhuongThucThanhToan: 'TienMat',
        TrangThaiDonHang: 'ChoKhoiHanh',
      },
    });

    await this.prisma.vE_DIEN_TU.updateMany({
      where: { MaDonHang: ve.MaDonHang, TrangThaiVe: 'ChoThanhToan' },
      data: { TrangThaiVe: 'ChoKhoiHanh' },
    });

    await this.prisma.lICH_SU_VE.create({
      data: {
        MaLichSu: `LSV_${Date.now()}`,
        HanhDong: 'Xác nhận thu tiền mặt',
        TrangThaiCu: ve.TrangThaiVe,
        TrangThaiMoi: 'ChoKhoiHanh',
        ThoiGianThayDoi: new Date(),
        GhiChu: 'Nhân viên xác nhận đã nhận tiền mặt',
        MaVe: id,
        MaKhachHang: ve.DON_HANG?.MaKhachHang,
        MaNVBanVe: maNV,
      },
    });

    this.nhatKyService.ghiLog({
      MaNhanVien: maNV || 'NVBV100001',
      MaVe: id,
      MaKhachHang: ve.DON_HANG?.MaKhachHang,
      LoaiThaoTac: 'Quản lý vé',
      NoiDungChiTiet: `Xác nhận thu tiền mặt cho vé ${id}`,
      TrangThai: 'Thành công',
      TrangThaiCu: ve.TrangThaiVe,
      TrangThaiMoi: 'ChoKhoiHanh',
      DuLieuThayDoi: [
        { truong: 'ThanhToan', giaTriCu: 'ChoThanhToan', giaTriMoi: 'ThanhCong' },
      ],
    });

    return {
      message: 'Đã xác nhận thu tiền mặt.',
      donHang: await this.getDonHangById(ve.MaDonHang),
    };
  }

  private async buildCancelQuote(ve: any) {
    const chinhSachHuyVe = await this.prisma.cHINH_SACH_HUY_VE.findFirst({
      where: { TrangThai: 'DangApDung' },
      orderBy: { NgayApDung: 'desc' },
    });

    if (!chinhSachHuyVe) {
      throw new BadRequestException('Không tìm thấy chính sách huỷ vé hiện hành!');
    }

    if (!ve.LICH_TRINH) {
      throw new BadRequestException('Vé chưa có thông tin lịch trình để tính phí huỷ.');
    }

    const ngayKhoiHanh = new Date(ve.LICH_TRINH.NgayKhoiHanh);
    const gioKhoiHanhDate = ve.LICH_TRINH.GioKhoiHanh;
    const thoiGianKhoiHanh = new Date(ngayKhoiHanh);
    if (gioKhoiHanhDate) {
      thoiGianKhoiHanh.setHours(gioKhoiHanhDate.getHours(), gioKhoiHanhDate.getMinutes(), 0, 0);
    } else {
      thoiGianKhoiHanh.setHours(0, 0, 0, 0);
    }

    const thoiGianHienTai = new Date();
    const soGioConLai = (thoiGianKhoiHanh.getTime() - thoiGianHienTai.getTime()) / (1000 * 60 * 60);
    const giaVe = this.toNumber(ve.GiaVe);
    const tyLePhiHuy = Number(chinhSachHuyVe.TyLePhiHuy || 0);
    const duocHuy = soGioConLai >= chinhSachHuyVe.GioiHanGioTruocKhoiHanh;
    const phiHuy = duocHuy ? Math.round(giaVe * tyLePhiHuy) : giaVe;
    const tienHoanLai = duocHuy ? Math.max(giaVe - phiHuy, 0) : 0;
    const tiLeHoanLai = giaVe > 0 ? Math.round((tienHoanLai / giaVe) * 100) : 0;
    const soGioText = Number.isFinite(soGioConLai) ? Math.max(0, Math.floor(soGioConLai)) : 0;

    return {
      maVe: ve.MaVe,
      tongTienGoc: giaVe,
      thoiGianKhoiHanh,
      soGioConLai,
      duocHuy,
      lyDoKhongDuocHuy: duocHuy
        ? null
        : `Phải huỷ trước giờ khởi hành ít nhất ${chinhSachHuyVe.GioiHanGioTruocKhoiHanh} giờ.`,
      chinhSach: {
        maChinhSach: chinhSachHuyVe.MaChinhSach,
        tenChinhSach: chinhSachHuyVe.TenChinhSach,
        gioiHanGioTruocKhoiHanh: chinhSachHuyVe.GioiHanGioTruocKhoiHanh,
        tyLePhiHuy: tyLePhiHuy,
      },
      tyLePhiHuy,
      phiHuy,
      tienHoanLai,
      tiLeHoanLai,
      text: duocHuy
        ? `Còn ${soGioText} giờ trước khởi hành, hoàn ${tiLeHoanLai}% theo chính sách hiện hành`
        : `Quá hạn huỷ vé, hoàn 0% theo chính sách hiện hành`,
    };
  }

  async tinhPhiHuyVe(id: string) {
    const ve = await this.getVeById(id);
    return this.buildCancelQuote(ve);
  }

  // ===== HUỶ VÉ =====
  async huyVe(id: string, lyDo: string, maNVBanVe?: string) {
    const ve = await this.getVeById(id);

    if (ve.TrangThaiVe === 'DaHuy') {
      throw new BadRequestException('Vé này đã được huỷ trước đó!');
    }

    const quote = await this.buildCancelQuote(ve);
    if (!quote.duocHuy) {
      throw new BadRequestException(quote.lyDoKhongDuocHuy || 'Không thể huỷ vé theo chính sách hiện hành.');
    }

    const maNV = await this.resolveTicketSeller(maNVBanVe || ve.DON_HANG?.MaNVBanVe);
    const paidPayment = (ve.THANH_TOAN || []).find(
      item => item.LoaiGiaoDich === 'ThanhToan' && item.TrangThaiGiaoDich === 'ThanhCong',
    );
    const tienHoanLai = paidPayment ? quote.tienHoanLai : 0;
    const maGiaoDichHoan = this.formatCode('GD', 6, await this.nextGiaoDichNumber());

    const updatedVe = await this.prisma.vE_DIEN_TU.update({
      where: { MaVe: id },
      data: { TrangThaiVe: 'DaHuy' },
    });

    await this.prisma.gHE_CHUYEN_XE.update({
      where: { MaGheChuyen: ve.MaGheChuyen },
      data: {
        TrangThaiGhe: 'Trong',
        ThoiGianCapNhatTrangThai: new Date(),
      },
    });

    await this.prisma.tHANH_TOAN.create({
      data: {
        MaGiaoDich: maGiaoDichHoan,
        MaDonHang: ve.MaDonHang,
        LoaiGiaoDich: 'HoanTien',
        PhuongThucThanhToan: 'ChuyenKhoan',
        SoTien: new Prisma.Decimal(tienHoanLai),
        ThoiGianGiaoDich: new Date(),
        TrangThaiGiaoDich: paidPayment ? 'ThanhCong' : 'DaHuy',
        LichSuHoanTien: paidPayment ? '' : 'Vé chưa thanh toán nên không phát sinh hoàn tiền.',
      },
    });

    await this.prisma.lICH_SU_HUY_VE.create({
      data: {
        MaLichSuHuy: `LSHV_${Date.now()}`,
        MaVe: id,
        MaChinhSach: quote.chinhSach.maChinhSach,
        NguonHuy: 'QuanTriVien',
        MaKhachHang: ve.DON_HANG?.MaKhachHang,
        MaNVBanVe: maNV,
        TienVeGoc: ve.GiaVe,
        TyLePhiHuyApDung: quote.tyLePhiHuy,
        LePhiHuy: new Prisma.Decimal(paidPayment ? quote.phiHuy : 0),
        TienHoanLai: new Prisma.Decimal(tienHoanLai),
        MaGiaoDichHoan: maGiaoDichHoan,
      },
    });

    await this.prisma.lICH_SU_VE.create({
      data: {
        MaLichSu: `LSV_${Date.now()}`,
        HanhDong: 'Huỷ vé',
        TrangThaiCu: ve.TrangThaiVe,
        TrangThaiMoi: 'DaHuy',
        ThoiGianThayDoi: new Date(),
        GhiChu: lyDo,
        MaVe: id,
        MaKhachHang: ve.DON_HANG?.MaKhachHang,
        MaNVBanVe: maNV,
      },
    });

    const activeTickets = await this.prisma.vE_DIEN_TU.count({
      where: {
        MaDonHang: ve.MaDonHang,
        TrangThaiVe: { not: 'DaHuy' },
      },
    });
    if (activeTickets === 0) {
      await this.prisma.dON_HANG.update({
        where: { MaDonHang: ve.MaDonHang },
        data: { TrangThaiDonHang: 'DaHuy' },
      });
    }

    this.nhatKyService.ghiLog({
      MaNhanVien: maNV || 'NVBV100001',
      MaVe: id,
      MaKhachHang: ve.DON_HANG?.MaKhachHang,
      LoaiThaoTac: 'Quản lý vé',
      NoiDungChiTiet: `Huỷ vé ${id}. Lý do: ${lyDo}. Tiền hoàn lại: ${tienHoanLai}`,
      TrangThai: 'Thành công',
      TrangThaiCu: ve.TrangThaiVe,
      TrangThaiMoi: 'DaHuy',
      DuLieuThayDoi: [
        { truong: 'TrangThaiVe', giaTriCu: ve.TrangThaiVe, giaTriMoi: 'DaHuy' },
        { truong: 'LyDoHuy', giaTriCu: null, giaTriMoi: lyDo },
        { truong: 'TienHoanLai', giaTriCu: null, giaTriMoi: tienHoanLai },
      ],
    });

    return {
      ve: updatedVe,
      tinhPhi: quote,
      tienHoanLai,
    };
  }
}

