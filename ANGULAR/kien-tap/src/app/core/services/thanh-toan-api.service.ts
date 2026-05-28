import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class ThanhToanApiService {
  constructor(private http: HttpClient) {}

  createTransaction(data: { MaDonHang: string; PhuongThucThanhToan: string; SoTien: number }): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/thanh-toan/create-transaction`, data);
  }

  callbackSuccess(data: { MaDonHang: string; MaGiaoDich: string }): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/thanh-toan/callback/success`, data);
  }
}
