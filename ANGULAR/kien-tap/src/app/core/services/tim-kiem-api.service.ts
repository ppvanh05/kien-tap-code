import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class TimKiemApiService {
  constructor(private http: HttpClient) {}

  searchTrips(departure: string, destination: string, date: string): Observable<any> {
    return this.http.get<any>(`${API_BASE}/customer/tim-kiem-chuyen-xe/search`, {
      params: {
        departure,
        destination,
        date,
      },
    });
  }

  getTripDetail(tripId: string): Observable<any> {
    return this.http.get<any>(`${API_BASE}/customer/tim-kiem-chuyen-xe/detail/${tripId}`);
  }

  createOrder(payload: any): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/thong-tin-don-hang/create-order`, payload);
  }
}
