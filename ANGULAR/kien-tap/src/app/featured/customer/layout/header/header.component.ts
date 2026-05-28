import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginComponent } from '../../auth/login/login.component';
import { RegisterComponent } from '../../auth/register/register.component';
import { ForgotPasswordComponent } from '../../auth/forgot-password/forgot-password.component';
import { AuthModalService, AuthModalMode } from '../../auth/auth-modal.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isIntroDropdownOpen = false;
  isUserDropdownOpen = false;
  isLoggedIn = false;
  userName: string | null = null;
  userAvatar: string | null = null;
  modalMode: AuthModalMode = null;

  // ĐÃ SỬA: Gộp 2 cái constructor lỗi thành 1 cái duy nhất sạch sẽ
  constructor(
    private eRef: ElementRef,
    private router: Router,
    private authService: AuthService,
    private authModalService: AuthModalService
  ) {
    // Logic của bên thứ nhất
    this.authService.isLoggedIn$.subscribe(status => this.isLoggedIn = status);
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.HoTenKhachHang;
        this.userAvatar = user.AnhDaiDien || '/asset/images/customer/user.png';
      } else {
        this.userName = null;
        this.userAvatar = null;
      }
    });

    // Logic của bên thứ hai (bạn Nghi)
    this.authModalService.modalMode$.subscribe(mode => {
      this.modalMode = mode;
    });
  }

  login() {
    this.authModalService.openLoginModal();
  }

  closeModal() {
    this.authModalService.closeModal();
  }

  handleRegistered(HoTenKhachHang: string) {
    this.userName = HoTenKhachHang || 'Người dùng';
    this.isLoggedIn = true;
    this.closeModal();
  }

  handleLoggedIn(HoTenKhachHang: string) {
    this.userName = HoTenKhachHang || 'Người dùng';
    this.isLoggedIn = true;
    this.closeModal();
  }

  isIntroActive(): boolean {
    return this.router.url.startsWith('/gioi-thieu');
  }

  toggleIntroDropdown(event: Event) {
    event.stopPropagation();
    this.isIntroDropdownOpen = !this.isIntroDropdownOpen;
    this.isUserDropdownOpen = false;
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    this.isIntroDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeIntroDropdown();
      this.isUserDropdownOpen = false;
    }
  }

  closeIntroDropdown() {
    this.isIntroDropdownOpen = false;
  }

  logout() {
    this.authService.logout();
    this.isUserDropdownOpen = false;
    this.router.navigate(['/home']);
  }
}