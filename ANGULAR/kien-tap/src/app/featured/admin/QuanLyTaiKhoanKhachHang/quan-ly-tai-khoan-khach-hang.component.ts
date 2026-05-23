import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  // Expose Math for template use
  protected readonly Math = Math;

  // Tabs: 'all' | 'active' | 'locked'
  activeTab: 'all' | 'active' | 'locked' = 'all';

  // Search and filters
  searchQuery: string = '';
  filterGender: string = 'Tất cả giới tính';

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

  ngOnInit() {
    this.loadMockCustomers();
    this.filterCustomers();
  }

  // Load mock customer data matching KHACH_HANG schema
  loadMockCustomers() {
    this.customers = [
      {
        maKhachHang: 'KH001',
        hoTenKhachHang: 'Nguyễn Hoàng Long',
        soDienThoai: '0905123456',
        email: 'hoanglong.nguyen@gmail.com',
        anhDaiDien: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        gioiTinh: 'Nam',
        ngaySinh: '1995-04-12',
        trangThaiTaiKhoan: 'HoatDong',
        ngayDangKy: '2025-01-10',
        tongSoVeDaDat: 12
      },
      {
        maKhachHang: 'KH002',
        hoTenKhachHang: 'Phan Thị Mai Chi',
        soDienThoai: '0987654321',
        email: 'maichi.phan@yahoo.com',
        anhDaiDien: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        gioiTinh: 'Nữ',
        ngaySinh: '1998-11-20',
        trangThaiTaiKhoan: 'HoatDong',
        ngayDangKy: '2025-02-15',
        tongSoVeDaDat: 8
      },
      {
        maKhachHang: 'KH003',
        hoTenKhachHang: 'Trần Văn Quyết',
        soDienThoai: '0914999888',
        email: 'vanquyet91@outlook.com',
        anhDaiDien: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        gioiTinh: 'Nam',
        ngaySinh: '1991-07-08',
        trangThaiTaiKhoan: 'DaKhoa',
        ngayDangKy: '2025-01-20',
        tongSoVeDaDat: 15,
        lyDoKhoa: 'Thực hiện spam đặt giữ chỗ nhiều lần không thanh toán (5 giao dịch liên tiếp)',
        ngayKhoa: '2026-05-10'
      },
      {
        maKhachHang: 'KH004',
        hoTenKhachHang: 'Lê Minh Hằng',
        soDienThoai: '0932777666',
        email: 'minhhang.le@gmail.com',
        anhDaiDien: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        gioiTinh: 'Nữ',
        ngaySinh: '2000-09-15',
        trangThaiTaiKhoan: 'HoatDong',
        ngayDangKy: '2025-03-01',
        tongSoVeDaDat: 3
      },
      {
        maKhachHang: 'KH005',
        hoTenKhachHang: 'Đặng Minh Khôi',
        soDienThoai: '0977888999',
        email: 'dangkhoy.dev@gmail.com',
        anhDaiDien: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        gioiTinh: 'Nam',
        ngaySinh: '1997-02-28',
        trangThaiTaiKhoan: 'HoatDong',
        ngayDangKy: '2025-03-12',
        tongSoVeDaDat: 5
      },
      {
        maKhachHang: 'KH006',
        hoTenKhachHang: 'Vũ Thảo Vy',
        soDienThoai: '0912345678',
        email: 'thaovy.vu@gmail.com',
        anhDaiDien: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        gioiTinh: 'Nữ',
        ngaySinh: '1996-06-18',
        trangThaiTaiKhoan: 'HoatDong',
        ngayDangKy: '2025-04-02',
        tongSoVeDaDat: 2
      },
      {
        maKhachHang: 'KH007',
        hoTenKhachHang: 'Bùi Đức Anh',
        soDienThoai: '0888123987',
        email: 'ducanh.bui@gmail.com',
        anhDaiDien: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        gioiTinh: 'Nam',
        ngaySinh: '1994-08-25',
        trangThaiTaiKhoan: 'DaKhoa',
        ngayDangKy: '2025-04-05',
        tongSoVeDaDat: 22,
        lyDoKhoa: 'Ghi nhận lịch sử vi phạm điều khoản hoàn hủy vé (hủy sát giờ > 3 lần trong tháng)',
        ngayKhoa: '2026-05-14'
      },
      {
        maKhachHang: 'KH008',
        hoTenKhachHang: 'Hoàng Kim Chi',
        soDienThoai: '0966444555',
        email: 'kimchi.hoang@hotmail.com',
        anhDaiDien: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150',
        gioiTinh: 'Nữ',
        ngaySinh: '1999-12-05',
        trangThaiTaiKhoan: 'HoatDong',
        ngayDangKy: '2025-04-18',
        tongSoVeDaDat: 6
      },
      {
        maKhachHang: 'KH009',
        hoTenKhachHang: 'Đỗ Tiến Đạt',
        soDienThoai: '0944333222',
        email: 'tiendat.do@gmail.com',
        anhDaiDien: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        gioiTinh: 'Nam',
        ngaySinh: '1993-01-30',
        trangThaiTaiKhoan: 'HoatDong',
        ngayDangKy: '2025-05-01',
        tongSoVeDaDat: 0
      },
      {
        maKhachHang: 'KH010',
        hoTenKhachHang: 'Phạm Ngọc Ánh',
        soDienThoai: '0988222111',
        email: 'ngocanh.pham@gmail.com',
        anhDaiDien: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
        gioiTinh: 'Nữ',
        ngaySinh: '2001-10-10',
        trangThaiTaiKhoan: 'HoatDong',
        ngayDangKy: '2025-05-05',
        tongSoVeDaDat: 1
      }
    ];
  }

  // Load ticket booking history mock data for a customer
  loadCustomerTickets(customerId: string) {
    const customer = this.customers.find(c => c.maKhachHang === customerId);
    const totalTickets = customer ? customer.tongSoVeDaDat : 0;
    
    if (totalTickets === 0) {
      this.customerTickets = [];
      return;
    }

    const routes = [
      { name: 'Hải Phòng - Hà Nội', price: 150000 },
      { name: 'Hà Nội - Hải Phòng', price: 150000 },
      { name: 'Hà Nội - Sapa', price: 320000 },
      { name: 'Sapa - Hà Nội', price: 320000 },
      { name: 'Đà Nẵng - Quy Nhơn', price: 220000 },
      { name: 'Hà Nội - Quảng Ninh', price: 200000 },
      { name: 'TP.Hồ Chí Minh - Đà Lạt', price: 280000 },
      { name: 'Đà Lạt - TP.Hồ Chí Minh', price: 280000 }
    ];
    const seats = ['A01', 'A02', 'A05', 'B03', 'B04', 'B08', 'A12', 'B12', 'A09', 'A10', 'B10'];
    const statuses: ('ConHieuLuc' | 'DaSuDung' | 'DaHuy')[] = ['DaSuDung', 'DaSuDung', 'DaSuDung', 'DaHuy'];

    this.customerTickets = [];
    for (let i = 1; i <= totalTickets; i++) {
      const routeIndex = (i + customerId.charCodeAt(customerId.length - 1)) % routes.length;
      const seatIndex = (i * 3) % seats.length;
      const statusIndex = (i * 7) % statuses.length;
      
      const day = String(1 + ((i * 13) % 28)).padStart(2, '0');
      const month = String(1 + ((i * 7) % 5)).padStart(2, '0');
      
      let status = statuses[statusIndex];
      if (i === 1 && customer?.trangThaiTaiKhoan === 'HoatDong' && totalTickets > 3) {
        status = 'ConHieuLuc';
      } else if (customerId === 'KH003' && i === 1) {
        status = 'ConHieuLuc';
      } else if (customerId === 'KH001' && i === 1) {
        status = 'ConHieuLuc';
      }

      this.customerTickets.push({
        maVe: 'VE' + (6000 + i * 47 + customerId.charCodeAt(customerId.length - 1) * 3),
        tuyenXe: routes[routeIndex].name,
        ghe: seats[seatIndex],
        ngayChay: `2026-${month}-${day}`,
        giaVe: routes[routeIndex].price,
        trangThai: status
      });
    }
    this.customerTickets.sort((a, b) => b.ngayChay.localeCompare(a.ngayChay));
  }

  // Load activity history log mock data for a customer
  loadCustomerLogs(customerId: string) {
    this.customerLogs = [
      { maNhatKy: 'NK8829', loaiThaoTac: 'Thay đổi thông tin', thoiGian: '2026-05-17 08:30:15', diaChiIP: '192.168.1.5', noiDungChiTiet: 'Cập nhật email từ hoanglong@gmail.com thành hoanglong.nguyen@gmail.com' },
      { maNhatKy: 'NK8172', loaiThaoTac: 'Đặt vé thành công', thoiGian: '2026-05-15 14:22:45', diaChiIP: '172.16.254.1', noiDungChiTiet: 'Khách hàng đặt thành công vé VE2981, tuyến Hải Phòng - Hà Nội' },
      { maNhatKy: 'NK7281', loaiThaoTac: 'Đăng nhập', thoiGian: '2026-05-15 14:15:02', diaChiIP: '172.16.254.1', noiDungChiTiet: 'Đăng nhập hệ thống bằng Web Client' },
      { maNhatKy: 'NK5980', loaiThaoTac: 'Đăng ký tài khoản', thoiGian: '2025-01-10 10:05:00', diaChiIP: '115.79.132.8', noiDungChiTiet: 'Đăng ký tài khoản mới qua OTP SMS thành công' }
    ];
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

  // Open detail/edit customer modal
  openDetailModal(customer: KhachHang) {
    this.selectedCustomer = customer;
    this.editedCustomer = { ...customer }; // deep copy for editing
    this.detailTabActive = 'info';
    this.formErrors = {};
    
    // Load associated tickets and logs
    this.loadCustomerTickets(customer.maKhachHang);
    this.loadCustomerLogs(customer.maKhachHang);
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
    let isValid = true;

    if (!this.editedCustomer) return false;

    // Full name check
    if (!this.editedCustomer.hoTenKhachHang || !this.editedCustomer.hoTenKhachHang.trim()) {
      this.formErrors['hoTenKhachHang'] = 'Họ tên khách hàng không được để trống!';
      isValid = false;
    }

    // Phone format check
    const phonePattern = /^(03|05|07|08|09)\d{8}$/;
    if (!this.editedCustomer.soDienThoai) {
      this.formErrors['soDienThoai'] = 'Số điện thoại không được để trống!';
      isValid = false;
    } else if (!phonePattern.test(this.editedCustomer.soDienThoai)) {
      this.formErrors['soDienThoai'] = 'Số điện thoại không đúng định dạng Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)!';
      isValid = false;
    } else {
      // Check phone duplicates
      const dup = this.customers.find(c => c.soDienThoai === this.editedCustomer?.soDienThoai && c.maKhachHang !== this.editedCustomer?.maKhachHang);
      if (dup) {
        this.formErrors['soDienThoai'] = 'Số điện thoại này đã được sử dụng bởi một tài khoản khác!';
        isValid = false;
      }
    }

    // Email format check
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (this.editedCustomer.email) {
      if (!emailPattern.test(this.editedCustomer.email)) {
        this.formErrors['email'] = 'Email không đúng định dạng!';
        isValid = false;
      } else {
        // Check email duplicates
        const dup = this.customers.find(c => c.email.toLowerCase() === this.editedCustomer?.email.toLowerCase() && c.maKhachHang !== this.editedCustomer?.maKhachHang);
        if (dup) {
          this.formErrors['email'] = 'Địa chỉ email này đã được sử dụng bởi một tài khoản khác!';
          isValid = false;
        }
      }
    }

    // Birthday validation
    if (this.editedCustomer.ngaySinh) {
      const birthDate = new Date(this.editedCustomer.ngaySinh);
      const today = new Date();
      if (birthDate > today) {
        this.formErrors['ngaySinh'] = 'Ngày sinh không thể lớn hơn ngày hiện tại!';
        isValid = false;
      }
    }

    return isValid;
  }

  // Update Customer basic details
  updateCustomer() {
    if (!this.validateForm() || !this.editedCustomer || !this.selectedCustomer) {
      this.showNotification(
        'Lỗi biểu mẫu',
        'Vui lòng kiểm tra lại các trường dữ liệu và sửa các lỗi hiển thị màu đỏ.',
        'error'
      );
      return;
    }

    // Find in original array and update
    const index = this.customers.findIndex(c => c.maKhachHang === this.editedCustomer?.maKhachHang);
    if (index !== -1) {
      // Log historical activity
      const original = this.customers[index];
      let auditLog = 'Cập nhật thông tin: ';
      const changes: string[] = [];
      if (original.hoTenKhachHang !== this.editedCustomer.hoTenKhachHang) changes.push(`Tên: ${original.hoTenKhachHang} -> ${this.editedCustomer.hoTenKhachHang}`);
      if (original.soDienThoai !== this.editedCustomer.soDienThoai) changes.push(`SĐT: ${original.soDienThoai} -> ${this.editedCustomer.soDienThoai}`);
      if (original.email !== this.editedCustomer.email) changes.push(`Email: ${original.email} -> ${this.editedCustomer.email}`);
      if (original.gioiTinh !== this.editedCustomer.gioiTinh) changes.push(`Giới tính: ${original.gioiTinh} -> ${this.editedCustomer.gioiTinh}`);
      if (original.ngaySinh !== this.editedCustomer.ngaySinh) changes.push(`Ngày sinh: ${original.ngaySinh} -> ${this.editedCustomer.ngaySinh}`);

      auditLog += changes.length > 0 ? changes.join(', ') : 'Không có thay đổi dữ liệu chính';

      this.customers[index] = { ...this.editedCustomer };
      
      // Push new audit log to beginning of mock logs
      this.customerLogs.unshift({
        maNhatKy: 'NK' + Math.floor(Math.random() * 9000 + 1000),
        loaiThaoTac: 'Cập nhật thông tin',
        thoiGian: this.formatCurrentDateTime(),
        diaChiIP: '192.168.1.1',
        noiDungChiTiet: auditLog
      });

      this.filterCustomers();
      this.selectedCustomer = { ...this.customers[index] };
      
      this.showNotification(
        'Cập nhật thành công',
        `Thông tin tài khoản khách hàng <strong>${this.selectedCustomer.hoTenKhachHang} (${this.selectedCustomer.maKhachHang})</strong> đã được cập nhật thành công trên hệ thống.`,
        'success'
      );
    }
  }

  // Pre-load customer and open lock prompt
  openLockCustomerModal(customer: KhachHang) {
    // BUSINESS EXCEPTION CHECK:
    // "Tài khoản khách hàng đang có vé chưa hoàn thành hoặc chuyến đi đang diễn ra: Hệ thống không cho phép khóa tài khoản khách hàng."
    this.loadCustomerTickets(customer.maKhachHang);
    const hasActiveTickets = this.customerTickets.some(t => t.trangThai === 'ConHieuLuc');
    
    if (hasActiveTickets) {
      const activeTicket = this.customerTickets.find(t => t.trangThai === 'ConHieuLuc');
      this.showNotification(
        'Không thể khóa tài khoản',
        `Tài khoản <strong>${customer.hoTenKhachHang}</strong> hiện đang có vé xe chưa hoàn thành (Mã vé: <strong>${activeTicket?.maVe}</strong>, Tuyến: <strong>${activeTicket?.tuyenXe}</strong>) hoặc có chuyến đi đang diễn ra.<br/><br/>Vui lòng hoàn thành chuyến đi hoặc xử lý hoàn hủy vé xe trước khi thực hiện khóa tài khoản!`,
        'warning'
      );
      return;
    }

    this.lockingCustomer = customer;
    this.lockReason = '';
    this.showLockModal = true;
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
      return;
    }

    if (this.lockingCustomer) {
      const index = this.customers.findIndex(c => c.maKhachHang === this.lockingCustomer?.maKhachHang);
      if (index !== -1) {
        this.customers[index].trangThaiTaiKhoan = 'DaKhoa';
        this.customers[index].lyDoKhoa = this.lockReason.trim();
        this.customers[index].ngayKhoa = this.formatCurrentDate();

        // Push audit log
        this.customerLogs.unshift({
          maNhatKy: 'NK' + Math.floor(Math.random() * 9000 + 1000),
          loaiThaoTac: 'Khóa tài khoản',
          thoiGian: this.formatCurrentDateTime(),
          diaChiIP: '192.168.1.1',
          noiDungChiTiet: `Khóa tài khoản khách hàng. Lý do: ${this.lockReason}`
        });

        this.filterCustomers();
        
        // Update currently selected if it is the same customer
        if (this.selectedCustomer?.maKhachHang === this.lockingCustomer.maKhachHang) {
          this.selectedCustomer = { ...this.customers[index] };
          this.editedCustomer = { ...this.customers[index] };
        }

        const name = this.lockingCustomer.hoTenKhachHang;
        this.closeLockModal();

        this.showNotification(
          'Đã khóa tài khoản',
          `Tài khoản khách hàng <strong>${name}</strong> đã bị chuyển sang trạng thái <strong>Đã khóa</strong>. Người dùng này sẽ không thể đăng nhập hoặc đặt vé mới trên hệ thống.`,
          'success'
        );
      }
    }
  }

  // Unlock Customer
  unlockCustomer(customer: KhachHang) {
    const index = this.customers.findIndex(c => c.maKhachHang === customer.maKhachHang);
    if (index !== -1) {
      this.customers[index].trangThaiTaiKhoan = 'HoatDong';
      this.customers[index].lyDoKhoa = undefined;
      this.customers[index].ngayKhoa = undefined;

      // Push audit log
      this.customerLogs.unshift({
        maNhatKy: 'NK' + Math.floor(Math.random() * 9000 + 1000),
        loaiThaoTac: 'Mở khóa tài khoản',
        thoiGian: this.formatCurrentDateTime(),
        diaChiIP: '192.168.1.1',
        noiDungChiTiet: 'Mở khóa tài khoản khách hàng, chuyển trạng thái sang Hoạt động.'
      });

      this.filterCustomers();

      // Update currently selected if it is the same customer
      if (this.selectedCustomer?.maKhachHang === customer.maKhachHang) {
        this.selectedCustomer = { ...this.customers[index] };
        this.editedCustomer = { ...this.customers[index] };
      }

      this.showNotification(
        'Đã mở khóa tài khoản',
        `Tài khoản khách hàng <strong>${customer.hoTenKhachHang}</strong> đã được mở khóa thành công và có thể hoạt động bình thường trên hệ thống.`,
        'success'
      );
    }
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
}
