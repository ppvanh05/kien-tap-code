import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiBase || 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class ProfileApiService {
  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get<any>(`${API_BASE}/customer/profile`);
  }

  updateProfile(dto: {
    HoTenKhachHang?: string;
    Email?: string;
    AnhDaiDien?: string;
    GioiTinh?: string;
    NgaySinh?: string;
  }): Observable<any> {
    return this.http.put<any>(`${API_BASE}/customer/profile`, dto);
  }

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (typeof localStorage !== 'undefined') {
      token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || '';
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getHistory(trangThai?: string, sortByDate: 'asc' | 'desc' = 'desc'): Observable<any> {
    let params = new HttpParams();
    if (trangThai) {
      params = params.set('trangThai', trangThai);
    }
    if (sortByDate) {
      params = params.set('sortByDate', sortByDate);
    }

    return this.http.get<any>(`${API_BASE}/customer/tra-cuu-ve/history`, {
      params,
      headers: this.getAuthHeaders()
    });
  }
}
