import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiBase;

@Injectable({
  providedIn: 'root',
})
export class TuKhoaCamService {
  private url = `${API_BASE}/tu-khoa-cam`;

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

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}
