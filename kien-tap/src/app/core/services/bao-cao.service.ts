import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class BaoCaoService {
  private baseUrl = `${API_BASE}/bao-cao`;

  constructor(private http: HttpClient) {}

  getBaoCaoChuyenXe(filters: {
    fromDate?: string;
    toDate?: string;
    route?: string;
    licensePlate?: string;
    status?: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    if (filters.route) params = params.set('route', filters.route);
    if (filters.licensePlate) params = params.set('licensePlate', filters.licensePlate);
    if (filters.status) params = params.set('status', filters.status);

    return this.http.get<any[]>(`${this.baseUrl}/chuyen-xe`, { params });
  }

  getBaoCaoHoanHuy(filters: {
    fromDate?: string;
    toDate?: string;
    nguoiHuy?: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    if (filters.nguoiHuy) params = params.set('nguoiHuy', filters.nguoiHuy);

    return this.http.get<any[]>(`${this.baseUrl}/hoan-huy`, { params });
  }

  getBaoCaoKhachHang(filters: {
    fromDate?: string;
    toDate?: string;
    status?: string;
    searchTerm?: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.searchTerm) params = params.set('searchTerm', filters.searchTerm);

    return this.http.get<any[]>(`${this.baseUrl}/khach-hang`, { params });
  }

  getBaoCaoTaiXePhuXe(filters: {
    role?: string;
    status?: string;
    searchTerm?: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    if (filters.role) params = params.set('role', filters.role);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.searchTerm) params = params.set('searchTerm', filters.searchTerm);

    return this.http.get<any[]>(`${this.baseUrl}/tai-xe-phu-xe`, { params });
  }

  getBaoCaoTuyenXe(filters: {
    fromDate?: string;
    toDate?: string;
    route?: string;
    status?: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    if (filters.route) params = params.set('route', filters.route);
    if (filters.status) params = params.set('status', filters.status);

    return this.http.get<any[]>(`${this.baseUrl}/tuyen-xe`, { params });
  }
}
