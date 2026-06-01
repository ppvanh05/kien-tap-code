import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileApiService } from '../../../core/services/profile-api.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface Order {
  maDonHang: string;
  soLuongVeDaDat: number;
  tenTuyenXe: string;
  ngayKhoiHanh: string;
  gioKhoiHanh: string;
  tongGiaVe: number;
  phuongThucThanhToan?: string;
  trangThaiDonHang: 'Chờ thanh toán' | 'Chờ khởi hành' | 'Đã xác nhận' | 'Đã hoàn thành' | 'Đã hủy' | 'Chưa đánh giá' | 'Đã đánh giá';
  soDienThoai: string;
  departureDate?: string;
  tenTuyen?: string;
  maVe?: string;
  formattedNgayDi?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  activeTab = 'profile';
  isEditing = false;
  showOtpModal = false;
  showSuccessModal = false;
  isLogoutActive = false;

  showCurrentPwd = false;
  showNewPwd = false;
  showConfirmPwd = false;

  passwords = { current: '', new: '', confirm: '' };
  currentPasswordError: string = '';
  newPasswordError: string = '';
  confirmPasswordError: string = '';
  changePasswordSuccess: string = '';
  changePasswordFailure: string = '';

  // Properties for profile-initiated OTP forgot password flow
  showForgotPwdModal = false;
  forgotStep: 'phone' | 'otp' | 'reset' = 'phone';
  forgotPhone = '';
  forgotPhoneError = '';
  forgotOtpDigits = Array(6).fill('');
  forgotOtpString = '';
  forgotOtpCountdown = 180;
  forgotOtpTimer: any = null;
  forgotNewPwd = '';
  forgotConfirmPwd = '';
  forgotShowNewPwd = false;
  forgotShowConfirmPwd = false;
  forgotNewPwdError = '';
  forgotConfirmPwdError = '';
  forgotResetError = '';
  showForgotToast = false;
  forgotToastMessage = '';
  forgotOtpError = '';
  isSendingForgotOtp = false;
  verifiedForgotOtp = '';



  redirectTimer = 3;
  redirectInterval: any;
  user = {
    fullName: '',
    phone: '',
    gender: '',
    email: '',
    dob: '',
    address: '',
    avatar: 'asset/images/customer/avatar_placeholder.png',
  } as any;

  // Validation / template helpers
  AnhDaiDienError: string = '';
  HoTenKhachHangError: string = '';
  EmailError: string = '';
  NgaySinhError: string = '';
  isFormValid = true;

  editUser = { ...this.user } as any;
  isProfileLoading = false;

  filterMaDonHang = '';
  filterThoiGianDat = '';
  filterTenTuyenXe = '';
  filterTrangThai = '';

  historyOrders: Order[] = [];
  filteredHistoryOrders: Order[] = [];
  isHistoryLoading = false;

  currentUserId = '';
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;
  maDonHangSubject = new Subject<string>();
  tuyenXeSubject = new Subject<string>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileApiService: ProfileApiService,
    private authApiService: AuthApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        this.user = {
          MaKhachHang: user.MaKhachHang,
          HoTenKhachHang: user.HoTenKhachHang || '',
          SoDienThoai: user.SoDienThoai || '',
          Email: user.Email || '',
          AnhDaiDien: user.AnhDaiDien || 'asset/images/customer/user.png',
          GioiTinh: user.GioiTinh || '',
          NgaySinh: user.NgaySinh ? new Date(user.NgaySinh).toISOString().slice(0, 10) : '',
          TrangThaiTaiKhoan: user.TrangThaiTaiKhoan,
        };
        this.editUser = { ...this.user };
      }
    });
  }

  ngOnInit(): void {
    this.loadProfile();

    this.maDonHangSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.ngZone.run(() => {
        this.filterMaDonHang = value;
        this.currentPage = 1;
        this.loadHistoryFromApi();
      });
    });

    this.tuyenXeSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.ngZone.run(() => {
        this.filterTenTuyenXe = value;
        this.currentPage = 1;
        this.loadHistoryFromApi();
      });
    });

    this.route.queryParamMap.subscribe(params => {
      this.ngZone.run(() => {
        const tab = params.get('tab');
        if (tab === 'history' || tab === 'password' || tab === 'profile') {
          this.activeTab = tab;
        } else {
          this.activeTab = 'profile';
        }
        
        // Force immediate change detection to switch views instantly
        this.cdr.detectChanges();

        if (this.activeTab === 'history') {
          if (!this.isHistoryLoading) {
            this.loadHistory();
          }
        } else {
          this.stopHistoryPolling();
        }
      });
    });

    // If user logs in after opening this page, and the history tab is active,
    // load history when login state becomes true.
    this.authService.isLoggedIn$.subscribe(logged => {
      this.ngZone.run(() => {
        if (logged && this.activeTab === 'history' && this.filteredHistoryOrders.length === 0 && !this.isHistoryLoading) {
          console.log('User logged in and history tab active — loading history');
          this.loadHistory();
        } else {
          this.cdr.detectChanges();
        }
      });
    });

    // Redundant currentUser$ subscription removed to prevent infinite recursive profile-fetching loops
  }

  ngOnDestroy() {
    if (this.redirectInterval) clearInterval(this.redirectInterval);
    this.stopHistoryPolling();
  }

  loadProfile(): void {
    setTimeout(() => {
      this.isProfileLoading = true;
      this.cdr.detectChanges();
    });
    this.profileApiService.getProfile().subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          const profile = response?.data || {};
          this.currentUserId = profile.MaKhachHang || '';
          this.user = {
            MaKhachHang: profile.MaKhachHang,
            HoTenKhachHang: profile.HoTenKhachHang || '',
            SoDienThoai: profile.SoDienThoai || '',
            Email: profile.Email || '',
            AnhDaiDien: profile.AnhDaiDien || 'asset/images/customer/user.png',
            GioiTinh: profile.GioiTinh || '',
            NgaySinh: profile.NgaySinh ? new Date(profile.NgaySinh).toISOString().slice(0, 10) : '',
            TrangThaiTaiKhoan: profile.TrangThaiTaiKhoan,
          } as any;
          this.editUser = { ...this.user };
          
          // Đồng bộ với AuthService
          const cur = this.authService.getCurrentUser() || {};
          this.authService.setCurrentUser({ 
            ...(cur as any), 
            HoTenKhachHang: this.user.HoTenKhachHang,
            Email: this.user.Email,
            AnhDaiDien: this.user.AnhDaiDien,
            GioiTinh: this.user.GioiTinh,
            NgaySinh: this.user.NgaySinh
          });
          
          this.isProfileLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          console.error('Load profile error:', err);
          this.isProfileLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  normalizeString(str: string): string {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, '');
  }

  loadHistory(): void {
    this.currentPage = 1;
    this.loadHistoryFromApi();
    this.startHistoryPolling();
  }

  onMaVeChange(val: string): void { this.maDonHangSubject.next(val); }
  onTuyenXeChange(val: string): void { this.tuyenXeSubject.next(val); }
  onFilterChange(): void { this.currentPage = 1; this.loadHistoryFromApi(); }
  searchHistory(): void { this.currentPage = 1; this.loadHistoryFromApi(); }

  resetHistoryFilter(): void {
    this.filterMaDonHang = '';
    this.filterThoiGianDat = '';
    this.filterTenTuyenXe = '';
    this.filterTrangThai = '';
    this.currentPage = 1;
    this.loadHistoryFromApi();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadHistoryFromApi();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get pages(): number[] {
    const arr = [];
    for (let i = 1; i <= this.totalPages; i++) arr.push(i);
    return arr;
  }

  // ===== HÀM CHÍNH: Gọi backend API (KHÔNG dùng Supabase) =====
  loadHistoryFromApi(): void {
    setTimeout(() => {
      this.isHistoryLoading = true;
      this.filteredHistoryOrders = [];
      this.cdr.detectChanges();
    });

    this.profileApiService.getHistory().subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          console.log('[DEBUG FRONTEND] Raw History Response:', response);
          let orders = Array.isArray(response?.data) ? response.data : [];
          console.log(`[DEBUG FRONTEND] Total orders from API: ${orders.length}`);

          // Lọc theo mã đơn hàng (maDonHang)
          if (this.filterMaDonHang.trim()) {
            const q = this.filterMaDonHang.trim().toLowerCase();
            orders = orders.filter((o: any) =>
              (o.maDonHang || '').toLowerCase().includes(q)
            );
            console.log(`[DEBUG FRONTEND] After MaDonHang filter: ${orders.length}`);
          }

          // Lọc theo tuyến đường
          if (this.filterTenTuyenXe.trim()) {
            const q = this.filterTenTuyenXe.trim().toLowerCase();
            orders = orders.filter((o: any) =>
              (o.tenTuyen || '').toLowerCase().includes(q)
            );
            console.log(`[DEBUG FRONTEND] After TuyenXe filter: ${orders.length}`);
          }

          // Lọc theo ngày đi (departureDate dạng YYYY-MM-DD)
          if (this.filterThoiGianDat) {
            orders = orders.filter((o: any) =>
              o.departureDate === this.filterThoiGianDat
            );
            console.log(`[DEBUG FRONTEND] After ThoiGian filter: ${orders.length}`);
          }

          // Lọc theo trạng thái
          if (this.filterTrangThai) {
            const targetStatus = this.normalizeString(this.filterTrangThai);
            orders = orders.filter((o: any) =>
              this.normalizeString(o.trangThaiDonHang) === targetStatus
            );
            console.log(`[DEBUG FRONTEND] After TrangThai filter: ${orders.length}`);
          }

          // Sắp xếp mã đơn hàng mới nhất lên đầu
          orders.sort((a: any, b: any) =>
            (b.maDonHang || '').localeCompare(a.maDonHang || '')
          );

          this.totalItems = orders.length;

          // Phân trang
          const from = (this.currentPage - 1) * this.pageSize;
          const paged = orders.slice(from, from + this.pageSize);

          this.filteredHistoryOrders = paged.map((o: any) => {
            // Format ngày giờ: "HH:mm DD-MM-YYYY"
            let formattedNgayDi = '';
            if (o.gioKhoiHanh && o.departureDate) {
              const [y, m, d] = o.departureDate.split('-');
              formattedNgayDi = `${o.gioKhoiHanh} ${d}-${m}-${y}`;
            }

            // Chuẩn hóa trạng thái
            const rawStatus = (o.trangThaiDonHang || '').toString();
            let displayStatus = 'Chờ thanh toán';
            const s = rawStatus.toLowerCase();
            if (s.includes('chothanhtoan') || s.includes('cho_thanh_toan') || s.includes('cho_thanhtoan') || s.includes('cho thanh toan') || s.includes('cho thanhtoan') || s === 'chờ thanh toán') {
              displayStatus = 'Chờ thanh toán';
            } else if (s.includes('chokhoihanh') || s.includes('cho_khoi_hanh') || s.includes('cho khoi hanh') || s.includes('chờ khởi hành') || s.includes('cho khoihanh') || s === 'chờ khởi hành') {
              displayStatus = 'Chờ khởi hành';
            } else if (s.includes('dahoanthanh') || s.includes('da_hoan_thanh') || s.includes('da hoàn thành') || s.includes('da hoan thanh') || s === 'đã hoàn thành') {
              displayStatus = 'Đã hoàn thành';
            } else if (s.includes('dadanhgia') || s.includes('da_danh_gia') || s.includes('đã đánh giá') || s.includes('da danh gia') || s === 'đã đánh giá') {
              displayStatus = 'Đã đánh giá';
            } else if (s.includes('dahuy') || s.includes('da_huy') || s.includes('đã hủy') || s.includes('da huy') || s === 'đã hủy') {
              displayStatus = 'Đã hủy';
            }

            return {
              maDonHang: o.maDonHang,
              soLuongVeDaDat: o.soLuongVeDaDat || 1,
              tenTuyenXe: o.tenTuyen || '',
              gioKhoiHanh: o.gioKhoiHanh || '',
              ngayKhoiHanh: o.departureDate || '',
              formattedNgayDi,
              tongGiaVe: o.tongGiaVe || 0,
              trangThaiDonHang: displayStatus as any,
              soDienThoai: o.soDienThoai || this.user.SoDienThoai || ''
            };
          });

          this.isHistoryLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          console.error('[DEBUG FRONTEND] Load history error:', err);
          this.filteredHistoryOrders = [];
          this.totalItems = 0;
          this.isHistoryLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  viewTicketDetail(order: any): void {
    this.router.navigate(['/tra-cuu-ve'], {
      queryParams: {
        soDienThoai: order.soDienThoai,
        maDonHang: order.maDonHang
      }
    });
  }

  startEdit() { this.editUser = { ...this.user }; this.isEditing = true; }
  cancelEdit() { this.isEditing = false; }

  saveProfile() {
    this.profileApiService.updateProfile({
      HoTenKhachHang: this.editUser.HoTenKhachHang,
      Email: this.editUser.Email,
      GioiTinh: this.editUser.GioiTinh,
      NgaySinh: this.editUser.NgaySinh,
      AnhDaiDien: this.editUser.AnhDaiDien
    }).subscribe({
      next: (response: any) => {
        const updatedProfile = response?.data || this.editUser;
        console.log('[DEBUG FRONTEND] Updated Profile from Backend:', updatedProfile);
        
        // Cập nhật state local của component
        this.user = {
          ...this.user,
          fullName: updatedProfile.HoTenKhachHang || updatedProfile.fullName,
          email: updatedProfile.Email || updatedProfile.email,
          gender: updatedProfile.GioiTinh || updatedProfile.gender,
          dob: updatedProfile.NgaySinh ? new Date(updatedProfile.NgaySinh).toISOString().slice(0, 10) : updatedProfile.dob,
          avatar: updatedProfile.AnhDaiDien || updatedProfile.avatar || 'asset/images/customer/user.png',
          HoTenKhachHang: updatedProfile.HoTenKhachHang,
          Email: updatedProfile.Email,
          GioiTinh: updatedProfile.GioiTinh,
          NgaySinh: updatedProfile.NgaySinh,
          AnhDaiDien: updatedProfile.AnhDaiDien
        };
        console.log('[DEBUG FRONTEND] this.user after update:', this.user);
        
        // Cập nhật AuthService để Header/Footer nhận được thông tin mới
        const curUser = this.authService.getCurrentUser() || {};
        this.authService.setCurrentUser({
          ...curUser,
          HoTenKhachHang: updatedProfile.HoTenKhachHang,
          Email: updatedProfile.Email,
          AnhDaiDien: updatedProfile.AnhDaiDien,
          GioiTinh: updatedProfile.GioiTinh,
          NgaySinh: updatedProfile.NgaySinh
        });

        this.isEditing = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Save profile error:', err);
        this.isEditing = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any) {
    const file = event?.target?.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      this.AnhDaiDienError = 'File quá lớn, tối đa 1MB';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.ngZone.run(() => {
        this.editUser.AnhDaiDien = e.target.result;
        this.AnhDaiDienError = '';
        this.cdr.detectChanges();
      });
    };
    reader.readAsDataURL(file);
  }

  validateHoTenKhachHang() {
    const name = (this.editUser as any).HoTenKhachHang || '';
    this.HoTenKhachHangError = name.trim() ? '' : 'Vui lòng nhập họ tên';
    this.updateFormValidity();
  }

  validateEmail() {
    const email = (this.editUser as any).Email || '';
    if (!email) { this.EmailError = ''; this.updateFormValidity(); return; }
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    this.EmailError = ok ? '' : 'Email không hợp lệ';
    this.updateFormValidity();
  }

  validateNgaySinh() {
    const d = (this.editUser as any).NgaySinh || '';
    this.NgaySinhError = d ? '' : '';
    this.updateFormValidity();
  }

  updateFormValidity() {
    this.isFormValid = !this.HoTenKhachHangError && !this.EmailError && !this.NgaySinhError && !this.AnhDaiDienError;
  }

  showChangePwdOtpModal: boolean = false;
  changePwdOtpString: string = '';
  changePwdOtpDigits: string[] = Array(6).fill('');
  changePwdOtpCountdown: number = 180;
  changePwdOtpTimer: any = null;
  changePwdOtpError: string = '';
  isSendingChangePwdOtp: boolean = false;
  pendingPasswordChange = { current: '', new: '', confirm: '' };

  closeChangePwdOtpModal() {
    this.clearChangePwdOtpTimer();
    this.showChangePwdOtpModal = false;
    this.changePwdOtpString = '';
    this.changePwdOtpDigits = Array(6).fill('');
    this.changePwdOtpError = '';
    this.cdr.detectChanges();
  }

  startChangePwdOtpTimer() {
    this.clearChangePwdOtpTimer();
    this.changePwdOtpCountdown = 180;
    this.changePwdOtpTimer = setInterval(() => {
      this.ngZone.run(() => {
        if (this.changePwdOtpCountdown > 0) {
          this.changePwdOtpCountdown -= 1;
          this.cdr.detectChanges();
        } else {
          this.clearChangePwdOtpTimer();
        }
      });
    }, 1000);
  }

  clearChangePwdOtpTimer() {
    if (this.changePwdOtpTimer) {
      clearInterval(this.changePwdOtpTimer);
      this.changePwdOtpTimer = null;
    }
  }

  formatChangePwdCountdown(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  onChangePwdOtpChange(val: string) {
    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 6);
    this.changePwdOtpString = cleaned;
    for (let i = 0; i < 6; i++) {
      this.changePwdOtpDigits[i] = cleaned[i] || '';
    }
  }

  resendChangePwdOtp() {
    this.changePwdOtpError = '';
    this.sendChangePwdOtp();
  }

  sendChangePwdOtp() {
    if (this.isSendingChangePwdOtp) return;
    this.isSendingChangePwdOtp = true;
    this.changePwdOtpError = '';

    const phone = this.user.SoDienThoai || '';
    this.authApiService.sendOtp({ SoDienThoai: phone, MucDich: 'CHANGE_PASSWORD' }).subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          this.isSendingChangePwdOtp = false;
          this.changePwdOtpString = '';
          this.changePwdOtpDigits = Array(6).fill('');
          this.changePwdOtpError = '';
          this.showChangePwdOtpModal = true;
          this.startChangePwdOtpTimer();
          
          if (response.otp) {
            // Autofill OTP
            this.onChangePwdOtpChange(response.otp);
          }
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          this.isSendingChangePwdOtp = false;
          this.changePwdOtpError = err.error?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  verifyChangePwdOtp() {
    this.changePwdOtpError = '';

    if (!this.changePwdOtpString || this.changePwdOtpString.length !== 6) {
      this.changePwdOtpError = 'Vui lòng nhập đủ 6 chữ số mã xác thực.';
      return;
    }

    const phone = this.user.SoDienThoai || '';
    const code = this.changePwdOtpString;
    const verifyPayload = {
      SoDienThoai: phone,
      otp: code,
      MucDich: 'CHANGE_PASSWORD',
      markUsed: true
    };

    this.authApiService.verifyOtp(verifyPayload).subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          this.clearChangePwdOtpTimer();
          this.showChangePwdOtpModal = false;
          this.executeChangePassword();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          console.error('Verify OTP in change-password error:', err);
          this.changePwdOtpError = err.error?.message || 'Mã xác thực không đúng. Vui lòng thử lại.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  executeChangePassword() {
    this.profileApiService.changePassword({
      MatKhauCu: this.pendingPasswordChange.current,
      MatKhauMoi: this.pendingPasswordChange.new,
      XacNhanMatKhauMoi: this.pendingPasswordChange.confirm
    }).subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          this.changePasswordSuccess = response.message || 'Đổi mật khẩu thành công!';
          this.passwords = { current: '', new: '', confirm: '' }; // Clear form
          this.pendingPasswordChange = { current: '', new: '', confirm: '' };
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          this.changePasswordFailure = err.error?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  changePassword(): void {
    this.currentPasswordError = '';
    this.newPasswordError = '';
    this.confirmPasswordError = '';
    this.changePasswordSuccess = '';
    this.changePasswordFailure = '';

    if (!this.passwords.current) {
      this.currentPasswordError = 'Vui lòng nhập mật khẩu hiện tại.';
      return;
    }
    if (!this.passwords.new) {
      this.newPasswordError = 'Vui lòng nhập mật khẩu mới.';
      return;
    }
    if (this.passwords.new.length < 6) {
      this.newPasswordError = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
      return;
    }
    if (this.passwords.new !== this.passwords.confirm) {
      this.confirmPasswordError = 'Mật khẩu mới và xác nhận mật khẩu không khớp.';
      return;
    }
    if (this.passwords.new === this.passwords.current) {
      this.newPasswordError = 'Mật khẩu mới không được trùng với mật khẩu cũ.';
      return;
    }

    // Save pending change
    this.pendingPasswordChange = {
      current: this.passwords.current,
      new: this.passwords.new,
      confirm: this.passwords.confirm
    };

    // Send OTP first
    this.sendChangePwdOtp();
  }

  // ===== FLOW QUÊN MẬT KHẨU TỪ PROFILE (OTP) =====
  openForgotPwdModal() {
    this.ngZone.run(() => {
      this.clearForgotOtpTimer();
      this.forgotStep = 'phone';
      this.forgotPhone = this.user.SoDienThoai || '';
      this.forgotPhoneError = '';
      this.forgotOtpString = '';
      this.forgotOtpDigits = Array(6).fill('');
      this.forgotOtpError = '';
      this.forgotNewPwd = '';
      this.forgotConfirmPwd = '';
      this.forgotShowNewPwd = false;
      this.forgotShowConfirmPwd = false;
      this.forgotNewPwdError = '';
      this.forgotConfirmPwdError = '';
      this.forgotResetError = '';
      this.verifiedForgotOtp = '';
      this.isSendingForgotOtp = false;
      this.showForgotPwdModal = true;
      this.cdr.detectChanges();
    });
  }

  closeForgotPwdModal() {
    this.ngZone.run(() => {
      this.clearForgotOtpTimer();
      this.showForgotPwdModal = false;
      this.cdr.detectChanges();
    });
  }

  startForgotOtpTimer() {
    this.clearForgotOtpTimer();
    this.forgotOtpCountdown = 180;
    this.forgotOtpTimer = setInterval(() => {
      this.ngZone.run(() => {
        if (this.forgotOtpCountdown > 0) {
          this.forgotOtpCountdown -= 1;
          this.cdr.detectChanges();
        } else {
          this.clearForgotOtpTimer();
        }
      });
    }, 1000);
  }

  clearForgotOtpTimer() {
    if (this.forgotOtpTimer) {
      clearInterval(this.forgotOtpTimer);
      this.forgotOtpTimer = null;
    }
  }

  formatForgotCountdown(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  sendForgotOtp() {
    if (this.isSendingForgotOtp) return;
    this.isSendingForgotOtp = true;

    this.forgotPhoneError = '';
    this.forgotOtpError = '';
    this.forgotResetError = '';

    const cleaned = this.forgotPhone.trim();
    const phoneRegex = /^(0|\+84)\d{9}$/;

    if (!phoneRegex.test(cleaned)) {
      this.forgotPhoneError = 'Vui lòng nhập đúng số điện thoại gồm 10 chữ số.';
      this.isSendingForgotOtp = false;
      return;
    }

    this.forgotPhone = cleaned;
    console.log('Profile forgot-password send-otp:', cleaned);

    this.authApiService.forgotPassword({ SoDienThoai: cleaned }).subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          this.isSendingForgotOtp = false;
          this.verifiedForgotOtp = '';
          this.forgotOtpString = '';
          this.forgotOtpDigits = Array(6).fill('');
          this.forgotOtpError = '';
          this.forgotStep = 'otp';
          this.startForgotOtpTimer();
          console.log('[OTP DEBUG PROFILE] OTP code received:', response.otp);
          
          // Autofill OTP if mock/debugging or returned in response
          if (response.otp) {
            this.onForgotOtpChange(response.otp);
          }
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          this.isSendingForgotOtp = false;
          console.error('Send forgot OTP from profile error:', err);
          this.forgotPhoneError = err.error?.message || 'Số điện thoại này chưa được đăng ký.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  onForgotOtpChange(val: string) {
    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 6);
    this.forgotOtpString = cleaned;
    for (let i = 0; i < 6; i++) {
      this.forgotOtpDigits[i] = cleaned[i] || '';
    }
  }

  get isForgotOtpValid(): boolean {
    return this.forgotOtpString.length === 6;
  }

  verifyForgotOtp() {
    this.forgotOtpError = '';
    this.forgotResetError = '';

    if (!this.forgotOtpString || this.forgotOtpString.length !== 6) {
      this.forgotOtpError = 'Vui lòng nhập đủ 6 chữ số mã xác thực.';
      return;
    }

    const code = this.forgotOtpString;
    const verifyPayload = {
      SoDienThoai: this.forgotPhone,
      otp: code,
      MucDich: 'QuenMatKhau',
      markUsed: false
    };

    this.authApiService.verifyOtp(verifyPayload).subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          this.clearForgotOtpTimer();
          this.verifiedForgotOtp = code;
          this.forgotOtpError = '';
          this.forgotStep = 'reset';
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          console.error('Verify OTP in profile forgot-password error:', err);
          this.forgotOtpError = err.error?.message || 'Mã xác thực không đúng. Vui lòng thử lại.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  resendForgotOtp() {
    this.forgotOtpError = '';
    this.sendForgotOtp();
  }

  toggleForgotShowNewPwd() {
    this.forgotShowNewPwd = !this.forgotShowNewPwd;
  }

  toggleForgotShowConfirmPwd() {
    this.forgotShowConfirmPwd = !this.forgotShowConfirmPwd;
  }

  resetForgotNewPassword() {
    this.forgotNewPwdError = '';
    this.forgotConfirmPwdError = '';
    this.forgotResetError = '';

    if (!this.forgotNewPwd || this.forgotNewPwd.length < 6) {
      this.forgotNewPwdError = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
      return;
    }
    if (!this.forgotConfirmPwd) {
      this.forgotConfirmPwdError = 'Vui lòng nhập lại mật khẩu mới.';
      return;
    }
    if (this.forgotNewPwd !== this.forgotConfirmPwd) {
      this.forgotConfirmPwdError = 'Mật khẩu nhập lại không khớp.';
      return;
    }

    const resetPayload = {
      SoDienThoai: this.forgotPhone,
      otp: this.verifiedForgotOtp || this.forgotOtpString,
      MatKhauMoi: this.forgotNewPwd,
    };
    console.log('Profile reset-password payload:', resetPayload);

    this.authApiService.resetPassword(resetPayload).subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          this.forgotOtpError = '';
          this.forgotToastMessage = 'Đặt lại mật khẩu thành công!';
          this.showForgotToast = true;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.ngZone.run(() => {
              this.showForgotToast = false;
              this.closeForgotPwdModal();
              this.cdr.detectChanges();
            });
          }, 1500);
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          console.error('Profile reset password error:', err);
          this.forgotResetError = err.error?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  // confirmChangePassword() { this.showOtpModal = true; this.startOtpTimer(); } // OTP logic removed

  startRedirectTimer() {
    this.redirectTimer = 3;
    if (this.redirectInterval) clearInterval(this.redirectInterval);
    this.redirectInterval = setInterval(() => {
      if (this.redirectTimer > 1) this.redirectTimer--;
      else this.goToLogin();
    }, 1000);
  }

  goToLogin() {
    if (this.redirectInterval) clearInterval(this.redirectInterval);
    this.showSuccessModal = false;
    this.passwords = { current: '', new: '', confirm: '' };
    this.router.navigate(['/login']);
  }



  historyInterval: any;

  startHistoryPolling(): void {
    this.stopHistoryPolling();
    this.historyInterval = setInterval(() => {
      if (this.activeTab === 'history' && !this.isHistoryLoading) {
        this.loadHistorySilent();
      }
    }, 5000);
  }

  stopHistoryPolling(): void {
    if (this.historyInterval) {
      clearInterval(this.historyInterval);
      this.historyInterval = null;
    }
  }

  loadHistorySilent(): void {
    if (!this.authService.getCurrentUser()) {
      this.stopHistoryPolling();
      return;
    }
    
    this.profileApiService.getHistory().subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          let orders = Array.isArray(response?.data) ? response.data : [];

          if (this.filterMaDonHang.trim()) {
            const q = this.filterMaDonHang.trim().toLowerCase();
            orders = orders.filter((o: any) =>
              (o.maDonHang || '').toLowerCase().includes(q)
            );
          }

          if (this.filterTenTuyenXe.trim()) {
            const q = this.filterTenTuyenXe.trim().toLowerCase();
            orders = orders.filter((o: any) =>
              (o.tenTuyen || '').toLowerCase().includes(q)
            );
          }

          if (this.filterThoiGianDat) {
            orders = orders.filter((o: any) =>
              o.departureDate === this.filterThoiGianDat
            );
          }

          if (this.filterTrangThai) {
            const targetStatus = this.normalizeString(this.filterTrangThai);
            orders = orders.filter((o: any) =>
              this.normalizeString(o.trangThaiDonHang) === targetStatus
            );
          }

          orders.sort((a: any, b: any) =>
            (b.maDonHang || '').localeCompare(a.maDonHang || '')
          );

          this.totalItems = orders.length;

          const from = (this.currentPage - 1) * this.pageSize;
          const paged = orders.slice(from, from + this.pageSize);

          this.filteredHistoryOrders = paged.map((o: any) => {
            let formattedNgayDi = '';
            if (o.gioKhoiHanh && o.departureDate) {
              const [y, m, d] = o.departureDate.split('-');
              formattedNgayDi = `${o.gioKhoiHanh} ${d}-${m}-${y}`;
            }

            const rawStatus = (o.trangThaiDonHang || '').toString();
            let displayStatus = 'Chờ thanh toán';
            const s = rawStatus.toLowerCase();
            if (s.includes('chothanhtoan') || s.includes('cho_thanh_toan') || s.includes('cho_thanhtoan') || s.includes('cho thanh toan') || s.includes('cho thanhtoan') || s === 'chờ thanh toán') {
              displayStatus = 'Chờ thanh toán';
            } else if (s.includes('chokhoihanh') || s.includes('cho_khoi_hanh') || s.includes('cho khoi hanh') || s.includes('chờ khởi hành') || s.includes('cho khoihanh') || s === 'chờ khởi hành') {
              displayStatus = 'Chờ khởi hành';
            } else if (s.includes('dahoanthanh') || s.includes('da_hoan_thanh') || s.includes('da hoàn thành') || s.includes('da hoan thanh') || s === 'đã hoàn thành') {
              displayStatus = 'Đã hoàn thành';
            } else if (s.includes('dadanhgia') || s.includes('da_danh_gia') || s.includes('đã đánh giá') || s.includes('da danh gia') || s === 'đã đánh giá') {
              displayStatus = 'Đã đánh giá';
            } else if (s.includes('dahuy') || s.includes('da_huy') || s.includes('đã hủy') || s.includes('da huy') || s === 'đã hủy') {
              displayStatus = 'Đã hủy';
            }

            return {
              maDonHang: o.maDonHang,
              soLuongVeDaDat: o.soLuongVeDaDat || 1,
              tenTuyenXe: o.tenTuyen || '',
              gioKhoiHanh: o.gioKhoiHanh || '',
              ngayKhoiHanh: o.departureDate || '',
              formattedNgayDi,
              tongGiaVe: o.tongGiaVe || 0,
              trangThaiDonHang: displayStatus as any,
              soDienThoai: o.soDienThoai || this.user.SoDienThoai || ''
            };
          });

          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          if (err.status === 401) {
            console.error('[DEBUG FRONTEND] Unauthorized history polling - stopping');
            this.stopHistoryPolling();
          }
          this.cdr.detectChanges();
        });
      }
    });
  }

  goToBooking() { this.router.navigate(['/home']); }

  logout() {
    this.isLogoutActive = true;
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  selectTab(tab: string) {
    this.router.navigate([], {
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
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