import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class HomeApiService {
  constructor(private http: HttpClient) {}

  getActiveRoutes(): Observable<any> {
    return this.http.get<any>(`${API_BASE}/customer/home/routes`);
  }
}
