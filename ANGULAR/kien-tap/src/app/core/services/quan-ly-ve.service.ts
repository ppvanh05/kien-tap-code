import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class QuanLyVeService {
  private url = `${API_BASE}/quan-ly-ve`;

  constructor(private http: HttpClient) {}

  getAllVe(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/ve`);
  }

  getVeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/ve/${id}`);
  }

  getAllDonHang(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/don-hang`);
  }

  getDonHangById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/don-hang/${id}`);
  }

  updateTrangThaiVe(id: string, trangThai: string, maNhanVien?: string): Observable<any> {
    return this.http.patch<any>(`${this.url}/ve/${id}/trang-thai`, { trangThai, maNhanVien });
  }

  huyVe(id: string, lyDo: string, maNVBanVe?: string): Observable<any> {
    return this.http.post<any>(`${this.url}/ve/${id}/huy`, { lyDo, maNVBanVe });
  }

  taoDonHang(dto: {
    maKhachHang: string;
    maNVBanVe?: string;
    hoTenNguoiDi?: string;
    sdtNguoiDi?: string;
    emailNguoiDi?: string;
    maLichTrinh: string;
    maGheChuyenList: string[];
    maDiemDon: string;
    maDiemTra: string;
    phuongThucThanhToan: string;
    ghiChu?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.url}/tao-don-hang`, dto);
  }
}
