import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthModalService } from '../auth-modal.service'; // Correct import

interface MockUser {
  phoneNumber: string;
  fullName: string;
  email: string;
  password: string;
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

  constructor(
    private router: Router,
    private authService: AuthService,
    private authModalService: AuthModalService
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
          password: '123456'
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

    // Mock authentication logic
    const mockUsers = this.getMockUsers();
    const user: MockUser | undefined = mockUsers.find(u => 
      (u.phoneNumber === this.phoneOrEmail || u.email === this.phoneOrEmail) && u.password === this.password
    );

    if (user) {
      const userName = user.fullName || 'Người dùng'; 
      this.authService.login(userName);
      this.loggedIn.emit(userName); 
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('lastLoggedInUser', JSON.stringify({
          phoneOrEmail: this.phoneOrEmail,
          password: this.password
        }));
      }
      this.router.navigate(['/home']);
    } else {
      this.loginError = 'Số điện thoại/email hoặc mật khẩu không đúng.';
    }
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