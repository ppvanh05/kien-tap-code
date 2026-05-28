import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KhachHangService } from '../../../core/services/khach-hang.service';

export interface KhachHang {
  maKhachHang: string;
  hoTenKhachHang: string;
  soDienThoai: string;
  email: string;
  anhDaiDien: string;
  gioiTinh: 'Nam' | 'Nữ' | 'Khác';
  ngaySinh: string;
  trangThaiTaiKhoan: 'HoatDong' | 'DaKhoa';
  ngayDangKy: string;
  tongSoVeDaDat: number;
  lyDoKhoa?: string;
  ngayKhoa?: string;
}

export interface VeKhachHang {
  maVe: string;
  tuyenXe: string;
  ghe: string;
  ngayChay: string;
  giaVe: number;
  trangThai: 'ConHieuLuc' | 'DaSuDung' | 'DaHuy';
}

export interface NhatKyKhachHang {
  maNhatKy: string;
  loaiThaoTac: string;
  thoiGian: string;
  diaChiIP: string;
  noiDungChiTiet: string;
}

@Component({
  selector: 'app-quan-ly-tai-khoan-khach-hang',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quan-ly-tai-khoan-khach-hang.component.html',
  styleUrls: ['./quan-ly-tai-khoan-khach-hang.component.css']
})
export class QuanLyTaiKhoanKhachHangComponent implements OnInit {
  isBrowser: boolean = false;

  constructor(
    private readonly khachHangService: KhachHangService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Expose Math for template use
  protected readonly Math = Math;

  // Tabs: 'all' | 'active' | 'locked'
  activeTab: 'all' | 'active' | 'locked' = 'all';

  // Search and filters
  searchQuery: string = '';
  filterGender: string = 'Tất cả giới tính';
  isEditMode: boolean = false;

  // Customer Lists
  customers: KhachHang[] = [];
  filteredCustomers: KhachHang[] = [];
  displayCustomers: KhachHang[] = [];

  // Selected customer for detail/edit
  selectedCustomer: KhachHang | null = null;
  editedCustomer: KhachHang | null = null;
  detailTabActive: 'info' | 'booking' | 'logs' = 'info';

  // Booking history & logs of selected customer
  customerTickets: VeKhachHang[] = [];
  customerLogs: NhatKyKhachHang[] = [];

  // Lock customer details
  showLockModal: boolean = false;
  lockingCustomer: KhachHang | null = null;
  lockReason: string = '';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Custom premium alert notification
  notification = {
    show: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'warning' | 'error'
  };

  // Temp form validation errors
  formErrors: { [key: string]: string } = {};

  mapToFrontend(c: any): KhachHang {
    return {
      maKhachHang: c.MaKhachHang,
      hoTenKhachHang: c.HoTenKhachHang,
      soDienThoai: c.SoDienThoai,
      email: c.Email,
      anhDaiDien: c.AnhDaiDien || '',
      gioiTinh: c.GioiTinh || 'Nam',
      ngaySinh: c.NgaySinh ? c.NgaySinh.split('T')[0] : '',
      trangThaiTaiKhoan: c.TrangThaiTaiKhoan === 'DaKhoa' ? 'DaKhoa' : 'HoatDong',
      ngayDangKy: c.NgayDangKy ? c.NgayDangKy.split('T')[0] : '',
      tongSoVeDaDat: c.tongSoVeDaDat || 0,
      lyDoKhoa: c.LyDoKhoa || undefined,
      ngayKhoa: c.NgayKhoa ? c.NgayKhoa.split('T')[0] : undefined
    };
  }

  mapToBackend(c: KhachHang, isCreate: boolean = false): any {
    const data: any = {
      MaKhachHang: c.maKhachHang,
      HoTenKhachHang: c.hoTenKhachHang,
      SoDienThoai: c.soDienThoai,
      Email: c.email,
      AnhDaiDien: c.anhDaiDien || null,
      GioiTinh: c.gioiTinh,
      NgaySinh: c.ngaySinh ? new Date(c.ngaySinh) : null,
      TrangThaiTaiKhoan: c.trangThaiTaiKhoan
    };
    if (isCreate) {
      data.MatKhau = '123456';
      data.NgayDangKy = new Date();
    }
    return data;
  }

  loadCustomers() {
    this.khachHangService.getAll().subscribe({
      next: (data) => {
        this.customers = data.map(c => this.mapToFrontend(c));
        this.filterCustomers();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showNotification('Lỗi tải dữ liệu', 'Không thể kết nối đến backend để lấy danh sách khách hàng.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.loadCustomers();
    }
  }



  // Tabs switcher
  setTab(tab: 'all' | 'active' | 'locked') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.filterCustomers();
  }

  // Filtering by status, search queries, and gender filters
  filterCustomers() {
    let result = [...this.customers];

    // 1. Status Filter
    if (this.activeTab === 'active') {
      result = result.filter(c => c.trangThaiTaiKhoan === 'HoatDong');
    } else if (this.activeTab === 'locked') {
      result = result.filter(c => c.trangThaiTaiKhoan === 'DaKhoa');
    }

    // 2. Gender Filter
    if (this.filterGender !== 'Tất cả giới tính') {
      result = result.filter(c => c.gioiTinh === this.filterGender);
    }

    // 3. Search Query (Name, Phone, Email, ID)
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        c.maKhachHang.toLowerCase().includes(query) ||
        c.hoTenKhachHang.toLowerCase().includes(query) ||
        c.soDienThoai.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
      );
    }

    // Sort by Registration Date newest first
    result.sort((a, b) => b.ngayDangKy.localeCompare(a.ngayDangKy));

    this.filteredCustomers = result;
    this.calculatePagination();
  }

  search() {
    this.filterCustomers();
  }

  // Pagination Logic
  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredCustomers.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.updateDisplayList();
  }

