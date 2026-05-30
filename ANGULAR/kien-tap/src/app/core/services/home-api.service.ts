import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiBase;

@Injectable({
  providedIn: 'root',
})
export class HomeApiService {
  constructor(private http: HttpClient) {}

  getActiveRoutes(): Observable<any> {
    return this.http.get<any>(`${API_BASE}/customer/home/routes`);
  }
}
