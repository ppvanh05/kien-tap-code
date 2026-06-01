import { Component, EventEmitter, Output, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthModalService } from '../auth-modal.service';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { environment } from '../../../../../environments/environment';

interface MockUser {
  SoDienThoai: string;
  HoTenKhachHang: string;
  Email: string;
  MatKhau: string;
  MaKhachHang?: string;
  AnhDaiDien?: string;
  GioiTinh?: string;
  NgaySinh?: string;
  TrangThaiTaiKhoan?: string;
  NgayDangKy?: string;
}

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<string>();
  @Output() registered = new EventEmitter<string>();

  step: 'phone' | 'otp' | 'profile' = 'phone';
  phoneNumber = '';
  otpDigits = Array(6).fill('');
  otpDigitsString = '';
  otpCountdown = 180;
  otpTimer: any = null;
  generatedOtp = '';
  isSendingOtp = false;

  fullName = '';
  email = '';
  password = '';
  avatarUrl = '';
  gender = '';
  birthDate = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  registrationError = '';
  registrationSuccess = false;

  phoneNumberError = '';
  otpError = '';
  fullNameError = '';
  emailError = '';
  passwordError = '';
  confirmPasswordError = '';

  showToast = false;
  toastMessage = '';

  constructor(
    private router: Router,
    private authModalService: AuthModalService,
    private cdr: ChangeDetectorRef,
    private authApiService: AuthApiService
  ) {}

  getMockUsers(): any[] {
    if (typeof window === 'undefined') {
      return [];
    }
    const usersJson = localStorage.getItem('mock_users');
    if (!usersJson) {
      const defaultUsers: MockUser[] = [
        {
          SoDienThoai: '0987654321',
          HoTenKhachHang: 'Nguyễn Văn An',
          Email: 'an.nguyen@example.com',
          MatKhau: '123456',
          MaKhachHang: 'KH001',
          AnhDaiDien: '/asset/images/customer/user.png',
          GioiTinh: 'Nam',
          NgaySinh: '2000-01-01',
          TrangThaiTaiKhoan: 'HoatDong',
          NgayDangKy: '2023-01-01'
        }
      ];
      localStorage.setItem('mock_users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(usersJson);
  }

  saveMockUser(user: MockUser) {
    const users = this.getMockUsers();
    users.push(user);
    localStorage.setItem('mock_users', JSON.stringify(users));
  }

  onOtpChange(val: string) {
    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 6);
    this.otpDigitsString = cleaned;
    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = cleaned[i] || '';
    }
  }

  ngOnDestroy() {
    this.clearOtpTimer();
  }

  closeModal() {
    this.clearOtpTimer();
    this.authModalService.closeModal();
    this.close.emit();
  }

  openLogin(event: Event) {
    event.preventDefault();
    this.authModalService.openLoginModal();
  }

  startOtpTimer() {
    this.clearOtpTimer();
    this.otpCountdown = 180;
    this.otpTimer = setInterval(() => {
      if (this.otpCountdown > 0) {
        this.otpCountdown -= 1;
        this.cdr.detectChanges();
      } else {
        this.clearOtpTimer();
      }
    }, 1000);
  }

  clearOtpTimer() {
    if (this.otpTimer) {
      clearInterval(this.otpTimer);
      this.otpTimer = null;
    }
  }

  formatCountdown(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  sendOtp() {
    if (this.isSendingOtp) return;
    this.isSendingOtp = true;

    this.phoneNumberError = '';
    this.otpError = '';
    this.registrationError = '';

    const cleaned = this.phoneNumber.trim();
    const phoneRegex = /^(0|\+84)\d{9}$/;

    if (!phoneRegex.test(cleaned)) {
      this.phoneNumberError = 'Vui lòng nhập đúng số điện thoại gồm 10 chữ số.';
      this.isSendingOtp = false;
      return;
    }

    this.phoneNumber = cleaned;
    const sendOtpPayload = {
      SoDienThoai: cleaned,
      MucDich: 'DangKy',
    };
    console.log('Auth send-otp payload:', sendOtpPayload);

    this.authApiService.sendOtp(sendOtpPayload).subscribe({
      next: (response: any) => {
        this.isSendingOtp = false;
        this.generatedOtp = response.otp || '';
        this.otpDigits = Array(6).fill('');
        this.otpDigitsString = '';
        this.otpError = '';
        this.registrationError = '';
        this.step = 'otp';
        this.startOtpTimer();
        console.log('OTP đã gửi:', this.generatedOtp);
        if (!environment.production && response.otp) {
          this.onOtpChange(response.otp);
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSendingOtp = false;
        console.error('Send OTP error:', err);
        this.phoneNumberError = err.error?.message || 'Số điện thoại này đã được đăng ký!';
        this.cdr.detectChanges();
      }
    });
  }

  continueFromPhone() {
    this.phoneNumberError = '';
    const cleaned = this.phoneNumber.trim();
    const phoneRegex = /^(0|\+84)\d{9}$/;

    if (!phoneRegex.test(cleaned)) {
      this.phoneNumberError = 'Vui lòng nhập đúng số điện thoại gồm 10 chữ số.';
      return;
    }

    this.authApiService.checkPhone(cleaned).subscribe({
      next: (res: any) => {
        if (res.exists) {
          this.phoneNumberError = 'Số điện thoại này đã được đăng ký!';
          this.cdr.detectChanges();
        } else {
          this.sendOtp();
        }
      },
      error: (err: any) => {
        console.error('Check phone error:', err);
        this.phoneNumberError = err.error?.message || 'Không thể kiểm tra số điện thoại. Vui lòng thử lại sau.';
        this.cdr.detectChanges();
      }
    });
  }

  onOtpInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/[^0-9]/g, '').slice(-1);
    // set the model and the actual input value (ensure single digit)
    this.otpDigits[index] = val;
    input.value = val;
    // move focus to next input when a digit typed
    if (val && index < this.otpDigits.length - 1) {
      const inputs = Array.from(document.querySelectorAll('.otp-input')) as HTMLInputElement[];
      // small timeout to ensure browser processed the input
      setTimeout(() => inputs[index + 1]?.focus(), 0);
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent) {
    const key = event.key;
    const inputs = Array.from(document.querySelectorAll('.otp-input')) as HTMLInputElement[];
    if (key === 'Backspace') {
      // If current has a value, clear it and prevent default so cursor stays
      if (this.otpDigits[index]) {
        this.otpDigits[index] = '';
        inputs[index].value = '';
        event.preventDefault();
        return;
      }
      // if current empty, move focus to previous and clear it
      if (index > 0) {
        this.otpDigits[index - 1] = '';
        inputs[index - 1].value = '';
        inputs[index - 1].focus();
        event.preventDefault();
      }
    }
    // allow only digits to be typed — ignore non-number keys except navigation
    if (/^[0-9]$/.test(key) || ['ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
      return;
    }
    // block other keys
    if (key.length === 1) {
      event.preventDefault();
    }
  }

  get isOtpValid(): boolean {
    return this.otpDigits.every(digit => /^[0-9]$/.test(digit));
  }

  registerUser() {
    // Here you would typically send data to a backend service
    // For now, we'll use mock data and emit the event
    const newUser: MockUser = {
      SoDienThoai: this.phoneNumber,
      HoTenKhachHang: this.fullName,
      Email: this.email,
      MatKhau: this.password
    };
    this.saveMockUser(newUser); // Save the new user

    this.registrationSuccess = true;
    this.toastMessage = 'Đăng ký thành công!';
    this.showToast = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.showToast = false;
      this.registered.emit(this.fullName);
      this.closeModal();
    }, 1500);
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  verifyOtp() {
    this.otpError = '';
    this.registrationError = '';

    this.otpDigitsString = this.otpDigits.join('');

    if (!this.otpDigitsString || this.otpDigitsString.length !== 6) {
      this.otpError = 'Vui lòng nhập đủ 6 chữ số mã xác thực.';
      return;
    }

    const code = this.otpDigitsString;
    const verifyPayload = {
      SoDienThoai: this.phoneNumber,
      otp: code,
      MucDich: 'DangKy',
      markUsed: false
    };

    this.authApiService.verifyOtp(verifyPayload).subscribe({
      next: (response: any) => {
        this.clearOtpTimer();
        this.otpError = '';
        this.step = 'profile';
        this.registrationError = '';
        this.registrationSuccess = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Verify OTP error:', err);
        this.otpError = err.error?.message || 'Mã xác thực không đúng. Vui lòng thử lại.';
        this.cdr.detectChanges();
      }
    });
  }

  resendOtp() {
    this.sendOtp();
  }

  submitProfile() {
    this.fullNameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.registrationError = '';

    if (!this.fullName.trim()) {
      this.fullNameError = 'Vui lòng nhập họ tên.';
      return;
    }
    if (this.email.trim() && !this.email.includes('@')) {
      this.emailError = 'Vui lòng nhập email hợp lệ.';
      return;
    }
    if (!this.password || this.password.length < 6) {
      this.passwordError = 'Mật khẩu phải có ít nhất 6 ký tự.';
      return;
    }
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Vui lòng nhập lại mật khẩu.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Mật khẩu nhập lại không khớp.';
      return;
    }

    const registerPayload = {
      SoDienThoai: this.phoneNumber,
      HoTenKhachHang: this.fullName.trim(),
      Email: this.email.trim() || undefined,
      MatKhau: this.password,
      otp: this.otpDigitsString,
    };
    console.log('Auth register payload:', registerPayload);

    this.authApiService.register(registerPayload).subscribe({
      next: (response: any) => {
        this.registrationSuccess = true;
        this.toastMessage = 'Đăng ký thành công!';
        this.showToast = true;

        localStorage.setItem('last_registered_phone', this.phoneNumber);
        localStorage.setItem('last_registered_password', this.password);
        this.cdr.detectChanges();

        setTimeout(() => {
          this.showToast = false;
          this.registered.emit(this.fullName.trim());
          this.closeModal();
          this.router.navigate(['/home']);
        }, 1800);
      },
      error: (err: any) => {
        console.error('Registration error:', err);
        this.registrationError = err.error?.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại.';
        this.cdr.detectChanges();
      }
    });
  }
}
