import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';

interface Order {
  maDonHang: string;
  soLuongVeDaDat: number;
  tenTuyenXe: string;
  ngayKhoiHanh: string;
  gioKhoiHanh: string;
  tongGiaVe: number;
  phuongThucThanhToan: string;
  trangThaiDonHang: 'Chờ thanh toán' | 'Chờ khởi hành' | 'Đã hoàn thành' | 'Đã hủy' | 'Chưa đánh giá' | 'Đã đánh giá';
  soDienThoai: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  activeTab = 'profile';
  isEditing = false;
  showOtpModal = false;
  showSuccessModal = false;
  isLogoutActive = false;
  
  // Password Visibility
  showCurrentPwd = false;
  showNewPwd = false;
  showConfirmPwd = false;

  // Password fields
  passwords = {
    current: '',
    new: '',
    confirm: ''
  };

  // OTP
  otpInputs = [
    { value: '' },
    { value: '' },
    { value: '' },
    { value: '' },
    { value: '' },
    { value: '' }
  ];
  otpTimer = 90; // 01:30
  timerInterval: any;

  // Success Redirect
  redirectTimer = 3;
  redirectInterval: any;

  user = {
    fullName: 'Nguyễn Văn An',
    phone: '090 123 4567',
    gender: 'Nam',
    email: 'vanan.nguyen@email.com',
    dob: '1992-05-15',
    address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    avatar: 'asset/images/customer/avatar_placeholder.png'
  };

  editUser = { ...this.user };

  // Filters state variables
  filterMaDonHang = '';
  filterThoiGianDat = '';
  filterTenTuyenXe = '';
  filterTrangThai = '';

  // Mock booking history records
  historyOrders = [
    {
      maDonHang: 'P5UOLWB8',
      soLuongVeDaDat: 1,
      tenTuyenXe: 'Da Lat - Mien Tay',
      ngayKhoiHanh: '21-05-2026',
      gioKhoiHanh: '00:00',
      tongGiaVe: 260000,
      phuongThucThanhToan: 'MoMo',
      trangThaiDonHang: 'Đã hoàn thành',
      soDienThoai: '0901234567'
    },
    {
      maDonHang: 'P5ULATI1',
      soLuongVeDaDat: 1,
      tenTuyenXe: 'Da Lat - Mien Tay',
      ngayKhoiHanh: '03-05-2026',
      gioKhoiHanh: '17:30',
      tongGiaVe: 364000,
      phuongThucThanhToan: 'Momo',
      trangThaiDonHang: 'Đã hoàn thành',
      soDienThoai: '0901234567'
    },
    {
      maDonHang: 'P5IMBT0V',
      soLuongVeDaDat: 1,
      tenTuyenXe: 'Da Lat - Mien Dong moi',
      ngayKhoiHanh: '03-05-2026',
      gioKhoiHanh: '23:05',
      tongGiaVe: 364000,
      phuongThucThanhToan: 'MoMo',
      trangThaiDonHang: 'Đã hoàn thành',
      soDienThoai: '0901234567'
    },
    {
      maDonHang: 'P5IOCBZB',
      soLuongVeDaDat: 1,
      tenTuyenXe: 'Da Lat - Mien Dong moi',
      ngayKhoiHanh: '03-05-2026',
      gioKhoiHanh: '23:05',
      tongGiaVe: 364000,
      phuongThucThanhToan: 'unknown',
      trangThaiDonHang: 'Chờ thanh toán',
      soDienThoai: '0901234567'
    },
    {
      maDonHang: 'P5ITF2W9',
      soLuongVeDaDat: 1,
      tenTuyenXe: 'Da Lat - Mien Dong moi',
      ngayKhoiHanh: '03-05-2026',
      gioKhoiHanh: '23:05',
      tongGiaVe: 364000,
      phuongThucThanhToan: 'unknown',
      trangThaiDonHang: 'Đã hủy',
      soDienThoai: '0901234567'
    },
    {
      maDonHang: 'P5CDWE67',
      soLuongVeDaDat: 1,
      tenTuyenXe: 'Mien Dong moi - Da Lat',
      ngayKhoiHanh: '24-04-2026',
      gioKhoiHanh: '22:25',
      tongGiaVe: 260000,
      phuongThucThanhToan: 'MoMo',
      trangThaiDonHang: 'Đã hoàn thành',
      soDienThoai: '0333555412'
    },
    {
      maDonHang: 'P5CDWE88',
      soLuongVeDaDat: 2,
      tenTuyenXe: 'Bến xe Miền Tây - Bến xe Quy Nhơn',
      ngayKhoiHanh: '22-05-2026',
      gioKhoiHanh: '18:00',
      tongGiaVe: 800000,
      phuongThucThanhToan: 'VietQR / Napas',
      trangThaiDonHang: 'Đã hoàn thành',
      soDienThoai: '0981939379'
    }
  ];

