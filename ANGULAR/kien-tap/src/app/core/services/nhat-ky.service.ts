import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000';

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
