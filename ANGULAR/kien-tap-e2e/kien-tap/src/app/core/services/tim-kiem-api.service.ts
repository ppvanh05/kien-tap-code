import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiBase;

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

  // Reserve seats (hold) on server for a short time
  reserveSeats(maLichTrinh: string, seats: string[], sessionId?: string): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/tim-kiem-chuyen-xe/reserve`, {
      maLichTrinh,
      seats,
      sessionId,
    });
  }

  // Release seats previously held on server
  releaseSeats(maLichTrinh: string, seats: string[], sessionId?: string): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/tim-kiem-chuyen-xe/release`, {
      maLichTrinh,
      seats,
      sessionId,
    });
  }

  // Finalize seats (mark sold) after successful payment
  finalizeSeats(maLichTrinh: string, seats: string[], sessionId?: string): Observable<any> {
    return this.http.post<any>(`${API_BASE}/customer/tim-kiem-chuyen-xe/finalize`, {
      maLichTrinh,
      seats,
      sessionId,
    });
  }
}
