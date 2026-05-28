import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AdminAuthService, AdminProfileUpdate, AdminUser } from '../../../core/services/admin-auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  isOpen?: boolean;
  disabled?: boolean;
  permission?: string;
}

interface AdminProfileForm {
  HoVaTenDem: string;
  Ten: string;
  TenHienThi: string;
  GioiTinh: string;
  NgaySinh: string;
  DiaChi: string;
  SoDienThoai: string;
  Email: string;
  AnhDaiDien: string;
  GhiChu: string;
}

type ProfileValidationField =
  | 'HoVaTenDem'
  | 'Ten'
  | 'TenHienThi'
  | 'SoDienThoai'
  | 'Email'
  | 'NgaySinh'
  | 'DiaChi'
  | 'GhiChu';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  isSidebarCollapsed = false;
  currentDate = new Date();
  currentUser: AdminUser | null = null;
  isAvatarMenuOpen = false;
  isProfileModalOpen = false;
  isSavingProfile = false;
  profileError = '';
  profileSuccess = '';
  profileForm: AdminProfileForm = this.createEmptyProfileForm();
  profileFieldErrors: Partial<Record<ProfileValidationField, string>> = {};
  profileTouched: Partial<Record<ProfileValidationField, boolean>> = {};

  private readonly profileValidationFields: ProfileValidationField[] = [
    'HoVaTenDem',
    'Ten',
    'TenHienThi',
    'SoDienThoai',
    'Email',
    'NgaySinh',
    'DiaChi',
    'GhiChu',
  ];

  constructor(private router: Router, private authService: AdminAuthService) {
    // Tự động xử lý trạng thái menu khi chuyển trang
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentUrl = event.urlAfterRedirects || event.url;
      
      this.menuItems.forEach(item => {
        if (item.children) {
          // Kiểm tra xem có con nào đang active không
          const hasActiveChild = item.children.some(child => 
            child.route && currentUrl.includes(child.route)
          );
          
          // Nếu có con active, giữ menu mở. Nếu không, đóng lại.
          if (hasActiveChild) {
            item.isOpen = true;
          }
        }
      });
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.applyRBAC();
    });
  }

  menuItems: MenuItem[] = [
    { label: 'Trang chủ', icon: 'home', route: '/admin/trang-chu' },
    {
      label: 'Quản lý vé',
      icon: 'confirmation_number',
      isOpen: false,
      children: [
        { label: 'Đặt vé mới', icon: 'add_circle', route: '/admin/quan-ly-ve/dat-ve-moi', permission: 'ticket.sell' },
        { label: 'Danh sách vé', icon: 'list_alt', route: '/admin/quan-ly-ve/danh-sach-ve', permission: 'ticket.view' }
      ]
    },
    { label: 'Quản lý tin tức', icon: 'article', route: '/admin/quan-ly-tin-tuc', permission: 'news.view' },
    {
      label: 'Quản lý điều hành',
      icon: 'settings_input_component',
      isOpen: false,
      children: [
        { label: 'Quản lý tuyến xe', icon: 'route', route: '/admin/quan-ly-dieu-hanh/quan-ly-tuyen-xe', permission: 'route.view' },
        { label: 'Quản lý lịch trình', icon: 'calendar_month', route: '/admin/quan-ly-dieu-hanh/quan-ly-lich-trinh', permission: 'trip.create' },
        { label: 'Quản lý phương tiện', icon: 'directions_bus', route: '/admin/quan-ly-dieu-hanh/quan-ly-phuong-tien', permission: 'vehicle.manage' },
        { label: 'Quản lý tài xế & phụ xe', icon: 'badge', route: '/admin/quan-ly-dieu-hanh/quan-ly-tai-xe-phu-xe', permission: 'driver.manage' },
        { label: 'Quản lý điểm đón trả dừng', icon: 'location_on', route: '/admin/quan-ly-dieu-hanh/quan-ly-diem-don-tra-dung', permission: 'route.manage' }
      ]
    },
    { label: 'Quản lý khách hàng', icon: 'groups', route: '/admin/quan-ly-khach-hang', permission: 'customer.view' },
    { label: 'Quản lý nhân viên', icon: 'engineering', route: '/admin/quan-ly-nhan-vien', permission: 'staff.view' },
    { label: 'Quản lý chính sách', icon: 'policy', route: '/admin/quan-ly-chinh-sach', permission: 'policy.view' },
    { label: 'Quản lý từ khóa cấm', icon: 'block', route: '/admin/quan-ly-tu-khoa-cam', permission: 'blacklist.view' },
    {
      label: 'Báo cáo',
      icon: 'bar_chart',
      isOpen: false,
      permission: 'report.view',
      children: [
        { label: 'Báo cáo chi tiết', icon: 'list_alt', route: '/admin/bao-cao/bao-cao-chi-tiet', permission: 'report.view' },
        { label: 'Báo cáo theo tuyến', icon: 'route', route: '/admin/bao-cao/bao-cao-tong-hop-theo-tuyen', permission: 'report.view' },
        { label: 'Báo cáo tài xế & phụ xe', icon: 'badge', route: '/admin/bao-cao/bao-cao-tai-xe-phu-xe', permission: 'report.view' },
        { label: 'Báo cáo khách hàng', icon: 'groups', route: '/admin/bao-cao/bao-cao-khach-hang', permission: 'report.view' },
        { label: 'Báo cáo hoàn hủy', icon: 'cancel', route: '/admin/bao-cao/bao-cao-hoan-huy', permission: 'report.view' }
      ]
    },
    { label: 'Quản lý nhật ký', icon: 'history_edu', route: '/admin/quan-ly-nhat-ky', permission: 'log.view' }
  ];

  applyRBAC() {
    if (!this.currentUser) return;
    
    const permissions = this.currentUser.Quyen || [];

    this.menuItems.forEach(item => {
      // 1. Check parent item permission
      if (item.permission && !permissions.includes(item.permission)) {
        item.disabled = true;
      } else {
        item.disabled = false;
      }

      // 2. Check child item permissions
      if (item.children) {
        let hasActiveChild = false;
        item.children.forEach(child => {
          if (child.permission && !permissions.includes(child.permission)) {
            child.disabled = true;
          } else {
            child.disabled = false;
            hasActiveChild = true;
          }
        });

        // If all children are disabled, disable the parent item too
        if (item.children.length > 0 && !hasActiveChild) {
          item.disabled = true;
        }
      }
    });
  }

  toggleAvatarMenu() {
    this.isAvatarMenuOpen = !this.isAvatarMenuOpen;
  }

  createEmptyProfileForm(): AdminProfileForm {
    return {
      HoVaTenDem: '',
      Ten: '',
      TenHienThi: '',
      GioiTinh: 'Nam',
      NgaySinh: '',
      DiaChi: '',
      SoDienThoai: '',
      Email: '',
      AnhDaiDien: '',
      GhiChu: '',
    };
  }

  openProfileModal(event?: MouseEvent) {
    event?.stopPropagation();
    if (!this.currentUser) return;

    this.isAvatarMenuOpen = false;
    this.profileError = '';
    this.profileSuccess = '';
    this.resetProfileValidation();
    this.profileForm = {
      HoVaTenDem: this.currentUser.HoVaTenDem || '',
      Ten: this.currentUser.Ten || '',
      TenHienThi: this.currentUser.TenHienThi || '',
      GioiTinh: this.currentUser.GioiTinh || 'Nam',
      NgaySinh: this.formatDateInput(this.currentUser.NgaySinh),
      DiaChi: this.currentUser.DiaChi || '',
      SoDienThoai: this.currentUser.SoDienThoai || '',
      Email: this.currentUser.Email || '',
      AnhDaiDien: this.currentUser.AnhDaiDien || '',
      GhiChu: this.currentUser.GhiChu || '',
    };
    this.isProfileModalOpen = true;

    this.authService.getProfile().subscribe({
      next: admin => {
        this.profileForm = {
          HoVaTenDem: admin.HoVaTenDem || '',
          Ten: admin.Ten || '',
          TenHienThi: admin.TenHienThi || '',
          GioiTinh: admin.GioiTinh || 'Nam',
          NgaySinh: this.formatDateInput(admin.NgaySinh),
          DiaChi: admin.DiaChi || '',
          SoDienThoai: admin.SoDienThoai || '',
          Email: admin.Email || '',
          AnhDaiDien: admin.AnhDaiDien || '',
          GhiChu: admin.GhiChu || '',
        };
        this.resetProfileValidation();
      },
      error: () => {
        this.profileError = 'Không thể tải lại hồ sơ hiện tại.';
      }
    });
  }

  closeProfileModal() {
    if (this.isSavingProfile) return;
    this.isProfileModalOpen = false;
    this.profileError = '';
    this.profileSuccess = '';
    this.resetProfileValidation();
  }

  saveProfile() {
    this.profileError = '';
    this.profileSuccess = '';

    if (!this.validateProfileForm()) {
      this.profileError = 'Vui lòng kiểm tra lại các ô đang báo lỗi.';
      return;
    }

    const payload: AdminProfileUpdate = {
      HoVaTenDem: this.profileForm.HoVaTenDem.trim(),
      Ten: this.profileForm.Ten.trim(),
      TenHienThi: this.profileForm.TenHienThi.trim(),
      GioiTinh: this.profileForm.GioiTinh,
      NgaySinh: this.profileForm.NgaySinh || null,
      DiaChi: this.profileForm.DiaChi.trim(),
      SoDienThoai: this.profileForm.SoDienThoai.trim(),
      Email: this.profileForm.Email.trim(),
      AnhDaiDien: this.profileForm.AnhDaiDien,
      GhiChu: this.profileForm.GhiChu.trim(),
    };

    this.isSavingProfile = true;
    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.profileSuccess = 'Đã cập nhật thông tin cá nhân.';
        this.isSavingProfile = false;
        setTimeout(() => {
          this.isProfileModalOpen = false;
          this.profileSuccess = '';
        }, 700);
      },
      error: err => {
        this.profileError = err?.error?.message || 'Không thể cập nhật thông tin cá nhân.';
        this.isSavingProfile = false;
      }
    });
  }

  onProfileAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.profileError = 'Ảnh đại diện không được vượt quá 2MB.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.profileForm.AnhDaiDien = reader.result as string;
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  removeProfileAvatar(event: MouseEvent) {
    event.stopPropagation();
    this.profileForm.AnhDaiDien = '';
  }

  onProfileFieldInput(field: ProfileValidationField) {
    this.profileTouched[field] = true;
    this.validateProfileField(field);
    this.profileError = '';
    this.profileSuccess = '';
  }

  hasProfileFieldError(field: ProfileValidationField): boolean {
    return !!this.profileTouched[field] && !!this.profileFieldErrors[field];
  }

  get hasProfileValidationErrors(): boolean {
    return Object.values(this.profileFieldErrors).some(Boolean);
  }

  private resetProfileValidation() {
    this.profileFieldErrors = {};
    this.profileTouched = {};
  }

  private validateProfileForm(): boolean {
    this.profileValidationFields.forEach(field => {
      this.profileTouched[field] = true;
      this.validateProfileField(field);
    });

    return !this.hasProfileValidationErrors;
  }

  private validateProfileField(field: ProfileValidationField): boolean {
    const value = String(this.profileForm[field] || '').trim();
    let error = '';
    const namePattern = /^[\p{L}\s'.-]+$/u;

    if (field === 'HoVaTenDem') {
      if (!value) error = 'Vui lòng nhập họ và tên đệm.';
      else if (!namePattern.test(value)) error = 'Họ và tên đệm không được chứa số hoặc ký tự đặc biệt.';
    }

    if (field === 'Ten') {
      if (!value) error = 'Vui lòng nhập tên.';
      else if (!namePattern.test(value)) error = 'Tên không được chứa số hoặc ký tự đặc biệt.';
    }

    if (field === 'TenHienThi') {
      if (!value) error = 'Vui lòng nhập tên hiển thị.';
      else if (!namePattern.test(value)) error = 'Tên hiển thị không được chứa số hoặc ký tự đặc biệt.';
    }

    if (field === 'SoDienThoai') {
      const phone = value.replace(/\s/g, '');
      if (!value) error = 'Vui lòng nhập số điện thoại.';
      else if (!/^[+\d\s]+$/.test(value)) error = 'Số điện thoại chỉ gồm chữ số và dấu +.';
      else if (!/^(0\d{9,10}|\+84\d{9,10})$/.test(phone)) {
        error = 'Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10-11 chữ số.';
      }
    }

    if (field === 'Email') {
      if (!value) error = 'Vui lòng nhập email.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) error = 'Email chưa đúng định dạng.';
    }

    if (field === 'NgaySinh' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      birthDate.setHours(0, 0, 0, 0);
      if (Number.isNaN(birthDate.getTime())) error = 'Ngày sinh không hợp lệ.';
      else if (birthDate > today) error = 'Ngày sinh không được lớn hơn ngày hiện tại.';
    }

    if (field === 'DiaChi' && value.length > 255) {
      error = 'Địa chỉ tối đa 255 ký tự.';
    }

    if (field === 'GhiChu' && value.length > 500) {
      error = 'Ghi chú tối đa 500 ký tự.';
    }

    if (error) {
      this.profileFieldErrors[field] = error;
      return false;
    }

    delete this.profileFieldErrors[field];
    return true;
  }

  getRoleLabel(role?: string): string {
    if (role === 'QuanTriVien') return 'Quản trị viên';
    if (role === 'BanQuanLy') return 'Ban quản lý';
    if (role === 'NhanVienBanVe' || role === 'BanVe') return 'Nhân viên bán vé';
    if (role === 'NhanVienDieuPhoi' || role === 'DieuPhoi') return 'Nhân viên điều phối';
    return 'Nhân viên';
  }

  getInitials(name?: string): string {
    const text = (name || '').trim();
    if (!text) return 'NV';
    const parts = text.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  private formatDateInput(value?: string): string {
    if (!value) return '';
    return String(value).split('T')[0].slice(0, 10);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleSubmenu(item: MenuItem) {
    if (item.disabled) return;
    
    if (item.children) {
      if (this.isSidebarCollapsed) {
        this.isSidebarCollapsed = false;
        setTimeout(() => {
          const currentState = item.isOpen;
          this.menuItems.forEach(m => {
            if (m !== item) m.isOpen = false;
          });
          item.isOpen = !currentState;
        }, 300);
      } else {
        const currentState = item.isOpen;
        this.menuItems.forEach(m => {
          if (m !== item) m.isOpen = false;
        });
        item.isOpen = !currentState;
      }
    } else {
      this.menuItems.forEach(m => m.isOpen = false);
    }
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('vi-VN', options);
  }

  get isAnyMenuOpen(): boolean {
    return this.menuItems.some(m => m.isOpen);
  }
}
