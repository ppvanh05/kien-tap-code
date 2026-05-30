import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiBase;

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
