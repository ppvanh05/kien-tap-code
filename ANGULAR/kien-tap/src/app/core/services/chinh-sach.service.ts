import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class ChinhSachService {
  private csUrl = `${API_BASE}/chinh-sach`;

  constructor(private http: HttpClient) {}

  // ===== CHINH_SACH (Bảo hiểm, Thanh toán, Khác) =====

  getAllChinhSach(): Observable<any[]> {
    return this.http.get<any[]>(this.csUrl);
  }

  getChinhSachById(id: string): Observable<any> {
    return this.http.get<any>(`${this.csUrl}/${id}`);
  }

  createChinhSach(data: any): Observable<any> {
    return this.http.post<any>(this.csUrl, data);
  }

  updateChinhSach(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.csUrl}/${id}`, data);
  }

  deleteChinhSach(id: string): Observable<any> {
    return this.http.delete<any>(`${this.csUrl}/${id}`);
  }

  // ===== CHINH_SACH_HUY_VE (Chính sách hủy vé) =====

  getAllChinhSachHuyVe(): Observable<any[]> {
    return this.http.get<any[]>(`${this.csUrl}/huy-ve/all`);
  }

  getChinhSachHuyVeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.csUrl}/huy-ve/${id}`);
  }

  createChinhSachHuyVe(data: any): Observable<any> {
    return this.http.post<any>(`${this.csUrl}/huy-ve`, data);
  }

  updateChinhSachHuyVe(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.csUrl}/huy-ve/${id}`, data);
  }

  deleteChinhSachHuyVe(id: string): Observable<any> {
    return this.http.delete<any>(`${this.csUrl}/huy-ve/${id}`);
  }
}
