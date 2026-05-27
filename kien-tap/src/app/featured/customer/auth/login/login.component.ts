import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  // Đưa vào đây là đúng vị trí hợp lệ
  @Output() close = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<string>();

  phoneOrEmail = '';
  password = '';
  showPassword = false;
  loginError = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  onLogin() {
    const userName = 'Người dùng'; 
    this.authService.login(userName);
    this.loggedIn.emit(userName); 
    this.router.navigate(['/home']);
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  openForgot(event: Event) {
    event.preventDefault();
  }

  openRegister(event: Event) {
    event.preventDefault();
  }

  closeModal() {
    this.close.emit();
  }
}