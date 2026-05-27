import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BaoCaoService {
  constructor(private prisma: PrismaService) {}

  // ===== BÁO CÁO CHI TIẾT THEO CHUYẾN XE =====
  async getBaoCaoChuyenXe(filters: {
    fromDate?: string;
    toDate?: string;
    route?: string;
    licensePlate?: string;
    status?: string;
  }) {
    // 1. Kiểm tra xem có dữ liệu thực tế không
    const tripCount = await this.prisma.lICH_TRINH.count();

    if (tripCount > 0) {
      // Truy vấn DB thực tế
      let mappedStatus: any = undefined;
      if (filters.status && filters.status !== 'Tất cả') {
        mappedStatus = (filters.status === 'active' || filters.status === 'DangChay') ? 'DangChay' :
                       (filters.status === 'scheduled' || filters.status === 'ChoKhoiHanh') ? 'ChoKhoiHanh' :
                       (filters.status === 'locked' || filters.status === 'DaKhoa') ? 'DaKhoa' : 'HoanThanh';
      }

      const trips = await this.prisma.lICH_TRINH.findMany({
        where: {
          NgayKhoiHanh: {
            gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
            lte: filters.toDate ? new Date(filters.toDate) : undefined,
          },
          TUYEN_XE: filters.route && filters.route !== 'Tất cả' ? { TenTuyenXe: filters.route } : undefined,
          PHUONG_TIEN: filters.licensePlate && filters.licensePlate !== 'Tất cả' ? { BienSoXe: filters.licensePlate } : undefined,
          TrangThaiLichTrinh: mappedStatus,
        },
        include: {
          TUYEN_XE: true,
          PHUONG_TIEN: true,
          PHAN_CONG_CHUYEN: {
            include: {
              TAI_XE_PHU_XE: true,
            },
          },
          CHI_PHI_CHUYEN_XE: true,
          VE_DIEN_TU: {
            include: {
              DANH_GIA: true,
            },
          },
        },
      });

      // Tính tổng doanh thu tuyến phục vụ tính tỷ lệ đóng góp
      const routeRevenues: Record<string, number> = {};
      trips.forEach(t => {
        const routeName = t.TUYEN_XE.TenTuyenXe;
        const revenue = t.VE_DIEN_TU.reduce((sum, ticket) => sum + Number(ticket.GiaVe), 0);
        routeRevenues[routeName] = (routeRevenues[routeName] || 0) + revenue;
      });

      return trips.map(t => {
        const soldTickets = t.VE_DIEN_TU.length;
        const totalSeats = t.PHUONG_TIEN.SoGhe;
        const fillRate = totalSeats > 0 ? Math.min(100, Math.round((soldTickets / totalSeats) * 100)) : 0;
        const ticketRevenue = t.VE_DIEN_TU.reduce((sum, ticket) => sum + Number(ticket.GiaVe), 0);
        
        // Chi phí vận hành
        const phiCauDuong = t.CHI_PHI_CHUYEN_XE.filter(c => c.LoaiChiPhi === 'Cầu đường').reduce((sum, c) => sum + Number(c.SoTien), 0);
        const phiDau = t.CHI_PHI_CHUYEN_XE.filter(c => c.LoaiChiPhi === 'Dầu/Nhiên liệu' || c.LoaiChiPhi === 'Dầu' || c.LoaiChiPhi === 'Nhiên liệu').reduce((sum, c) => sum + Number(c.SoTien), 0);
        const phiRuaXe = t.CHI_PHI_CHUYEN_XE.filter(c => c.LoaiChiPhi === 'Rửa xe').reduce((sum, c) => sum + Number(c.SoTien), 0);
        const phiAnUong = t.CHI_PHI_CHUYEN_XE.filter(c => c.LoaiChiPhi === 'Ăn uống').reduce((sum, c) => sum + Number(c.SoTien), 0);
        const phiBenBai = t.CHI_PHI_CHUYEN_XE.filter(c => c.LoaiChiPhi === 'Bến bãi').reduce((sum, c) => sum + Number(c.SoTien), 0);
        const chiPhiVanHanh = t.CHI_PHI_CHUYEN_XE.reduce((sum, c) => sum + Number(c.SoTien), 0);
        
        const loiNhuan = ticketRevenue - chiPhiVanHanh;

        // Tài xế / Phụ xe
        const taiXeChinh = t.PHAN_CONG_CHUYEN.find(pc => pc.VaiTro === 'Tài xế chính' || pc.VaiTro === 'Tài xế')?.TAI_XE_PHU_XE.HoTen || 'N/A';
        const phuXe = t.PHAN_CONG_CHUYEN.find(pc => pc.VaiTro === 'Phụ xe')?.TAI_XE_PHU_XE.HoTen || 'N/A';

        // Đánh giá
        const allRatings = t.VE_DIEN_TU.flatMap(v => v.DANH_GIA);
        const avgRating = allRatings.length > 0 ? Math.round((allRatings.reduce((sum, d) => sum + d.SoSao, 0) / allRatings.length) * 10) / 10 : 5;
        const negativeReviews = allRatings.filter(d => d.SoSao <= 2).length;

        const routeTotalRev = routeRevenues[t.TUYEN_XE.TenTuyenXe] || 1;
        const routeContribution = Math.round((ticketRevenue / routeTotalRev) * 10000) / 100;

        return {
          maChuyen: t.MaLichTrinh,
          tuyen: t.TUYEN_XE.TenTuyenXe,
          bienSoXe: t.PHUONG_TIEN.BienSoXe,
          loaiXe: t.PHUONG_TIEN.LoaiXe,
          ngayDi: t.NgayKhoiHanh.toISOString().slice(0, 10),
          gioDi: t.GioKhoiHanh.toISOString().slice(11, 16),
          slDaBan: soldTickets,
          tongGhe: totalSeats,
          tyLeLapDay: fillRate,
          doanhThuVe: ticketRevenue,
          chiPhiVanHanh,
          loiNhuan,
          trangThai: t.TrangThaiLichTrinh,
          taiXeChinh,
          phuXe,
          diemDanhGiaTrungBinh: avgRating,
          soLuongDanhGiaTieuCuc: negativeReviews,
          tyLeDongGopDoanhThuTuyen: routeContribution,
          phiCauDuong,
          phiDau,
          phiRuaXe,
          phiAnUong,
          phiBenBai,
        };
      });
    }

    // 2. Fallback sinh dữ liệu mock nếu DB trống
    const mockTrips: any[] = [];
    const routes = [
      'Hải Phòng - Hà Nội',
      'Hà Nội - Quảng Ninh',
      'Hải Phòng - Quảng Ninh',
      'Hà Nội - SaPa',
      'Hải Phòng - Thái Bình',
    ];
    const licensePlates = ['15B-012.34', '29B-567.89', '14B-432.10', '15B-999.99', '29B-111.11'];
    const vehicleTypes = ['Limousine giường nằm VIP', 'Xe khách Limousine VIP', 'Limousine 9 chỗ'];
    const statuses = ['Còn chỗ', 'Hết chỗ', 'Đã khởi hành', 'Hủy'];
    const staff = [
      { driver: 'Nguyễn Văn Nam', assistant: 'Lê Thế Hùng' },
      { driver: 'Trần Hoàng Long', assistant: 'Phạm Minh Đức' },
      { driver: 'Lê Anh Tuấn', assistant: 'Vũ Hữu Phước' },
      { driver: 'Phạm Thanh Sơn', assistant: 'Đỗ Văn Đạt' },
    ];

    for (let i = 1; i <= 60; i++) {
      const route = routes[i % routes.length];
      const licensePlate = licensePlates[i % licensePlates.length];
      const loaiXe = vehicleTypes[i % vehicleTypes.length];
      const crew = staff[i % staff.length];
      const status = statuses[i % statuses.length];

      const day = (i % 28) + 1;
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const ngayDi = `2026-05-${dayStr}`;
      const times = ['08:00', '13:00', '19:00', '21:00'];
      const gioDi = times[i % times.length];

      const tongGhe = i % 2 === 0 ? 34 : 22;
      let slDaBan = 0;
      if (status === 'Hết chỗ') slDaBan = tongGhe;
      else if (status === 'Hủy') slDaBan = 0;
      else if (status === 'Còn chỗ') slDaBan = Math.floor(tongGhe * 0.4) + (i % 6);
      else slDaBan = Math.floor(tongGhe * 0.7) + (i % 5);

      const tyLeLapDay = Math.min(100, Math.round((slDaBan / tongGhe) * 100));
      const singleFare = 150000 + (i % 5) * 50000;
      const doanhThuVe = slDaBan * singleFare;

      let phiDau = 0, phiCauDuong = 0, phiRuaXe = 0, phiAnUong = 0, phiBenBai = 0;
      if (status !== 'Hủy') {
        phiDau = 500000 + (i % 4) * 100000;
        phiCauDuong = 150000 + (i % 3) * 50000;
        phiRuaXe = 150000;
        phiAnUong = 300000;
        phiBenBai = 200000;
      }
      const chiPhiVanHanh = phiDau + phiCauDuong + phiRuaXe + phiAnUong + phiBenBai;
      const loiNhuan = doanhThuVe - chiPhiVanHanh;

      mockTrips.push({
        maChuyen: `LT-2605-${String(i).padStart(3, '0')}`,
        tuyen: route,
        bienSoXe: licensePlate,
        loaiXe,
        ngayDi,
        gioDi,
        slDaBan,
        tongGhe,
        tyLeLapDay,
        doanhThuVe,
        chiPhiVanHanh,
        loiNhuan,
        trangThai: status,
        taiXeChinh: crew.driver,
        phuXe: crew.assistant,
        diemDanhGiaTrungBinh: Math.round((4.0 + Math.random()) * 10) / 10,
        soLuongDanhGiaTieuCuc: i % 10 === 0 ? 1 : 0,
        tyLeDongGopDoanhThuTuyen: Math.round((10 + Math.random() * 15) * 100) / 100,
        phiCauDuong,
        phiDau,
        phiRuaXe,
        phiAnUong,
        phiBenBai,
      });
    }

    // Lọc theo bộ lọc giống frontend
    return mockTrips
      .filter(item => {
        if (filters.fromDate && item.ngayDi < filters.fromDate) return false;
        if (filters.toDate && item.ngayDi > filters.toDate) return false;
        if (filters.route && filters.route !== 'Tất cả' && item.tuyen !== filters.route) return false;
        if (filters.licensePlate && filters.licensePlate !== 'Tất cả' && item.bienSoXe !== filters.licensePlate) return false;
        if (filters.status && filters.status !== 'Tất cả' && item.trangThai !== filters.status) return false;
        return true;
      })
      .sort((a, b) => b.ngayDi.localeCompare(a.ngayDi) || b.gioDi.localeCompare(a.gioDi));
  }

  // ===== BÁO CÁO HOÀN HỦY VÉ =====
  async getBaoCaoHoanHuy(filters: { fromDate?: string; toDate?: string; nguoiHuy?: string }) {
    const refundCount = await this.prisma.lICH_SU_HUY_VE.count();

    if (refundCount > 0) {
      const refunds = await this.prisma.lICH_SU_HUY_VE.findMany({
        where: {
          NguonHuy: filters.nguoiHuy && filters.nguoiHuy !== 'Tất cả' ? filters.nguoiHuy : undefined,
          THANH_TOAN: {
            ThoiGianGiaoDich: {
              gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
              lte: filters.toDate ? new Date(filters.toDate) : undefined,
            },
          },
        },
        include: {
          THANH_TOAN: true,
        },
      });

      return refunds.map(r => ({
        maVe: r.MaVe,
        nguoiHuy: r.NguonHuy,
        tienGoc: Number(r.TienVeGoc),
        tyLePhi: r.TyLePhiHuyApDung,
        lePhiHuy: Number(r.LePhiHuy),
        tienHoan: Number(r.TienHoanLai),
        maGiaoDich: r.MaGiaoDichHoan,
        ngayHuy: r.THANH_TOAN.ThoiGianGiaoDich.toISOString().slice(0, 10),
      }));
    }

    // Mock fallback
    const mockRefunds: any[] = [];
    const nguoiHuyOptions = ['Khách hàng tự hủy trên web', 'Nhân viên bán vé hủy hộ'];

    for (let i = 1; i <= 30; i++) {
      const nguoiHuy = nguoiHuyOptions[i % nguoiHuyOptions.length];
      const tienGoc = 150000 + (i % 5) * 50000;
      let tyLePhi = 0.1;
      if (nguoiHuy === 'Khách hàng tự hủy trên web') {
        if (i % 3 === 0) tyLePhi = 0;
        else if (i % 3 === 1) tyLePhi = 0.2;
        else tyLePhi = 0.5;
      } else {
        tyLePhi = i % 2 === 0 ? 0.05 : 0.1;
      }
      const lePhiHuy = tienGoc * tyLePhi;
      const tienHoan = tienGoc - lePhiHuy;
      
      const day = (i % 28) + 1;
      const dayStr = day < 10 ? `0${day}` : `${day}`;

      mockRefunds.push({
        maVe: `TXP${String(10000 + i)}`,
        nguoiHuy,
        tienGoc,
        tyLePhi,
        lePhiHuy,
        tienHoan,
        maGiaoDich: `GD202605${dayStr}${String(i).padStart(3, '0')}`,
        ngayHuy: `2026-05-${dayStr}`,
      });
    }

    return mockRefunds
      .filter(item => {
        if (filters.fromDate && item.ngayHuy < filters.fromDate) return false;
        if (filters.toDate && item.ngayHuy > filters.toDate) return false;
        if (filters.nguoiHuy && filters.nguoiHuy !== 'Tất cả' && item.nguoiHuy !== filters.nguoiHuy) return false;
        return true;
      })
      .sort((a, b) => b.ngayHuy.localeCompare(a.ngayHuy));
  }

  // ===== BÁO CÁO TÀI KHOẢN KHÁCH HÀNG =====
  async getBaoCaoKhachHang(filters: { fromDate?: string; toDate?: string; status?: string; searchTerm?: string }) {
    const customerCount = await this.prisma.kHACH_HANG.count();

    if (customerCount > 0) {
      let trangThaiFilter: any = undefined;
      if (filters.status && filters.status !== 'Tất cả') {
        trangThaiFilter = (filters.status === 'Đang hoạt động' || filters.status === 'HoatDong') 
          ? 'HoatDong' 
          : 'DaKhoa';
      }

      const customers = await this.prisma.kHACH_HANG.findMany({
        where: {
          NgayDangKy: {
            gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
            lte: filters.toDate ? new Date(filters.toDate) : undefined,
          },
          TrangThaiTaiKhoan: trangThaiFilter,
        },
      });

      const mapped = await Promise.all(
        customers.map(async c => {
          let tongVeDat = 0;
          try {
            tongVeDat = await this.prisma.vE_DIEN_TU.count({
              where: {
                DON_HANG: {
                  MaKhachHang: c.MaKhachHang,
                },
              },
            });
          } catch (e) {
            // Mismatch handling
          }

          return {
            maKhachHang: c.MaKhachHang,
            tenKhachHang: c.HoTenKhachHang,
            sdt: c.SoDienThoai,
            email: c.Email,
            ngayDangKy: c.NgayDangKy.toISOString().slice(0, 10),
            tongVeDat,
            trangThai: c.TrangThaiTaiKhoan === 'HoatDong' ? 'Đang hoạt động' : 'Đã khóa',
          };
        })
      );

      // Áp dụng bộ lọc tìm kiếm
      return mapped.filter(item => {
        if (filters.searchTerm) {
          const query = filters.searchTerm.toLowerCase();
          return (
            item.tenKhachHang.toLowerCase().includes(query) ||
            item.sdt.includes(query) ||
            (item.email ? item.email.toLowerCase().includes(query) : false) ||
            item.maKhachHang.toLowerCase().includes(query)
          );
        }
        return true;
      }).sort((a, b) => b.tongVeDat - a.tongVeDat);
    }

    // Mock fallback
    const mockCustomers = [
      { maKhachHang: 'KH001', tenKhachHang: 'Nguyễn Văn An', sdt: '0912445566', email: 'an.nv@gmail.com', ngayDangKy: '2026-01-15', tongVeDat: 12, trangThai: 'Đang hoạt động' as const },
      { maKhachHang: 'KH002', tenKhachHang: 'Trần Thị Bích', sdt: '0988776655', email: 'bich.tt@yahoo.com', ngayDangKy: '2026-02-10', tongVeDat: 8, trangThai: 'Đang hoạt động' as const },
      { maKhachHang: 'KH003', tenKhachHang: 'Lê Văn Cường', sdt: '0903112233', email: 'cuong.lv@hotmail.com', ngayDangKy: '2026-03-01', tongVeDat: 15, trangThai: 'Đang hoạt động' as const },
      { maKhachHang: 'KH004', tenKhachHang: 'Phạm Minh Đạo', sdt: '0976334455', email: 'dao.pm@outlook.com', ngayDangKy: '2026-03-20', tongVeDat: 3, trangThai: 'Đang hoạt động' as const },
      { maKhachHang: 'KH005', tenKhachHang: 'Hoàng Thị Dung', sdt: '0934889900', email: 'dunghoang99@gmail.com', ngayDangKy: '2026-04-05', tongVeDat: 9, trangThai: 'Đang hoạt động' as const },
      { maKhachHang: 'KH006', tenKhachHang: 'Nguyễn Thị Phương', sdt: '0919223344', email: 'phuongnt@gmail.com', ngayDangKy: '2026-04-18', tongVeDat: 21, trangThai: 'Đang hoạt động' as const },
      { maKhachHang: 'KH007', tenKhachHang: 'Lý Quốc Bảo', sdt: '0983112244', email: 'baolq.txp@gmail.com', ngayDangKy: '2026-04-22', tongVeDat: 5, trangThai: 'Đã khóa' as const },
      { maKhachHang: 'KH008', tenKhachHang: 'Vũ Thanh Hằng', sdt: '0967445522', email: 'hangvt.hanoi@gmail.com', ngayDangKy: '2026-05-02', tongVeDat: 2, trangThai: 'Đang hoạt động' as const },
    ];

    return mockCustomers
      .filter(item => {
        if (filters.fromDate && item.ngayDangKy < filters.fromDate) return false;
        if (filters.toDate && item.ngayDangKy > filters.toDate) return false;
        if (filters.status && filters.status !== 'Tất cả' && item.trangThai !== filters.status) return false;
        if (filters.searchTerm) {
          const query = filters.searchTerm.toLowerCase();
          return (
            item.tenKhachHang.toLowerCase().includes(query) ||
            item.sdt.includes(query) ||
            item.email.toLowerCase().includes(query) ||
            item.maKhachHang.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => b.tongVeDat - a.tongVeDat);
  }

  // ===== BÁO CÁO NHÂN SỰ TÀI XẾ & PHỤ XE =====
  async getBaoCaoTaiXePhuXe(filters: { role?: string; status?: string; searchTerm?: string }) {
    const staffCount = await this.prisma.tAI_XE_PHU_XE.count();

    if (staffCount > 0) {
      let loaiNVFilter: any = undefined;
      if (filters.role && filters.role !== 'Tất cả') {
        loaiNVFilter = (filters.role === 'driver' || filters.role === 'Tài xế' || filters.role === 'TaiXe') ? 'TaiXe' : 'PhuXe';
      }
      let trangThaiLamViecFilter: any = undefined;
      if (filters.status && filters.status !== 'Tất cả') {
        trangThaiLamViecFilter = (filters.status === 'locked' || filters.status === 'DaKhoa') ? 'DaKhoa' : 'DangLamViec';
      }

      const staffList = await this.prisma.tAI_XE_PHU_XE.findMany({
        where: {
          LoaiNhanVien: loaiNVFilter,
          TrangThaiLamViec: trangThaiLamViecFilter,
        },
      });

      const mapped = staffList.map(s => {
        let thoiHanBangLai = 'N/A';
        if (s.ThoiHanBangLai) {
          const d = s.ThoiHanBangLai;
          thoiHanBangLai = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }
        return {
          maNhanSu: s.MaTaiXePhuXe,
          hoTen: s.HoTen || 'N/A',
          vaiTro: s.LoaiNhanVien === 'TaiXe' ? 'Tài xế' : 'Phụ xe',
          sdt: s.SoDienThoai || 'N/A',
          cccd: s.CCCD || 'N/A',
          loaiBangLai: s.LoaiBangLai || 'Không có',
          thoiHanBangLai,
          trangThaiLamViec: s.TrangThaiLamViec === 'DangLamViec' ? 'Đang hoạt động' : 'Đã khóa',
        };
      });

      return mapped.filter(item => {
        if (filters.searchTerm) {
          const query = filters.searchTerm.toLowerCase();
          return (
            item.hoTen.toLowerCase().includes(query) ||
            item.sdt.includes(query) ||
            item.cccd.includes(query) ||
            item.maNhanSu.toLowerCase().includes(query)
          );
        }
        return true;
      });
    }

    // Mock fallback
    const mockCrew = [
      { maNhanSu: 'TXP_NS001', hoTen: 'Nguyễn Văn Nam', vaiTro: 'Tài xế' as const, sdt: '0912334455', cccd: '031099001234', loaiBangLai: 'Hạng E', thoiHanBangLai: '12/10/2028', trangThaiLamViec: 'Đang hoạt động' as const },
      { maNhanSu: 'TXP_NS002', hoTen: 'Lê Thế Hùng', vaiTro: 'Phụ xe' as const, sdt: '0988223344', cccd: '031098005678', loaiBangLai: 'Không có', thoiHanBangLai: 'N/A', trangThaiLamViec: 'Đang hoạt động' as const },
      { maNhanSu: 'TXP_NS003', hoTen: 'Trần Hoàng Long', vaiTro: 'Tài xế' as const, sdt: '0903889900', cccd: '031095009999', loaiBangLai: 'Hạng FC', thoiHanBangLai: '25/06/2026', trangThaiLamViec: 'Đang hoạt động' as const },
      { maNhanSu: 'TXP_NS004', hoTen: 'Phạm Minh Đức', vaiTro: 'Phụ xe' as const, sdt: '0976112233', cccd: '031097008888', loaiBangLai: 'Không có', thoiHanBangLai: 'N/A', trangThaiLamViec: 'Đang hoạt động' as const },
      { maNhanSu: 'TXP_NS005', hoTen: 'Lê Anh Tuấn', vaiTro: 'Tài xế' as const, sdt: '0934556677', cccd: '031092007777', loaiBangLai: 'Hạng D', thoiHanBangLai: '01/05/2026', trangThaiLamViec: 'Đang hoạt động' as const },
      { maNhanSu: 'TXP_NS006', hoTen: 'Vũ Hữu Phước', vaiTro: 'Phụ xe' as const, sdt: '0919445566', cccd: '031099006666', loaiBangLai: 'Không có', thoiHanBangLai: 'N/A', trangThaiLamViec: 'Đã khóa' as const },
    ];

    return mockCrew.filter(item => {
      if (filters.role && filters.role !== 'Tất cả' && item.vaiTro !== filters.role) return false;
      if (filters.status && filters.status !== 'Tất cả') {
        const filterStatus = filters.status === 'Hoạt động' ? 'Đang hoạt động' : 'Đã khóa';
        if (item.trangThaiLamViec !== filterStatus) return false;
      }
      if (filters.searchTerm) {
        const query = filters.searchTerm.toLowerCase();
        return (
          item.hoTen.toLowerCase().includes(query) ||
          item.sdt.includes(query) ||
          item.cccd.includes(query) ||
          item.maNhanSu.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }

  // ===== BÁO CÁO TỔNG HỢP THEO TUYẾN =====
  async getBaoCaoTuyenXe(filters: { fromDate?: string; toDate?: string; route?: string; status?: string }) {
    const routeCount = await this.prisma.tUYEN_XE.count();

    if (routeCount > 0) {
      let trangThaiTuyenFilter: any = undefined;
      if (filters.status && filters.status !== 'Tất cả') {
        trangThaiTuyenFilter = (filters.status === 'locked' || filters.status === 'DaKhoa' || filters.status === 'Ngừng hoạt động') ? 'DaKhoa' : 'DangHoatDong';
      }

      const routes = await this.prisma.tUYEN_XE.findMany({
        where: {
          TenTuyenXe: filters.route && filters.route !== 'Tất cả' ? filters.route : undefined,
          TrangThaiTuyenXe: trangThaiTuyenFilter,
        },
        include: {
          LICH_TRINH: {
            where: {
              NgayKhoiHanh: {
                gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
                lte: filters.toDate ? new Date(filters.toDate) : undefined,
              },
            },
            include: {
              PHUONG_TIEN: true,
              VE_DIEN_TU: true,
              CHI_PHI_CHUYEN_XE: true,
            },
          },
        },
      });

      return routes.map(r => {
        const slChuyenChay = r.LICH_TRINH.length;
        const slVeDaBan = r.LICH_TRINH.reduce((sum, lt) => sum + lt.VE_DIEN_TU.length, 0);
        const maxSeats = r.LICH_TRINH.reduce((sum, lt) => sum + lt.PHUONG_TIEN.SoGhe, 0);
        const tyLeLapDay = maxSeats > 0 ? Math.min(100, Math.round((slVeDaBan / maxSeats) * 100)) : 0;
        
        const tongDoanhThu = r.LICH_TRINH.reduce((sum, lt) => {
          return sum + lt.VE_DIEN_TU.reduce((s, ticket) => s + Number(ticket.GiaVe), 0);
        }, 0);

        const tongChiPhiVanHanh = r.LICH_TRINH.reduce((sum, lt) => {
          return sum + lt.CHI_PHI_CHUYEN_XE.reduce((s, cost) => s + Number(cost.SoTien), 0);
        }, 0);

        const loiNhuanTuyen = tongDoanhThu - tongChiPhiVanHanh;
        const doanhThuTrungBinhChuyen = slChuyenChay > 0 ? Math.round(tongDoanhThu / slChuyenChay) : 0;
        const loiNhuanTrungBinhChuyen = slChuyenChay > 0 ? Math.round(loiNhuanTuyen / slChuyenChay) : 0;

        const durationDate = typeof r.ThoiGianDiChuyenDuKien === 'string' ? new Date(r.ThoiGianDiChuyenDuKien) : r.ThoiGianDiChuyenDuKien;
        const duration = durationDate instanceof Date && !isNaN(durationDate.getTime())
          ? durationDate.toISOString().slice(11, 16)
          : '00:00';
        const khoangCachThoiGian = `${r.KhoangCach || 0} km / ${duration.replace(':', 'h')}m`;

        return {
          maTuyen: r.MaTuyenXe,
          tuyen: r.TenTuyenXe,
          khoangCachThoiGian,
          slChuyenChay,
          slVeDaBan,
          tyLeLapDay,
          tongDoanhThu,
          tongChiPhiVanHanh,
          loiNhuanTuyen,
          doanhThuTrungBinhChuyen,
          loiNhuanTrungBinhChuyen,
          trangThai: r.TrangThaiTuyenXe === 'DangHoatDong' ? 'Đang hoạt động' : 'Ngừng hoạt động',
        };
      });
    }

    // Mock fallback
    const mockRoutes = [
      { maTuyen: 'TX01', tuyen: 'Hải Phòng - Hà Nội', khoangCachThoiGian: '120 km / 2h00m', slChuyenChay: 20, slVeDaBan: 350, tyLeLapDay: 80, tongDoanhThu: 70000000, tongChiPhiVanHanh: 25000000, loiNhuanTuyen: 45000000, doanhThuTrungBinhChuyen: 3500000, loiNhuanTrungBinhChuyen: 2250000, trangThai: 'Đang hoạt động' as const },
      { maTuyen: 'TX02', tuyen: 'Hà Nội - Quảng Ninh', khoangCachThoiGian: '180 km / 3h00m', slChuyenChay: 25, slVeDaBan: 450, tyLeLapDay: 75, tongDoanhThu: 112500000, tongChiPhiVanHanh: 45000000, loiNhuanTuyen: 67500000, doanhThuTrungBinhChuyen: 4500000, loiNhuanTrungBinhChuyen: 2700000, trangThai: 'Đang hoạt động' as const },
      { maTuyen: 'TX03', tuyen: 'Hải Phòng - Quảng Ninh', khoangCachThoiGian: '75 km / 1h30m', slChuyenChay: 15, slVeDaBan: 200, tyLeLapDay: 65, tongDoanhThu: 30000000, tongChiPhiVanHanh: 12000000, loiNhuanTuyen: 18000000, doanhThuTrungBinhChuyen: 2000000, loiNhuanTrungBinhChuyen: 1200000, trangThai: 'Đang hoạt động' as const },
      { maTuyen: 'TX04', tuyen: 'Hà Nội - SaPa', khoangCachThoiGian: '320 km / 6h00m', slChuyenChay: 10, slVeDaBan: 220, tyLeLapDay: 88, tongDoanhThu: 88000000, tongChiPhiVanHanh: 38000000, loiNhuanTuyen: 50000000, doanhThuTrungBinhChuyen: 8800000, loiNhuanTrungBinhChuyen: 5000000, trangThai: 'Đang hoạt động' as const },
      { maTuyen: 'TX05', tuyen: 'Hải Phòng - Thái Bình', khoangCachThoiGian: '70 km / 1h20m', slChuyenChay: 8, slVeDaBan: 90, tyLeLapDay: 50, tongDoanhThu: 13500000, tongChiPhiVanHanh: 7000000, loiNhuanTuyen: 6500000, doanhThuTrungBinhChuyen: 1687500, loiNhuanTrungBinhChuyen: 812500, trangThai: 'Ngừng hoạt động' as const },
    ];

    return mockRoutes.filter(item => {
      if (filters.route && filters.route !== 'Tất cả' && item.tuyen !== filters.route) return false;
      if (filters.status && filters.status !== 'Tất cả') {
        const filterStatus = filters.status === 'Hoạt động' ? 'Đang hoạt động' : 'Ngừng hoạt động';
        if (item.trangThai !== filterStatus) return false;
      }
      return true;
    });
  }
}
