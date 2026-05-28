import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { AuthService, UserProfile } from '../../../core/services/auth.service'; // Import UserProfile
import { CustomerHoSoService } from '../../../core/customer-ho-so.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

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

  user: UserProfile = {
    MaKhachHang: '',
    HoTenKhachHang: 'Guest',
    SoDienThoai: '',
    Email: '',
    AnhDaiDien: '/asset/images/customer/user.png',
    GioiTinh: '',
    NgaySinh: '',
    TrangThaiTaiKhoan: ''
  };

  editUser: UserProfile = { ...this.user };

  // Validation errors
  HoTenKhachHangError = '';
  EmailError = '';
  NgaySinhError = '';
  AnhDaiDienError = '';
  formError = '';

  get isFormValid(): boolean {
    return !this.HoTenKhachHangError && !this.EmailError && !this.NgaySinhError && !this.AnhDaiDienError && 
           this.editUser.HoTenKhachHang.trim().length >= 2;
  }

  // Filters state variables
  filterMaDonHang = '';
  filterThoiGianDat = '';
  filterTenTuyenXe = '';
  filterTrangThai = '';

  // Avatar upload
  selectedAvatarFile: File | null = null;

  // Mock booking history records
  historyOrders: Order[] = [];
  filteredHistoryOrders: Order[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private customerHoSoService: CustomerHoSoService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      if (tab === 'history' || tab === 'password' || tab === 'profile') {
        this.activeTab = tab;
      } else {
        this.activeTab = 'profile';
      }
    });

    this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user && user.MaKhachHang) {
          // Cập nhật MaKhachHang của user trong component
          this.user.MaKhachHang = user.MaKhachHang;
          return this.customerHoSoService.getProfile(user.MaKhachHang);
        }
        return of(null);
      })
    ).subscribe({
      next: (profileData: any) => {
        if (profileData) {
          this.user = {
            MaKhachHang: profileData.MaKhachHang,
            HoTenKhachHang: profileData.HoTenKhachHang,
            SoDienThoai: profileData.SoDienThoai,
            Email: profileData.Email,
            AnhDaiDien: profileData.AnhDaiDien || '/asset/images/customer/user.png',
            GioiTinh: profileData.GioiTinh,
            NgaySinh: profileData.NgaySinh ? new Date(profileData.NgaySinh).toISOString().split('T')[0] : '',
            TrangThaiTaiKhoan: profileData.TrangThaiTaiKhoan
          };
          this.editUser = { ...this.user };
          this.authService.setCurrentUser(this.user); // Cập nhật AuthService với dữ liệu đầy đủ
        }
      },
      error: (err: any) => {
        console.error('Error fetching profile:', err);
        // Xử lý lỗi, ví dụ: chuyển hướng về trang đăng nhập nếu token hết hạn
        // Profile fetch error handled.
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
    if (this.user.TrangThaiTaiKhoan === 'DaKhoa') {
      alert('Tài khoản của bạn đang bị khóa, không thể chỉnh sửa hồ sơ.');
      return;
    }
    this.editUser = { ...this.user };
    this.resetErrors();
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.resetErrors();
    this.editUser = { ...this.user };
    this.selectedAvatarFile = null;
  }

  resetErrors() {
    this.HoTenKhachHangError = '';
    this.EmailError = '';
    this.NgaySinhError = '';
    this.AnhDaiDienError = '';
    this.formError = '';
  }

  // Real-time Validation Methods
  validateHoTenKhachHang() {
    const val = this.editUser.HoTenKhachHang.trim();
    if (!val) {
      this.HoTenKhachHangError = 'Họ tên là bắt buộc';
    } else if (val.length < 2) {
      this.HoTenKhachHangError = 'Họ tên phải có ít nhất 2 ký tự';
    } else if (val.length > 100) {
      this.HoTenKhachHangError = 'Họ tên không được vượt quá 100 ký tự';
    } else {
      this.HoTenKhachHangError = '';
    }
  }

  validateEmail() {
    const val = this.editUser.Email ? this.editUser.Email.trim() : '';
    if (!val) {
      this.EmailError = ''; // Không bắt buộc
      return;
    }

    if (val.includes(' ')) {
      this.EmailError = 'Email không được chứa khoảng trắng';
      return;
    }

    // Regex email: username@domain.tld, domain có dấu chấm, không kết thúc bằng chấm, không 2 dấu @
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(val) || val.endsWith('.') || !val.includes('.') || (val.match(/@/g) || []).length !== 1) {
      this.EmailError = 'Định dạng email không hợp lệ (ví dụ: name@gmail.com)';
    } else if (val.length > 254) {
      this.EmailError = 'Email không được vượt quá 254 ký tự';
    } else {
      this.EmailError = '';
    }
  }

  validateNgaySinh() {
    if (!this.editUser.NgaySinh) {
      this.NgaySinhError = '';
      return;
    }
    const selectedDate = new Date(this.editUser.NgaySinh);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      this.NgaySinhError = 'Ngày sinh không được lớn hơn ngày hiện tại';
    } else {
      this.NgaySinhError = '';
    }
  }

  onFileSelected(event: any) {
    this.AnhDaiDienError = '';

    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.AnhDaiDienError = 'Chỉ chấp nhận định dạng .JPG, .JPEG hoặc .PNG';
      event.target.value = '';
      this.selectedAvatarFile = null;
      return;
    }

    if (file.size > 1024 * 1024) {
      this.AnhDaiDienError = 'Dung lượng ảnh tối đa là 1MB';
      event.target.value = '';
      this.selectedAvatarFile = null;
      return;
    }

    // Lưu file thật để lát nữa upload lên Supabase
    this.selectedAvatarFile = file;

    // Preview ảnh tạm trên giao diện
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.editUser.AnhDaiDien = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {
    if (!this.isFormValid) return;

    const updatePayload = {
      HoTenKhachHang: this.editUser.HoTenKhachHang,
      Email: this.editUser.Email,
      GioiTinh: this.editUser.GioiTinh,
      NgaySinh: this.editUser.NgaySinh,
      AnhDaiDien: this.editUser.AnhDaiDien // Cần xử lý upload ảnh lên server thực tế
    };

    this.customerHoSoService.updateProfile(this.user.MaKhachHang!, updatePayload).subscribe({
      next: (updatedProfile: any) => {
        this.user = {
          MaKhachHang: updatedProfile.MaKhachHang,
          HoTenKhachHang: updatedProfile.HoTenKhachHang,
          SoDienThoai: updatedProfile.SoDienThoai,
          Email: updatedProfile.Email,
          AnhDaiDien: updatedProfile.AnhDaiDien || '/asset/images/customer/user.png',
          GioiTinh: updatedProfile.GioiTinh,
          NgaySinh: updatedProfile.NgaySinh ? new Date(updatedProfile.NgaySinh).toISOString().split('T')[0] : '',
          TrangThaiTaiKhoan: updatedProfile.TrangThaiTaiKhoan
        };
        this.editUser = { ...this.user };
        this.isEditing = false;
        this.authService.setCurrentUser(this.user); // Cập nhật AuthService
        alert('Cập nhật hồ sơ thành công!');
      },
      error: (err: any) => {
        console.error('Error updating profile:', err);
        alert('Cập nhật hồ sơ thất bại: ' + (err.error.message || 'Lỗi không xác định'));
      }
    });
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
      }
      else {
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


