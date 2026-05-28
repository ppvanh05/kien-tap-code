import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class NhanVienService {
  private url = `${API_BASE}/nhan-vien`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(this.url, data);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, data);
  }

  updateStatus(id: string, trangThai: string): Observable<any> {
    return this.http.patch<any>(`${this.url}/${id}/status`, { TrangThai: trangThai });
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}