  updateDisplayList() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayCustomers = this.filteredCustomers.slice(startIndex, endIndex);
  }

  changePageSize(event: any) {
    this.pageSize = parseInt(event.target.value, 10);
    this.currentPage = 1;
    this.calculatePagination();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayList();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayList();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayList();
    }
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatDateTime(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }

  createEmptyForm(): KhachHang {
    return {
      maKhachHang: '',
      hoTenKhachHang: '',
      soDienThoai: '',
      email: '',
      anhDaiDien: '',
      gioiTinh: 'Nam',
      ngaySinh: '',
      trangThaiTaiKhoan: 'HoatDong',
      ngayDangKy: this.formatCurrentDate(),
      tongSoVeDaDat: 0
    };
  }

  openAddModal() {
    this.isEditMode = false;
    this.formErrors = {};
    const newCust = this.createEmptyForm();
    
    // Auto-generate customer ID KHxxxxxx (6 digits)
    const numericIds = this.customers
      .map(c => parseInt(c.maKhachHang.replace(/[^\d]/g, '')))
      .filter(id => !isNaN(id) && id >= 100000 && id < 1000000);
    const maxIdNumber = numericIds.length > 0 ? Math.max(...numericIds) : 100000;
    newCust.maKhachHang = 'KH' + String(maxIdNumber + 1).padStart(6, '0');

    this.selectedCustomer = newCust;
    this.editedCustomer = { ...newCust };
    this.detailTabActive = 'info';
    this.cdr.detectChanges();
  }

  // Open detail/edit customer modal
  openDetailModal(customer: KhachHang) {
    this.isEditMode = true;
    this.selectedCustomer = customer;
    this.editedCustomer = { ...customer }; // deep copy for editing
    this.detailTabActive = 'info';
    this.formErrors = {};
    
    // Load associated tickets
    this.khachHangService.getVeByKhachHang(customer.maKhachHang).subscribe({
      next: (tickets) => {
        this.customerTickets = tickets.map((t: any) => ({
          maVe: t.MaVe,
          tuyenXe: t.LICH_TRINH?.TUYEN_XE?.TenTuyenXe || 'Không rõ',
          ghe: t.GHE_CHUYEN_XE?.MaGhe || 'Không rõ',
          ngayChay: t.LICH_TRINH?.NgayKhoiHanh ? t.LICH_TRINH.NgayKhoiHanh.split('T')[0] : 'Không rõ',
          giaVe: Number(t.GiaVe),
          trangThai: t.TrangThaiVe
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.customerTickets = [];
        this.cdr.detectChanges();
      }
    });

    // Load activity logs
    this.khachHangService.getNhatKyByKhachHang(customer.maKhachHang).subscribe({
      next: (logs) => {
        this.customerLogs = logs.map((l: any) => ({
          maNhatKy: l.MaNhatKy,
          loaiThaoTac: l.LoaiThaoTac || '',
          thoiGian: l.ThoiGian ? this.formatDateTime(new Date(l.ThoiGian)) : '',
          diaChiIP: l.DiaChiIP || '',
          noiDungChiTiet: l.NoiDungChiTiet || ''
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.customerLogs = [];
        this.cdr.detectChanges();
      }
    });
  }

  closeDetailModal() {
    this.selectedCustomer = null;
    this.editedCustomer = null;
  }

  // Switch detail active sub-tab
  setDetailTab(tab: 'info' | 'booking' | 'logs') {
    this.detailTabActive = tab;
  }

  // Form validations before update
  validateForm(): boolean {
    this.formErrors = {};
    if (!this.editedCustomer) return false;

    this.validateField('hoTenKhachHang');
    this.validateField('soDienThoai');
    this.validateField('email');
    this.validateField('ngaySinh');

    return Object.keys(this.formErrors).length === 0;
  }

  validateField(field: string) {
    if (!this.editedCustomer) return;

    if (field === 'hoTenKhachHang') {
      if (!this.editedCustomer.hoTenKhachHang || !this.editedCustomer.hoTenKhachHang.trim()) {
        this.formErrors['hoTenKhachHang'] = 'Họ tên khách hàng không được để trống!';
      } else {
        delete this.formErrors['hoTenKhachHang'];
      }
    }

    if (field === 'soDienThoai') {
      const phonePattern = /^(03|05|07|08|09)\d{8}$/;
      if (!this.editedCustomer.soDienThoai) {
        this.formErrors['soDienThoai'] = 'Số điện thoại không được để trống!';
      } else if (!phonePattern.test(this.editedCustomer.soDienThoai)) {
        this.formErrors['soDienThoai'] = 'Số điện thoại không đúng định dạng Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)!';
      } else {
        const dup = this.customers.find(c => c.soDienThoai === this.editedCustomer?.soDienThoai && c.maKhachHang !== this.editedCustomer?.maKhachHang);
        if (dup) {
          this.formErrors['soDienThoai'] = 'Số điện thoại này đã được sử dụng bởi một tài khoản khác!';
        } else {
          delete this.formErrors['soDienThoai'];
        }
      }
    }

    if (field === 'email') {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!this.editedCustomer.email || !this.editedCustomer.email.trim()) {
        delete this.formErrors['email'];
      } else if (!emailPattern.test(this.editedCustomer.email)) {
        this.formErrors['email'] = 'Email không đúng định dạng!';
      } else {
        const dup = this.customers.find(c => c.email && c.email.toLowerCase() === this.editedCustomer?.email?.toLowerCase() && c.maKhachHang !== this.editedCustomer?.maKhachHang);
        if (dup) {
          this.formErrors['email'] = 'Địa chỉ email này đã được sử dụng bởi một tài khoản khác!';
        } else {
          delete this.formErrors['email'];
        }
      }
    }

    if (field === 'ngaySinh') {
      if (!this.editedCustomer.ngaySinh) {
        delete this.formErrors['ngaySinh'];
      } else {
        const birthDate = new Date(this.editedCustomer.ngaySinh);
        const today = new Date();
        if (birthDate > today) {
          this.formErrors['ngaySinh'] = 'Ngày sinh không thể lớn hơn ngày hiện tại!';
        } else {
          delete this.formErrors['ngaySinh'];
        }
      }
    }

    this.cdr.detectChanges();
  }

  // Save/Create Customer
  saveCustomer() {
    if (!this.validateForm() || !this.editedCustomer || !this.selectedCustomer) {
      this.showNotification(
        'Lỗi biểu mẫu',
        'Vui lòng kiểm tra lại các trường dữ liệu và sửa các lỗi hiển thị màu đỏ.',
        'error'
      );
      this.cdr.detectChanges();
      return;
    }

    if (this.isEditMode) {
      const backendData = this.mapToBackend(this.editedCustomer, false);
      this.khachHangService.update(this.editedCustomer.maKhachHang, backendData).subscribe({
        next: (res) => {
          this.showNotification(
            'Cập nhật thành công',
            `Thông tin tài khoản khách hàng <strong>${res.HoTenKhachHang} (${res.MaKhachHang})</strong> đã được cập nhật thành công.`,
            'success'
          );
          this.loadCustomers();
          this.closeDetailModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          const errMsg = err.error?.message || 'Không thể cập nhật thông tin khách hàng trên backend.';
          this.showNotification('Lỗi cập nhật', errMsg, 'error');
          this.cdr.detectChanges();
        }
      });
    } else {
      const backendData = this.mapToBackend(this.editedCustomer, true);
      this.khachHangService.create(backendData).subscribe({
        next: (res) => {
          this.showNotification(
            'Khởi tạo thành công',
            `Tài khoản khách hàng <strong>${res.HoTenKhachHang} (${res.MaKhachHang})</strong> đã được khởi tạo thành công. Mật khẩu mặc định là: <strong>123456</strong>.`,
            'success'
          );
          this.loadCustomers();
          this.closeDetailModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          const errMsg = err.error?.message || 'Không thể khởi tạo tài khoản khách hàng mới.';
          this.showNotification('Lỗi khởi tạo', errMsg, 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Pre-load customer and open lock prompt
  openLockCustomerModal(customer: KhachHang) {
    this.khachHangService.getVeByKhachHang(customer.maKhachHang).subscribe({
      next: (tickets) => {
        const hasActiveTickets = tickets.some((t: any) => t.TrangThaiVe === 'ConHieuLuc');
        if (hasActiveTickets) {
          const activeTicket = tickets.find((t: any) => t.TrangThaiVe === 'ConHieuLuc');
          this.showNotification(
            'Không thể khóa tài khoản',
            `Tài khoản <strong>${customer.hoTenKhachHang}</strong> hiện đang có vé xe chưa hoàn thành (Mã vé: <strong>${activeTicket?.MaVe}</strong>) hoặc có chuyến đi đang diễn ra.<br/><br/>Vui lòng hoàn thành chuyến đi hoặc xử lý hoàn hủy vé xe trước khi thực hiện khóa tài khoản!`,
            'warning'
          );
        } else {
          this.lockingCustomer = customer;
          this.lockReason = '';
          this.showLockModal = true;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showNotification('Lỗi hệ thống', 'Không thể kiểm tra vé của khách hàng này.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  closeLockModal() {
    this.showLockModal = false;
    this.lockingCustomer = null;
    this.lockReason = '';
  }

  // Execute locking
  confirmLockCustomer() {
    if (!this.lockReason || !this.lockReason.trim()) {
      this.showNotification('Yêu cầu lý do', 'Vui lòng nhập lý do khóa tài khoản khách hàng để phục vụ đối soát và ghi nhật ký!', 'warning');
      this.cdr.detectChanges();
      return;
    }

    if (this.lockingCustomer) {
      this.khachHangService.khoaTaiKhoan(this.lockingCustomer.maKhachHang, this.lockReason.trim()).subscribe({
        next: (res) => {
          this.showNotification(
            'Đã khóa tài khoản',
            `Tài khoản khách hàng <strong>${res.HoTenKhachHang}</strong> đã bị chuyển sang trạng thái <strong>Đã khóa</strong>.`,
            'success'
          );
          
          // Update local objects to reflect locked status immediately
          if (this.selectedCustomer && this.selectedCustomer.maKhachHang === this.lockingCustomer?.maKhachHang) {
            this.selectedCustomer.trangThaiTaiKhoan = 'DaKhoa';
            this.selectedCustomer.lyDoKhoa = this.lockReason.trim();
            this.selectedCustomer.ngayKhoa = this.formatCurrentDate();
          }
          if (this.editedCustomer && this.editedCustomer.maKhachHang === this.lockingCustomer?.maKhachHang) {
            this.editedCustomer.trangThaiTaiKhoan = 'DaKhoa';
            this.editedCustomer.lyDoKhoa = this.lockReason.trim();
            this.editedCustomer.ngayKhoa = this.formatCurrentDate();
          }

          this.loadCustomers();
          this.closeLockModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.showNotification('Lỗi khóa tài khoản', err.error?.message || 'Không thể khóa tài khoản khách hàng!', 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Unlock Customer
  unlockCustomer(customer: KhachHang) {
    this.khachHangService.moKhoaTaiKhoan(customer.maKhachHang).subscribe({
      next: (res) => {
        this.showNotification(
          'Đã mở khóa tài khoản',
          `Tài khoản khách hàng <strong>${res.HoTenKhachHang}</strong> đã được mở khóa thành công.`,
          'success'
        );

        // Update local objects to reflect unlocked status immediately
        if (this.selectedCustomer && this.selectedCustomer.maKhachHang === customer.maKhachHang) {
          this.selectedCustomer.trangThaiTaiKhoan = 'HoatDong';
          this.selectedCustomer.lyDoKhoa = undefined;
          this.selectedCustomer.ngayKhoa = undefined;
        }
        if (this.editedCustomer && this.editedCustomer.maKhachHang === customer.maKhachHang) {
          this.editedCustomer.trangThaiTaiKhoan = 'HoatDong';
          this.editedCustomer.lyDoKhoa = undefined;
          this.editedCustomer.ngayKhoa = undefined;
        }

        this.loadCustomers();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showNotification('Lỗi mở khóa', 'Không thể mở khóa tài khoản khách hàng!', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // Visual/Notification helpers
  showNotification(title: string, message: string, type: 'success' | 'warning' | 'error' = 'success') {
    this.notification = {
      show: true,
      title,
      message,
      type
    };
  }

  closeNotification() {
    this.notification.show = false;
  }

  // Helpers
  formatCurrentDate(): string {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  formatCurrentDateTime(): string {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
  }

  getInitials(name: string): string {
    if (!name) return 'KH';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[words.length - 2][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  triggerImageUpload(input: HTMLInputElement) {
    input.click();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.showNotification('Dung lượng ảnh quá lớn', 'Ảnh đại diện không được vượt quá <strong>2MB</strong>!', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (this.editedCustomer) {
          this.editedCustomer.anhDaiDien = reader.result as string;
          this.cdr.detectChanges();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar(event: MouseEvent) {
    event.stopPropagation();
    if (this.editedCustomer) {
      this.editedCustomer.anhDaiDien = '';
      this.cdr.detectChanges();
    }
  }
}
