import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface AdminUser {
  MaNhanVien: string;
  TenTruyCap?: string;
  HoVaTenDem?: string;
  Ten?: string;
  Email: string;
  TenHienThi: string;
  GioiTinh?: string;
  NgaySinh?: string;
  DiaChi?: string;
  SoDienThoai?: string;
  GhiChu?: string;
  LoaiTaiKhoan: string;
  AnhDaiDien?: string;
  Quyen?: string[];
}

export interface AdminProfileUpdate {
  HoVaTenDem?: string;
  Ten?: string;
  TenHienThi?: string;
  GioiTinh?: string;
  NgaySinh?: string | null;
  DiaChi?: string | null;
  SoDienThoai?: string;
  Email?: string;
  AnhDaiDien?: string | null;
  GhiChu?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private apiUrl = 'http://localhost:3000/admin/auth';
  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserFromStorage();
    }
  }

  private loadUserFromStorage() {
    const userStr = localStorage.getItem('admin_user');
    const token = localStorage.getItem('admin_token');
    if (userStr && token) {
      try {
        this.currentUserSubject.next(JSON.parse(userStr));
      } catch (e) {
        this.logout();
      }
    }
  }

  login(email: string, matKhau: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, matKhau }).pipe(
      tap(res => {
        this.persistSession(res);
      })
    );
  }

  getProfile(): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/me`).pipe(
      tap(admin => {
        if (admin) {
          this.persistUser(admin);
        }
      })
    );
  }

  updateProfile(payload: AdminProfileUpdate): Observable<{ token: string; admin: AdminUser }> {
    return this.http.put<{ token: string; admin: AdminUser }>(`${this.apiUrl}/me`, payload).pipe(
      tap(res => {
        this.persistSession(res);
      })
    );
  }

  private persistSession(res: any) {
    if (res && res.token && res.admin) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('admin_token', res.token);
      }
      this.persistUser(res.admin);
    }
  }

  private persistUser(admin: AdminUser) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('admin_user', JSON.stringify(admin));
    }
    this.currentUserSubject.next(admin);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    this.currentUserSubject.next(null);
  }

  get currentUserValue(): AdminUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('admin_token');
    }
    return false;
  }
}
