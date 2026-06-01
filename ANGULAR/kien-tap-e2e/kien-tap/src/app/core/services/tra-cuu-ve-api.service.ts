import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiBase || 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class TraCuuVeApiService {
  constructor(private http: HttpClient) {}

  lookup(maDonHang: string, soDienThoai: string): Observable<any> {
    return this.http.get<any>(`${API_BASE}/customer/tra-cuu-ve/lookup`, {
      params: {
        maDonHang,
        soDienThoai,
      },
    });
  }

  updateInfo(maDonHang: string, payload: {
    HoTenNguoiDi: string;
    SdtNguoiDi: string;
    EmailNguoiDi?: string;
    MaDiemDon: string;
    MaDiemTra: string;
  }): Observable<any> {
    return this.http.put<any>(`${API_BASE}/customer/tra-cuu-ve/update-info/${maDonHang}`, payload);
  }

  cancelTicket(maVe: string, lyDo: string): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/tra-cuu-ve/cancel/${maVe}`, { lyDo });
  }

  updateOrderStatus(maDonHang: string, trangThai: string): Observable<any> {
    return this.http.put<any>(`${API_BASE}/customer/tra-cuu-ve/update-status/${maDonHang}`, { trangThai });
  }

  submitReview(payload: {
    MaVe: string;
    MaKhachHang: string;
    SoSao: number;
    NoiDungDanhGia: string;
    mediaUrls?: string[];
  }): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/reviews`, payload);
  }

  getCancelPolicies(): Observable<any> {
    // Backend endpoint lives under the tra-cuu-ve controller
    return this.http.get<any>(`${API_BASE}/customer/tra-cuu-ve/cancel-policies`);
  }
}
