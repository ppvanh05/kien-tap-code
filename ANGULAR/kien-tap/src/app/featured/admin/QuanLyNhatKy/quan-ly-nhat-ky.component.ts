import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AuditLog {
  maNhatKy: string;
  maVe?: string;
  tuyenXe?: string;
  maKhachHang?: string;
  tenKhachHang?: string;
  soDienThoai?: string; // Phone number field
  maNhanVien?: string;
  tenNhanVien?: string;
  loaiTaiKhoan: 'Khách hàng' | 'Bán vé' | 'Điều phối' | 'Quản trị viên' | 'Ban quản lý';
  loaiThaoTac: string;
  thoiGian: string;
  diaChiIP: string;
  trangThai: 'Thành công' | 'Thất bại';
  noiDungChiTiet: string;
  thietBiTrinhDuyet?: string;
  trangThaiCu?: string;
  trangThaiMoi?: string;
  duLieuThayDoi?: {
    truong: string;
    giaTriCu: string;
    giaTriMoi: string;
  }[];
}

@Component({
  selector: 'app-quan-ly-nhat-ky',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quan-ly-nhat-ky.component.html',
  styleUrls: ['./quan-ly-nhat-ky.component.css']
})
export class QuanLyNhatKyComponent implements OnInit {
  // Filters data
  filters = {
    role: 'Tất cả',
    action: 'Tất cả',
    status: 'Tất cả',
    searchTerm: '',
    fromDate: '',
    toDate: ''
  };

  // Master options lists
  roles = ['Tất cả', 'Khách hàng', 'Bán vé', 'Điều phối', 'Quản trị viên', 'Ban quản lý'];
  
  actions = [
    'Tất cả',
    'Đăng ký',
    'Đăng nhập',
    'Đặt vé',
    'Tra cứu vé',
    'Hủy vé',
    'Chỉnh sửa thông tin vé',
    'Đánh giá chuyến xe',
    'Đổi mật khẩu',
    'Cập nhật thông tin cá nhân',
    'Quản lý lịch trình',
    'Quản lý tuyến xe',
    'Quản lý phương tiện',
    'Quản lý tài xế',
    'Quản lý vé (thay khách)',
    'Quản lý tài khoản',
    'Quản lý đánh giá',
    'Quản lý tin tức',
    'Quản lý chính sách',
    'Báo cáo & Xuất file'
  ];

