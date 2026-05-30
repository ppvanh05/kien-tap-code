import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiBase;

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class ChinhSachService {
  private publicUrl = `${API_BASE}/chinh-sach`;
  private adminUrl = `${API_BASE}/admin/chinh-sach`;

  constructor(private http: HttpClient) {}

  // ===== Public (customer) =====

  getPublicChinhSach(): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(this.publicUrl)
      .pipe(map((res) => res.data ?? []));
  }

  getPublicChinhSachById(id: string): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${this.publicUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  getPublicChinhSachHuyVe(): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.publicUrl}/huy-ve/all`)
      .pipe(map((res) => res.data ?? []));
  }

  // ===== Admin CRUD (CHINH_SACH) =====

  getAllChinhSach(): Observable<any[]> {
    return this.http.get<any[]>(this.adminUrl);
  }

  getChinhSachById(id: string): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/${id}`);
  }

  createChinhSach(data: any): Observable<any> {
    return this.http.post<any>(this.adminUrl, data);
  }

  updateChinhSach(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.adminUrl}/${id}`, data);
  }

  deleteChinhSach(id: string): Observable<any> {
    return this.http.delete<any>(`${this.adminUrl}/${id}`);
  }

  // ===== Admin CRUD (CHINH_SACH_HUY_VE) =====

  getAllChinhSachHuyVe(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminUrl}/huy-ve/all`);
  }

  getChinhSachHuyVeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/huy-ve/${id}`);
  }

  createChinhSachHuyVe(data: any): Observable<any> {
    return this.http.post<any>(`${this.adminUrl}/huy-ve`, data);
  }

  updateChinhSachHuyVe(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.adminUrl}/huy-ve/${id}`, data);
  }

  deleteChinhSachHuyVe(id: string): Observable<any> {
    return this.http.delete<any>(`${this.adminUrl}/huy-ve/${id}`);
  }
}
