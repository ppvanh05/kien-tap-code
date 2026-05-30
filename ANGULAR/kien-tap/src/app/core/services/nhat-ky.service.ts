import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiBase;

@Injectable({
  providedIn: 'root',
})
export class NhatKyService {
  private url = `${API_BASE}/nhat-ky`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  ghiLog(logData: any): Observable<any> {
    return this.http.post<any>(this.url, logData);
  }
}
