import { Component, EventEmitter, Output, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthModalService } from '../auth-modal.service';

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
    private cdr: ChangeDetectorRef
  ) {}

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

  saveMockUser(user: any) {
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
    this.phoneNumberError = '';
    this.otpError = '';
    this.registrationError = '';

    const cleaned = this.phoneNumber.trim();
    const phoneRegex = /^(0|\+84)\d{9}$/;

    if (!phoneRegex.test(cleaned)) {
      this.phoneNumberError = 'Vui lòng nhập đúng số điện thoại gồm 10 chữ số.';
      return;
    }

    const users = this.getMockUsers();
    const phoneExists = users.some(u => u.phoneNumber === cleaned);
    if (phoneExists) {
      this.phoneNumberError = 'Số điện thoại này đã được sử dụng để đăng ký tài khoản.';
      return;
    }

    this.phoneNumber = cleaned;
    this.generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    this.otpDigits = Array(6).fill('');
    this.otpDigitsString = '';
    this.otpError = '';
    this.registrationError = '';
    this.step = 'otp';
    this.startOtpTimer();
    console.log('OTP đã gửi:', this.generatedOtp);
  }

  continueFromPhone() {
    this.sendOtp();
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
    const newUser = {
      phoneNumber: this.phoneNumber,
      fullName: this.fullName,
      email: this.email,
      password: this.password
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

    if (!this.otpDigitsString || this.otpDigitsString.length !== 6) {
      this.otpError = 'Vui lòng nhập đủ 6 chữ số mã xác thực.';
      return;
    }

    const code = this.otpDigitsString;
    if (code !== this.generatedOtp) {
      this.otpError = 'Mã xác thực không đúng. Vui lòng thử lại.';
      return;
    }

    this.clearOtpTimer();
    this.otpError = '';
    this.step = 'profile';
    this.registrationError = '';
    this.registrationSuccess = false;
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

    const newUser = {
      phoneNumber: this.phoneNumber,
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      password: this.password
    };
    this.saveMockUser(newUser);

    this.registrationSuccess = true;
    this.toastMessage = 'Đăng ký thành công!';
    this.showToast = true;

    // Save phone and password to localStorage for automatic pre-fill in Login modal
    localStorage.setItem('last_registered_phone', this.phoneNumber);
    localStorage.setItem('last_registered_password', this.password);

    setTimeout(() => {
      this.showToast = false;
      this.registered.emit(this.fullName.trim());
      this.closeModal();
      this.router.navigate(['/home']);
    }, 1800);
  }
}
