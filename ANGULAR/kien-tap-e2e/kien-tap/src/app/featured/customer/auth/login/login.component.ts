import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthModalService } from '../auth-modal.service'; 
import { AuthApiService } from '../../../../core/services/auth-api.service';

interface MockUser {
  phoneNumber: string;
  fullName: string;
  email: string;
  password: string;
  MaKhachHang?: string;
  AnhDaiDien?: string;
  GioiTinh?: string;
  NgaySinh?: string;
  TrangThaiTaiKhoan?: string;
  NgayDangKy?: string;
}

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<string>();

  phoneOrEmail = '';
  password = '';
  showPassword = false;
  phoneOrEmailError = '';
  passwordError = '';
  loginError = '';

  customerAuthApiService = {
    setToken: (token: string) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }
    }
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private authModalService: AuthModalService,
    private authApiService: AuthApiService
  ) {}

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      const lastUser = localStorage.getItem('lastLoggedInUser');
      if (lastUser) {
        const userData = JSON.parse(lastUser);
        this.phoneOrEmail = userData.phoneOrEmail || '';
        this.password = userData.password || '';
      }
    }
  }

  getMockUsers(): MockUser[] { // Added getMockUsers back
    if (typeof window === 'undefined') {
      return [];
    }
    const usersJson = localStorage.getItem('mock_users');
    if (!usersJson) {
      const defaultUsers: MockUser[] = [
        {
          phoneNumber: '0987654321',
          fullName: 'Nguyễn Văn An',
          email: 'an.nguyen@example.com',
          password: '123456',
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

  onLogin() {
    this.phoneOrEmailError = '';
    this.passwordError = '';
    this.loginError = '';

    if (!this.phoneOrEmail.trim()) {
      this.phoneOrEmailError = 'Vui lòng nhập số điện thoại hoặc email.';
      return;
    }

    if (!this.password) {
      this.passwordError = 'Vui lòng nhập mật khẩu.';
      return;
    }

    const loginPayload = {
      phoneOrEmail: this.phoneOrEmail,
      MatKhau: this.password,
    };
    console.log('Auth login payload:', loginPayload);

    this.authApiService.login(loginPayload).subscribe({
      next: (response: any) => {
        const data = response?.data || response;
        const token = data?.token || data?.access_token;
        const customer = data?.customer || data?.user || {};
        if (data && token) {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('access_token', token);
            localStorage.setItem('customer_info', JSON.stringify(customer));
            localStorage.setItem('lastLoggedInUser', JSON.stringify({
              phoneOrEmail: this.phoneOrEmail,
              password: this.password
            }));
            localStorage.setItem('currentUserId', customer.MaKhachHang || '');
          }

          this.customerAuthApiService.setToken(token);
          const userName = customer.HoTenKhachHang || 'Người dùng';
          this.authService.login(customer);
          this.loggedIn.emit(userName);

          this.closeModal();
          this.router.navigate(['/home']);
        } else {
          this.loginError = 'Đăng nhập không thành công, phản hồi không hợp lệ.';
        }
      },
      error: (err: any) => {
        console.error('Login error:', err);
        this.loginError = err.error?.message || err.message || 'Số điện thoại/email hoặc mật khẩu không đúng.';
      }
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  openForgot(event: Event) {
    event.preventDefault();
    this.authModalService.openForgotModal();
    // Do not call this.closeModal() here, modal switching is handled by modalMode$ in header
  }

  openRegister(event: Event) {
    event.preventDefault();
    this.authModalService.openRegisterModal();
    // Do not call this.closeModal() here, modal switching is handled by modalMode$ in header
  }

  closeModal() {
    this.close.emit();
  }
}