  filteredHistoryOrders = [...this.historyOrders];

  

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.authService.userName$.subscribe((name: string) => this.user.fullName = name);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      if (tab === 'history' || tab === 'password' || tab === 'profile') {
        this.activeTab = tab;
      } else {
        this.activeTab = 'profile';
      }
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.redirectInterval) clearInterval(this.redirectInterval);
  }

  // Filter history logic
  searchHistory(): void {
    const code = this.filterMaDonHang.trim().toUpperCase();
    const date = this.filterThoiGianDat; // Format YYYY-MM-DD
    const route = this.filterTenTuyenXe.trim().toLowerCase();
    const status = this.filterTrangThai;

    this.filteredHistoryOrders = this.historyOrders.filter(order => {
      // 1. Check Code matching
      if (code && !order.maDonHang.toUpperCase().includes(code)) return false;

      // 2. Check Date matching (convert order date DD-MM-YYYY to YYYY-MM-DD)
      if (date) {
        const parts = order.ngayKhoiHanh.split('-');
        if (parts.length === 3) {
          const orderDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
          if (orderDateStr !== date) return false;
        }
      }

      // 3. Check Route matching
      if (route && !order.tenTuyenXe.toLowerCase().includes(route)) return false;

      // 4. Check Status matching
      if (status) {
        if (status === 'Chờ thanh toán') {
          if (order.trangThaiDonHang !== 'Chờ thanh toán') return false;
        } else if (status === 'Chờ khởi hành') {
          if (order.trangThaiDonHang !== 'Chờ khởi hành') return false;
        } else if (status === 'Đã hoàn thành') {
          if (order.trangThaiDonHang !== 'Đã hoàn thành') return false;
        } else if (status === 'Đã hủy') {
          if (order.trangThaiDonHang !== 'Đã hủy') return false;
        } else if (status === 'Chưa đánh giá') {
          if (order.trangThaiDonHang !== 'Chưa đánh giá') return false;
        } else if (status === 'Đã đánh giá') {
          if (order.trangThaiDonHang !== 'Đã đánh giá') return false;
        }
      }

      return true;
    });
  }

  resetHistoryFilter(): void {
    this.filterMaDonHang = '';
    this.filterThoiGianDat = '';
    this.filterTenTuyenXe = '';
    this.filterTrangThai = '';
    this.searchHistory();
  }

  // Go to ticket detail
  viewTicketDetail(order: any): void {
    this.router.navigate(['/tra-cuu-ve'], {
      queryParams: {
        phone: order.soDienThoai,
        code: order.maDonHang
      }
    });
  }

  startEdit() {
    this.editUser = { ...this.user };
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveProfile() {
    this.user = { ...this.editUser };
    this.isEditing = false;
  }

  confirmChangePassword() {
    this.showOtpModal = true;
    this.startOtpTimer();
  }

  startOtpTimer() {
    this.otpTimer = 90;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.otpTimer > 0) {
        this.otpTimer--;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}s`;
  }

  closeOtpModal() {
    this.showOtpModal = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  verifyOtp() {
    const otpCode = this.otpInputs.map(i => i.value).join('');
    if (otpCode.length === 6) {
      this.closeOtpModal();
      this.showSuccessModal = true;
      this.startRedirectTimer();
    } else {
      console.log('Vui lòng nhập đủ 6 số OTP');
    }
  }

  startRedirectTimer() {
    this.redirectTimer = 3;
    if (this.redirectInterval) clearInterval(this.redirectInterval);
    this.redirectInterval = setInterval(() => {
      if (this.redirectTimer > 1) {
        this.redirectTimer--;
      } else {
        this.goToLogin();
      }
    }, 1000);
  }

  goToLogin() {
    if (this.redirectInterval) clearInterval(this.redirectInterval);
    this.showSuccessModal = false;
    this.passwords = { current: '', new: '', confirm: '' };
    this.router.navigate(['/login']);
  }

  onOtpInput(event: any, index: number) {
    const value = event.target.value;
    if (value && index < 5) {
      const nextInput = event.target.nextElementSibling;
      if (nextInput) nextInput.focus();
    }
  }

  goToBooking() {
    this.router.navigate(['/tim-kiem-chuyen']);
  }

  logout() {
    this.isLogoutActive = true;
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  getStatusClasses(status: string): { [key: string]: boolean } {
    return {
      'bg-success-light': status === 'Đã hoàn thành' || status === 'Đã đánh giá',
      'text-success-text': status === 'Đã hoàn thành' || status === 'Đã đánh giá',
      'bg-danger-light': status === 'Đã hủy',
      'text-danger-text': status === 'Đã hủy',
      'bg-info-light': status === 'Chờ thanh toán',
      'text-info-text': status === 'Chờ thanh toán',
      'bg-warning-light': status === 'Chờ khởi hành',
      'text-warning-text': status === 'Chờ khởi hành',
    };
  }
}


