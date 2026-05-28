import { Component, EventEmitter, Output, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthModalService } from '../auth-modal.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<string>();

  step: 'phone' | 'otp' | 'reset' = 'phone';
  phoneNumber = '';
  otpDigits = Array(6).fill('');
  otpDigitsString = '';
  verifiedOtp = '';
  otpError = '';
  phoneNumberError = '';
  newPasswordError = '';
  confirmPasswordError = '';
  resetError = '';
  otpCountdown = 180;
  otpTimer: ReturnType<typeof setInterval> | null = null;
  generatedOtp = '';
  isSendingOtp = false;

  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;

  showToast = false;
  toastMessage = '';

  constructor(
    private authModalService: AuthModalService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private authApiService: AuthApiService
  ) {}

  ngOnDestroy() {
    this.clearOtpTimer();
  }

  getMockUsers(): any[] {
    if (typeof window === 'undefined') {
      return [];
    }
    const usersJson = localStorage.getItem('mock_users');
    if (!usersJson) {
      const defaultUsers = [
        {
          phoneNumber: '0987654321',
          fullName: 'Nguyễn Văn An',
          email: 'an.nguyen@example.com',
          password: '123456'
        }
      ];
      localStorage.setItem('mock_users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(usersJson);
  }

  closeModal() {
    this.clearOtpTimer();
    this.authModalService.closeModal();
    this.close.emit();
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

  formatCountdown(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  clearOtpTimer() {
    if (this.otpTimer) {
      clearInterval(this.otpTimer);
      this.otpTimer = null;
    }
  }

  sendOtp() {
    if (this.isSendingOtp) return;
    this.isSendingOtp = true;

    this.phoneNumberError = '';
    this.otpError = '';
    this.resetError = '';

    const cleaned = this.phoneNumber.trim();
    const phoneRegex = /^(0|\+84)\d{9}$/;

    if (!phoneRegex.test(cleaned)) {
      this.phoneNumberError = 'Vui lòng nhập đúng số điện thoại gồm 10 chữ số.';
      this.isSendingOtp = false;
      return;
    }

    this.phoneNumber = cleaned;
    console.log('Auth forgot-password (send-otp) payload:', { SoDienThoai: cleaned });

    this.authApiService.forgotPassword({ SoDienThoai: cleaned }).subscribe({
      next: (response: any) => {
        this.isSendingOtp = false;
        this.generatedOtp = response.otp || '';
        this.verifiedOtp = '';
        this.otpDigitsString = '';
        this.otpDigits = Array(6).fill('');
        this.otpError = '';
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
        console.error('Forgot password error:', err);
        this.phoneNumberError = err.error?.message || 'Số điện thoại này chưa được đăng ký.';
        this.cdr.detectChanges();
      }
    });
  }

  onOtpChange(val: string) {
    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 6);
    this.otpDigitsString = cleaned;
    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = cleaned[i] || '';
    }
  }

  get isOtpValid(): boolean {
    return this.otpDigitsString.length === 6;
  }

  verifyOtp() {
    this.otpError = '';
    this.resetError = '';

    if (!this.otpDigitsString || this.otpDigitsString.length !== 6) {
      this.otpError = 'Vui lòng nhập đủ 6 chữ số mã xác thực.';
      return;
    }

    const code = this.otpDigitsString;
    const verifyPayload = {
      SoDienThoai: this.phoneNumber,
      otp: code,
      MucDich: 'QuenMatKhau',
      markUsed: false
    };

    this.authApiService.verifyOtp(verifyPayload).subscribe({
      next: (response: any) => {
        this.clearOtpTimer();
        this.verifiedOtp = code;
        this.otpError = '';
        this.step = 'reset';
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
    this.otpError = '';
    this.sendOtp();
  }

  toggleShowNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  openLoginFromForgot() {
    this.authModalService.closeModal();
    this.authModalService.openLoginModal();
  }

  resetPassword() {
    this.newPasswordError = '';
    this.confirmPasswordError = '';
    this.resetError = '';

    if (!this.newPassword || this.newPassword.length < 6) {
      this.newPasswordError = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
      return;
    }
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Vui lòng nhập lại mật khẩu mới.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.confirmPasswordError = 'Mật khẩu nhập lại không khớp.';
      return;
    }

    const resetPayload = {
      SoDienThoai: this.phoneNumber,
      otp: this.verifiedOtp || this.otpDigitsString,
      MatKhauMoi: this.newPassword,
    };
    console.log('Auth reset-password payload:', resetPayload);

    this.authApiService.resetPassword(resetPayload).subscribe({
      next: (response: any) => {
        this.otpError = '';
        this.toastMessage = 'Đặt lại mật khẩu thành công!';
        this.showToast = true;

        if (typeof localStorage !== 'undefined') {
          const lastLoggedInUser = {
            phoneOrEmail: this.phoneNumber,
            password: this.newPassword
          };
          localStorage.setItem('lastLoggedInUser', JSON.stringify(lastLoggedInUser));
        }

        this.cdr.detectChanges();

        setTimeout(() => {
          this.showToast = false;
          this.authModalService.closeModal();
          this.authModalService.openLoginModal();
        }, 1500);
      },
      error: (err: any) => {
        console.error('Reset password error:', err);
        this.resetError = err.error?.message || 'Đặt lại mật khẩu không thành công. Vui lòng thử lại.';
        this.cdr.detectChanges();
      }
    });
  }
}