  // Raw and filtered datasets
  allLogs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];

  // Pagination parameters
  page = 1;
  pageSize = 10;
  totalPages = 1;

  // Selected Log for detail modal popup
  selectedLog: AuditLog | null = null;

  // Dashboard Stats today
  stats = {
    totalLogsToday: 0,
    loginSuccessCount: 0,
    failedOperationsCount: 0,
    ticketBookingCount: 0
  };

  todayDateStr = '';

  ngOnInit() {
    this.initializeDates();
    this.allLogs = this.generateMockLogs();
    this.calculateStats();
    this.applyFilters();
  }

  // Set default dates dynamically to match current month
  initializeDates() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    
    this.todayDateStr = `${y}-${m}-${d}`;
    
    // Set filters from start of current month to today
    const firstDayStr = `${y}-${m}-01`;
    this.filters.fromDate = firstDayStr;
    this.filters.toDate = this.todayDateStr;
  }

  // Get dynamic dates relative to today
  getRelativeDateString(daysOffset: number, timeStr: string): string {
    const d = new Date();
    d.setDate(d.getDate() - daysOffset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day} ${timeStr}`;
  }

  // Calculate statistics for today's logs
  calculateStats() {
    const todayLogs = this.allLogs.filter(log => log.thoiGian.startsWith(this.todayDateStr));
    
    this.stats.totalLogsToday = todayLogs.length;
    
    this.stats.loginSuccessCount = todayLogs.filter(
      log => log.loaiThaoTac === 'Đăng nhập' && log.trangThai === 'Thành công'
    ).length;
    
    this.stats.failedOperationsCount = todayLogs.filter(
      log => log.trangThai === 'Thất bại'
    ).length;
    
    this.stats.ticketBookingCount = todayLogs.filter(
      log => log.loaiThaoTac === 'Đặt vé'
    ).length;
  }

  // Apply filters globally
  applyFilters() {
    this.filteredLogs = this.allLogs.filter(log => {
      // Role filter
      if (this.filters.role !== 'Tất cả' && log.loaiTaiKhoan !== this.filters.role) {
        return false;
      }

      // Action type filter
      if (this.filters.action !== 'Tất cả' && log.loaiThaoTac !== this.filters.action) {
        return false;
      }

      // Status filter
      if (this.filters.status !== 'Tất cả' && log.trangThai !== this.filters.status) {
        return false;
      }

      // Date range filter
      const logDate = log.thoiGian.split(' ')[0]; // yyyy-MM-dd
      if (this.filters.fromDate && logDate < this.filters.fromDate) {
        return false;
      }
      if (this.filters.toDate && logDate > this.filters.toDate) {
        return false;
      }

      // Quick Search (Log ID, User code/name, Phone, IP, Ticket Code)
      if (this.filters.searchTerm) {
        const query = this.filters.searchTerm.toLowerCase().trim();
        const matchesId = log.maNhatKy.toLowerCase().includes(query);
        const matchesIP = log.diaChiIP.includes(query);
        const matchesTicket = log.maVe && log.maVe.toLowerCase().includes(query);
        const matchesPhone = log.soDienThoai && log.soDienThoai.includes(query);
        const matchesUser = (
          (log.tenKhachHang && log.tenKhachHang.toLowerCase().includes(query)) ||
          (log.maKhachHang && log.maKhachHang.toLowerCase().includes(query)) ||
          (log.tenNhanVien && log.tenNhanVien.toLowerCase().includes(query)) ||
          (log.maNhanVien && log.maNhanVien.toLowerCase().includes(query))
        );

        if (!matchesId && !matchesIP && !matchesTicket && !matchesPhone && !matchesUser) {
          return false;
        }
      }

      return true;
    });

    this.page = 1;
    this.calculatePages();
  }

  calculatePages() {
    this.totalPages = Math.ceil(this.filteredLogs.length / this.pageSize) || 1;
  }

  get paginatedLogs(): AuditLog[] {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.filteredLogs.slice(startIndex, startIndex + this.pageSize);
  }

  setPage(pageNum: number) {
    if (pageNum >= 1 && pageNum <= this.totalPages) {
      this.page = pageNum;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.page;
    
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (current >= total - 2) {
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(current - 2, current - 1, current, current + 1, current + 2);
      }
    }
    return pages;
  }

  onPageSizeChange() {
    this.page = 1;
    this.calculatePages();
  }

  resetFilters() {
    this.filters = {
      role: 'Tất cả',
      action: 'Tất cả',
      status: 'Tất cả',
      searchTerm: '',
      fromDate: this.todayDateStr.slice(0, 8) + '01',
      toDate: this.todayDateStr
    };
    this.applyFilters();
  }

  // Modals Actions
  openLogDetail(log: AuditLog) {
    this.selectedLog = log;
  }

  closeLogDetail() {
    this.selectedLog = null;
  }

  // Excel CSV exporter (UTF-8 BOM support)
  exportToExcel() {
    let csvContent = '';
    const BOM = '\uFEFF';
    const fileName = `TXP_Combined_Logs_${this.todayDateStr}.csv`;

    const escapeCSV = (val: any): string => {
      if (val === undefined || val === null) return '';
      let str = String(val);
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    };

    // Header
    const headers = [
      'Mã nhật ký', 'Người thực hiện', 'Mã tài khoản', 'Số điện thoại', 'Vai trò', 
      'Thao tác', 'Trạng thái', 'Thời gian', 'Địa chỉ IP', 
      'Mã vé', 'Tuyến xe', 'Thiết bị/Trình duyệt', 'Chi tiết thao tác'
    ];
    csvContent += headers.map(escapeCSV).join(',') + '\r\n';

    // Rows
    this.filteredLogs.forEach(log => {
      const user = log.tenKhachHang || log.tenNhanVien || 'Hệ thống';
      const code = log.maKhachHang || log.maNhanVien || 'System';
      
      const row = [
        log.maNhatKy,
        user,
        code,
        log.soDienThoai || '',
        log.loaiTaiKhoan,
        log.loaiThaoTac,
        log.trangThai,
        log.thoiGian,
        log.diaChiIP,
        log.maVe || '',
        log.tuyenXe || '',
        log.thietBiTrinhDuyet || '',
        log.noiDungChiTiet
      ];
      csvContent += row.map(escapeCSV).join(',') + '\r\n';
    });

    // Trigger download
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Consolidated Mock Logs Generator
  private generateMockLogs(): AuditLog[] {
    return [
      {
        maNhatKy: 'TXP_LOG0001',
        maKhachHang: 'TXP_KH023',
        tenKhachHang: 'Lê Văn Cường',
        soDienThoai: '0905111222',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Đăng nhập',
        thoiGian: this.getRelativeDateString(0, '19:42:01'),
        diaChiIP: '192.168.1.10',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Khách hàng đăng nhập thành công vào website Tân Xuân Phúc qua xác thực mật khẩu.',
        thietBiTrinhDuyet: 'Chrome 124.0 (Windows 11)'
      },
      {
        maNhatKy: 'TXP_LOG0002',
        maKhachHang: 'TXP_KH023',
        tenKhachHang: 'Lê Văn Cường',
        soDienThoai: '0905111222',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Đặt vé',
        thoiGian: this.getRelativeDateString(0, '19:48:15'),
        diaChiIP: '192.168.1.10',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Khách hàng đặt thành công vé mã TXP2605C103 tuyến Bình Định ↔ Sài Gòn khởi hành ngày 2026-05-20 lúc 19:00.',
        thietBiTrinhDuyet: 'Chrome 124.0 (Windows 11)',
        maVe: 'TXP2605C103',
        tuyenXe: 'Bình Định ↔ Sài Gòn',
        trangThaiCu: 'Trống',
        trangThaiMoi: 'Đã thanh toán',
        duLieuThayDoi: [
          { truong: 'Trạng thái ghế', giaTriCu: 'Trống', giaTriMoi: 'Đã Bán' },
          { truong: 'Số lượng vé đặt', giaTriCu: '0', giaTriMoi: '1' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0003',
        maNhanVien: 'TXP_NV02',
        tenNhanVien: 'Vũ Quốc Hùng',
        soDienThoai: '0935999888',
        loaiTaiKhoan: 'Điều phối',
        loaiThaoTac: 'Quản lý phương tiện',
        thoiGian: this.getRelativeDateString(0, '16:30:10'),
        diaChiIP: '10.20.30.45',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Cập nhật thông tin hạn kiểm định và trạng thái hoạt động của phương tiện biển số 81B-015.68.',
        thietBiTrinhDuyet: 'Firefox 125.0 (macOS)',
        duLieuThayDoi: [
          { truong: 'HanDangKiem', giaTriCu: '2026-05-01', giaTriMoi: '2026-11-01' },
          { truong: 'TrangThai', giaTriCu: 'Bảo trì', giaTriMoi: 'Hoạt động' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0004',
        maNhanVien: 'TXP_NV01',
        tenNhanVien: 'Phan Văn Anh',
        soDienThoai: '0988777666',
        loaiTaiKhoan: 'Quản trị viên',
        loaiThaoTac: 'Quản lý chính sách',
        thoiGian: this.getRelativeDateString(0, '15:20:12'),
        diaChiIP: '10.20.30.12',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Điều chỉnh chính sách hủy vé hoàn tiền cho các tuyến limousine dịp hè 2026.',
        thietBiTrinhDuyet: 'Edge 124.0 (Windows 11)',
        duLieuThayDoi: [
          { truong: 'TyLePhiHuy (%)', giaTriCu: '5%', giaTriMoi: '10%' },
          { truong: 'NgayApDung', giaTriCu: '2026-01-01', giaTriMoi: '2026-05-20' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0005',
        maKhachHang: 'TXP_KH008',
        tenKhachHang: 'Vũ Thanh Hằng',
        soDienThoai: '0912345678',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Hủy vé',
        thoiGian: this.getRelativeDateString(1, '10:15:30'),
        diaChiIP: '172.16.8.99',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Khách hàng yêu cầu hủy vé trực tuyến cho vé mã TXP2605C108 tuyến Phú Yên ↔ Sài Gòn. Lý do: Khách hàng chủ động hủy.',
        thietBiTrinhDuyet: 'Safari (iOS 17)',
        maVe: 'TXP2605C108',
        tuyenXe: 'Phú Yên ↔ Sài Gòn',
        trangThaiCu: 'Đã thanh toán',
        trangThaiMoi: 'Đã hủy',
        duLieuThayDoi: [
          { truong: 'TrangThaiVe', giaTriCu: 'ConHieuLuc', giaTriMoi: 'DaHuy' },
          { truong: 'TrangThaiGhe', giaTriCu: 'DaBan', giaTriMoi: 'Trong' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0006',
        maKhachHang: 'TXP_KH005',
        tenKhachHang: 'Hoàng Thị Dung',
        soDienThoai: '0944333222',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Đổi mật khẩu',
        thoiGian: this.getRelativeDateString(0, '20:11:45'),
        diaChiIP: '14.23.45.67',
        trangThai: 'Thất bại',
        noiDungChiTiet: 'Thay đổi mật khẩu tài khoản khách hàng thất bại do nhập sai mật khẩu cũ quá 3 lần.',
        thietBiTrinhDuyet: 'Safari (iPhone 15 Pro)'
      },
      {
        maNhatKy: 'TXP_LOG0007',
        maNhanVien: 'TXP_NV03',
        tenNhanVien: 'Trần Thị Thu',
        soDienThoai: '0977666555',
        loaiTaiKhoan: 'Bán vé',
        loaiThaoTac: 'Đăng nhập',
        thoiGian: this.getRelativeDateString(0, '07:45:00'),
        diaChiIP: '192.168.2.11',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Nhân viên Trần Thị Thu đăng nhập thành công vào hệ thống quản lý bán vé tại văn phòng Gia Lai.',
        thietBiTrinhDuyet: 'Chrome 124.0 (Windows 10)'
      },
      {
        maNhatKy: 'TXP_LOG0008',
        maNhanVien: 'TXP_QL01',
        tenNhanVien: 'Nguyễn Văn Tuyến',
        soDienThoai: '0966555444',
        loaiTaiKhoan: 'Ban quản lý',
        loaiThaoTac: 'Quản lý tài khoản',
        thoiGian: this.getRelativeDateString(0, '09:30:00'),
        diaChiIP: '10.20.30.5',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Khóa tài khoản khách hàng TXP_KH042 do có hành vi đặt vé ảo nhiều lần không thanh toán.',
        thietBiTrinhDuyet: 'Chrome 124.0 (Windows 11)',
        duLieuThayDoi: [
          { truong: 'TrangThaiTaikhoan', giaTriCu: 'HoatDong', giaTriMoi: 'BiKhoa' },
          { truong: 'LyDoKhoa', giaTriCu: 'Trống', giaTriMoi: 'Đặt ảo nhiều lần' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0009',
        maNhanVien: 'TXP_QL01',
        tenNhanVien: 'Nguyễn Văn Tuyến',
        soDienThoai: '0966555444',
        loaiTaiKhoan: 'Ban quản lý',
        loaiThaoTac: 'Báo cáo & Xuất file',
        thoiGian: this.getRelativeDateString(0, '11:00:00'),
        diaChiIP: '10.20.30.5',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Kết xuất báo cáo tổng quan doanh thu vé tháng 04/2026 dạng định dạng Excel (XLSX).',
        thietBiTrinhDuyet: 'Chrome 124.0 (Windows 11)'
      },
      {
        maNhatKy: 'TXP_LOG0010',
        maNhanVien: 'TXP_NV03',
        tenNhanVien: 'Trần Thị Thu',
        soDienThoai: '0909888777', // Customer Nguyễn Văn Nam SĐT
        loaiTaiKhoan: 'Bán vé',
        loaiThaoTac: 'Đặt vé',
        thoiGian: this.getRelativeDateString(0, '14:15:22'),
        diaChiIP: '192.168.2.11',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Nhân viên Trần Thị Thu đặt vé thay khách hàng Nguyễn Văn Nam, mã vé TXP2605A401, tuyến Sài Gòn ↔ Nha Trang tại quầy.',
        thietBiTrinhDuyet: 'Chrome 124.0 (Windows 10)',
        maVe: 'TXP2605A401',
        tuyenXe: 'Sài Gòn ↔ Nha Trang',
        trangThaiCu: 'Trống',
        trangThaiMoi: 'Đã thanh toán',
        duLieuThayDoi: [
          { truong: 'Mã vé đặt', giaTriCu: 'Trống', giaTriMoi: 'TXP2605A401' },
          { truong: 'Phương thức', giaTriCu: 'Trống', giaTriMoi: 'Tiền mặt tại quầy' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0011',
        maKhachHang: 'TXP_KH098',
        tenKhachHang: 'Nguyễn Hữu Tài',
        soDienThoai: '0911222333',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Đăng nhập',
        thoiGian: this.getRelativeDateString(0, '18:22:10'),
        diaChiIP: '113.161.44.20',
        trangThai: 'Thất bại',
        noiDungChiTiet: 'Đăng nhập thất bại do nhập mật khẩu không chính xác.',
        thietBiTrinhDuyet: 'Chrome 124.0 (Android 14)'
      },
      {
        maNhatKy: 'TXP_LOG0012',
        maKhachHang: 'TXP_KH023',
        tenKhachHang: 'Lê Văn Cường',
        soDienThoai: '0905111222',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Đánh giá chuyến xe',
        thoiGian: this.getRelativeDateString(1, '21:05:00'),
        diaChiIP: '192.168.1.10',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Đánh giá 5 sao cho chuyến Bình Định ↔ Sài Gòn đi ngày 2026-05-18.',
        thietBiTrinhDuyet: 'Chrome 124.0 (Windows 11)'
      },
      {
        maNhatKy: 'TXP_LOG0013',
        maNhanVien: 'TXP_NV02',
        tenNhanVien: 'Vũ Quốc Hùng',
        soDienThoai: '0935999888',
        loaiTaiKhoan: 'Điều phối',
        loaiThaoTac: 'Quản lý lịch trình',
        thoiGian: this.getRelativeDateString(0, '08:10:00'),
        diaChiIP: '10.20.30.45',
        trangThai: 'Thất bại',
        noiDungChiTiet: 'Không thể cập nhật lịch trình tuyến SG-NT-20260520-01 do xe gán bị xung đột lịch chạy.',
        thietBiTrinhDuyet: 'Firefox 125.0 (macOS)'
      },
      {
        maNhatKy: 'TXP_LOG0014',
        maNhanVien: 'TXP_NV02',
        tenNhanVien: 'Vũ Quốc Hùng',
        soDienThoai: '0935999888',
        loaiTaiKhoan: 'Điều phối',
        loaiThaoTac: 'Quản lý tài xế',
        thoiGian: this.getRelativeDateString(1, '14:30:00'),
        diaChiIP: '10.20.30.45',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Phân công tài xế Nguyễn Thanh Sơn chịu trách nhiệm lái chính cho xe 79B-023.45 ngày 2026-05-21.',
        thietBiTrinhDuyet: 'Firefox 125.0 (macOS)',
        duLieuThayDoi: [
          { truong: 'Tài xế phân công', giaTriCu: 'Trống', giaTriMoi: 'Nguyễn Thanh Sơn' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0015',
        maKhachHang: 'TXP_KH055',
        tenKhachHang: 'Hoàng Văn Bảo',
        soDienThoai: '0912345678',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Đăng ký',
        thoiGian: this.getRelativeDateString(1, '09:00:00'),
        diaChiIP: '171.244.12.30',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Đăng ký tài khoản khách hàng thành công trực tuyến qua xác minh mã OTP gửi tới 0912345678.',
        thietBiTrinhDuyet: 'Safari (iOS 17)'
      },
      {
        maNhatKy: 'TXP_LOG0016',
        maNhanVien: 'TXP_NV01',
        tenNhanVien: 'Phan Văn Anh',
        soDienThoai: '0988777666',
        loaiTaiKhoan: 'Quản trị viên',
        loaiThaoTac: 'Quản lý tin tức',
        thoiGian: this.getRelativeDateString(2, '10:00:00'),
        diaChiIP: '10.20.30.12',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Đăng tải bài viết chương trình ưu đãi chào hè giảm 15% vé giường nằm trên trang chủ.',
        thietBiTrinhDuyet: 'Edge 124.0 (Windows 11)'
      },
      {
        maNhatKy: 'TXP_LOG0017',
        maKhachHang: 'TXP_KH023',
        tenKhachHang: 'Lê Văn Cường',
        soDienThoai: '0905111222',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Cập nhật thông tin cá nhân',
        thoiGian: this.getRelativeDateString(2, '16:45:00'),
        diaChiIP: '192.168.1.10',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Cập nhật địa chỉ email đăng ký liên lạc thành công.',
        thietBiTrinhDuyet: 'Chrome 124.0 (Windows 11)',
        duLieuThayDoi: [
          { truong: 'Email', giaTriCu: 'cuonglv@gmail.com', giaTriMoi: 'cuongle.work@gmail.com' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0018',
        maNhanVien: 'TXP_NV01',
        tenNhanVien: 'Phan Văn Anh',
        soDienThoai: '0988777666',
        loaiTaiKhoan: 'Quản trị viên',
        loaiThaoTac: 'Quản lý đánh giá',
        thoiGian: this.getRelativeDateString(2, '14:00:00'),
        diaChiIP: '10.20.30.12',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Ẩn phản hồi tiêu cực vi phạm quy tắc ngôn từ của tài khoản ẩn danh khỏi trang đánh giá công khai.',
        thietBiTrinhDuyet: 'Edge 124.0 (Windows 11)'
      },
      {
        maNhatKy: 'TXP_LOG0019',
        maKhachHang: 'TXP_KH023',
        tenKhachHang: 'Lê Văn Cường',
        soDienThoai: '0905111222',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Tra cứu vé',
        thoiGian: this.getRelativeDateString(0, '15:30:00'),
        diaChiIP: '192.168.1.10',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Khách hàng thực hiện tra cứu mã vé TXP2605C103 trên trang chủ.',
        thietBiTrinhDuyet: 'Chrome 124.0 (Windows 11)',
        maVe: 'TXP2605C103'
      },
      {
        maNhatKy: 'TXP_LOG0020',
        maKhachHang: 'TXP_KH023',
        tenKhachHang: 'Lê Văn Cường',
        soDienThoai: '0905111222',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Chỉnh sửa thông tin vé',
        thoiGian: this.getRelativeDateString(0, '20:00:00'),
        diaChiIP: '192.168.1.10',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Khách hàng cập nhật số điện thoại liên lạc khẩn cấp trên trang thông tin vé.',
        thietBiTrinhDuyet: 'Chrome 124.0 (Windows 11)',
        maVe: 'TXP2605C103',
        tuyenXe: 'Bình Định ↔ Sài Gòn',
        trangThaiCu: 'Đã thanh toán',
        trangThaiMoi: 'Đã thanh toán',
        duLieuThayDoi: [
          { truong: 'Số điện thoại', giaTriCu: '0905111222', giaTriMoi: '0905333444' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0021',
        maKhachHang: 'TXP_KH011',
        tenKhachHang: 'Trần Quốc Anh',
        maNhanVien: 'TXP_NV03',
        tenNhanVien: 'Trần Thị Thu',
        soDienThoai: '0967888999',
        loaiTaiKhoan: 'Bán vé',
        loaiThaoTac: 'Chỉnh sửa thông tin vé',
        thoiGian: this.getRelativeDateString(0, '18:45:00'),
        diaChiIP: '192.168.2.11',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Nhân viên bán vé Trần Thị Thu ghi nhận khách check-in lên xe tại Văn phòng Gia Lai.',
        thietBiTrinhDuyet: 'Chrome 124.0 (Windows 10)',
        maVe: 'TXP2605C101',
        tuyenXe: 'Gia Lai ↔ Đà Nẵng',
        trangThaiCu: 'Đã thanh toán',
        trangThaiMoi: 'Đã lên xe'
      },
      {
        maNhatKy: 'TXP_LOG0022',
        maKhachHang: 'TXP_KH002',
        tenKhachHang: 'Trần Thị Bích',
        maNhanVien: 'TXP_NV02',
        tenNhanVien: 'Vũ Quốc Hùng',
        soDienThoai: '0989111222',
        loaiTaiKhoan: 'Điều phối',
        loaiThaoTac: 'Chỉnh sửa thông tin vé',
        thoiGian: this.getRelativeDateString(0, '14:10:00'),
        diaChiIP: '10.20.30.45',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Điều phối viên Vũ Quốc Hùng hỗ trợ khách hàng đổi giờ khởi hành sang 19:00 cùng ngày.',
        thietBiTrinhDuyet: 'Firefox 125.0 (macOS)',
        maVe: 'TXP2605C102',
        tuyenXe: 'Sài Gòn ↔ Nha Trang',
        trangThaiCu: 'Đã thanh toán',
        trangThaiMoi: 'Đã đổi vé',
        duLieuThayDoi: [
          { truong: 'Giờ chạy', giaTriCu: '08:00 ngày 2026-05-20', giaTriMoi: '19:00 ngày 2026-05-20' },
          { truong: 'Số giường', giaTriCu: 'Phòng 04 (A)', giaTriMoi: 'Phòng 12 (B)' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0023',
        maKhachHang: 'TXP_KH055',
        tenKhachHang: 'Hoàng Văn Bảo',
        maNhanVien: 'TXP_NV01',
        tenNhanVien: 'Phan Văn Anh',
        soDienThoai: '0912345678',
        loaiTaiKhoan: 'Quản trị viên',
        loaiThaoTac: 'Hủy vé',
        thoiGian: this.getRelativeDateString(0, '09:10:00'),
        diaChiIP: '10.20.30.12',
        trangThai: 'Thành công',
        noiDungChiTiet: 'Quản trị viên Phan Văn Anh hủy vé thay khách do tuyến đi bị dời lịch khởi hành đột xuất.',
        thietBiTrinhDuyet: 'Edge 124.0 (Windows 11)',
        maVe: 'TXP2605A505',
        tuyenXe: 'Sài Gòn ↔ Nha Trang',
        trangThaiCu: 'Đã thanh toán',
        trangThaiMoi: 'Đã hủy'
      }
    ];
  }
}
