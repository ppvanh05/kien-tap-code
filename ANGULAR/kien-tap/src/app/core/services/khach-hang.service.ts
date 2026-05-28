import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class KhachHangService {
  private url = `${API_BASE}/khach-hang`;

  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    return this.http.post<any>(this.url, data);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  getByTrangThai(trangThai: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/trang-thai/${trangThai}`);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  getVeByKhachHang(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/${id}/ve`);
  }

  getNhatKyByKhachHang(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/${id}/nhat-ky`);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, data);
  }

  khoaTaiKhoan(id: string, lyDoKhoa: string): Observable<any> {
    return this.http.patch<any>(`${this.url}/${id}/khoa`, { LyDoKhoa: lyDoKhoa });
  }

  moKhoaTaiKhoan(id: string): Observable<any> {
    return this.http.patch<any>(`${this.url}/${id}/mo-khoa`, {});
  }
}
