import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  MaKhachHang?: string;
  HoTenKhachHang: string;
  SoDienThoai?: string;
  Email?: string;
  AnhDaiDien?: string;
  GioiTinh?: string;
  NgaySinh?: string;
  TrangThaiTaiKhoan?: string;
  NgayDangKy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser = new BehaviorSubject<UserProfile | null>(null);
  currentUser$: Observable<UserProfile | null> = this._currentUser.asObservable();

  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this._isLoggedIn.asObservable();

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user: UserProfile = JSON.parse(storedUser);
        this._currentUser.next(user);
        this._isLoggedIn.next(true);
      }
    }
  }

  setCurrentUser(user: UserProfile) {
    this._currentUser.next(user);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this._isLoggedIn.next(true);
  }

  getCurrentUser(): UserProfile | null {
    return this._currentUser.getValue();
  }

  login(MaKhachHang: string, HoTenKhachHang: string, SoDienThoai: string, Email: string, AnhDaiDien: string, GioiTinh: string, NgaySinh: string, TrangThaiTaiKhoan: string, NgayDangKy: string) {
    const user: UserProfile = {
      MaKhachHang,
      HoTenKhachHang,
      SoDienThoai,
      Email,
      AnhDaiDien,
      GioiTinh,
      NgaySinh,
      TrangThaiTaiKhoan,
      NgayDangKy
    };
    this.setCurrentUser(user);
  }

  logout() {
    this._currentUser.next(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('currentUser');
    }
    this._isLoggedIn.next(false);
  }
}

  