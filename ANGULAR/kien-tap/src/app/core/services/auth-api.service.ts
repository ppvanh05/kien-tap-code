import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  constructor(private http: HttpClient) {}

  checkPhone(phone: string): Observable<{ exists: boolean }> {
    return this.http.post<{ exists: boolean }>(`${API_BASE}/customer/auth/check-phone`, { SoDienThoai: phone });
  }

  sendOtp(data: { SoDienThoai: string; MucDich: string }): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/auth/send-otp`, data);
  }

  verifyOtp(data: { SoDienThoai: string; otp: string; MucDich: string; markUsed?: boolean }): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/auth/verify-otp`, data);
  }

  register(data: {
    HoTenKhachHang: string;
    SoDienThoai: string;
    Email?: string;
    MatKhau: string;
    GioiTinh?: string;
    NgaySinh?: string;
    otp?: string;
  }): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/auth/register`, data);
  }

  login(data: { phoneOrEmail: string; MatKhau: string }): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/auth/login`, data);
  }

  forgotPassword(data: { SoDienThoai: string }): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/auth/forgot-password`, data);
  }

  resetPassword(data: { SoDienThoai: string; otp: string; MatKhauMoi: string }): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/auth/reset-password`, data);
  }
}
