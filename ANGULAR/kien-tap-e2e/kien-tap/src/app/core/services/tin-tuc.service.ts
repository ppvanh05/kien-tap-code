import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiBase;

@Injectable({
  providedIn: 'root',
})
export class TinTucService {
  private url = `${API_BASE}/tin-tuc`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  getByTrangThai(trangThai: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/trang-thai/${trangThai}`);
  }

  getByLoai(loai: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/loai/${loai}`);
  }

  create(dto: any): Observable<any> {
    return this.http.post<any>(this.url, dto);
  }

  update(id: string, dto: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, dto);
  }

  updateTrangThai(id: string, trangThai: string): Observable<any> {
    return this.http.patch<any>(`${this.url}/${id}/trang-thai`, { trangThai });
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}
