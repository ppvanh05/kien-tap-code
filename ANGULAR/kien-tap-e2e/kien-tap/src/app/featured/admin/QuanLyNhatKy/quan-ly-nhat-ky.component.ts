import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NhatKyService } from '../../../core/services/nhat-ky.service';

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

  constructor(
    private readonly nhatKyService: NhatKyService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeDates();
    this.loadLogs();
  }

  loadLogs() {
    this.nhatKyService.getAll().subscribe({
      next: (data) => {
        this.allLogs = data.map(log => this.mapToFrontend(log));
        this.calculateStats();
        this.applyFilters();
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error loading logs from backend:', err);
        this.allLogs = [];
        this.calculateStats();
        this.applyFilters();
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      }
    });
  }

  formatDateTime(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
  }

  mapToFrontend(l: any): AuditLog {
    let loaiTaiKhoan: 'Khách hàng' | 'Bán vé' | 'Điều phối' | 'Quản trị viên' | 'Ban quản lý' = 'Quản trị viên';
    const tenKhachHang = l.KHACH_HANG?.HoTenKhachHang;
    const tenNhanVien = l.NHAN_VIEN?.TenHienThi || l.NHAN_VIEN?.Ten;
    const soDienThoai = l.KHACH_HANG?.SoDienThoai || l.NHAN_VIEN?.SoDienThoai;

    if (l.MaKhachHang) {
      loaiTaiKhoan = 'Khách hàng';
    } else if (l.NHAN_VIEN) {
      const role = l.NHAN_VIEN.LoaiTaiKhoan;
      if (role === 'BanVe' || role === 'NhanVienBanVe') loaiTaiKhoan = 'Bán vé';
      else if (role === 'DieuPhoi' || role === 'NhanVienDieuPhoi') loaiTaiKhoan = 'Điều phối';
      else if (role === 'BanQuanLy') loaiTaiKhoan = 'Ban quản lý';
      else loaiTaiKhoan = 'Quản trị viên';
    }

    let duLieuThayDoi = undefined;
    if (l.DuLieuThayDoi) {
      try {
        duLieuThayDoi = typeof l.DuLieuThayDoi === 'string' ? JSON.parse(l.DuLieuThayDoi) : l.DuLieuThayDoi;
      } catch (e) {
        duLieuThayDoi = undefined;
      }
    }

    return {
      maNhatKy: l.MaNhatKy,
      maVe: l.MaVe || undefined,
      tuyenXe: l.TuyenXe || undefined,
      maKhachHang: l.MaKhachHang || undefined,
      tenKhachHang: tenKhachHang || undefined,
      soDienThoai: soDienThoai || undefined,
      maNhanVien: l.MaNhanVien || undefined,
      tenNhanVien: tenNhanVien || undefined,
      loaiTaiKhoan: loaiTaiKhoan,
      loaiThaoTac: l.LoaiThaoTac || 'Khác',
      thoiGian: l.ThoiGian ? this.formatDateTime(new Date(l.ThoiGian)) : '',
      diaChiIP: l.DiaChiIP || '127.0.0.1',
      trangThai: l.TrangThai === 'Thất bại' ? 'Thất bại' : 'Thành công',
      noiDungChiTiet: l.NoiDungChiTiet || '',
      thietBiTrinhDuyet: l.ThietBiTrinhDuyet || 'Web Client',
      trangThaiCu: l.TrangThaiCu || undefined,
      trangThaiMoi: l.TrangThaiMoi || undefined,
      duLieuThayDoi: Array.isArray(duLieuThayDoi) ? duLieuThayDoi : undefined
    };
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
}
