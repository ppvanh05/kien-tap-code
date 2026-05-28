import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class DanhGiaService {
  private url = `${API_BASE}/customer/danh-gia`;

  constructor(private http: HttpClient) {}

  getReviews(params: {
    page?: number;
    limit?: number;
    rating?: number;
    hasComment?: boolean;
    hasImage?: boolean;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.rating !== undefined) {
      httpParams = httpParams.set('rating', params.rating.toString());
    }
    if (params.hasComment !== undefined) {
      httpParams = httpParams.set('hasComment', params.hasComment.toString());
    }
    if (params.hasImage !== undefined) {
      httpParams = httpParams.set('hasImage', params.hasImage.toString());
    }
    return this.http.get<any>(this.url, { params: httpParams });
  }

  getHomeReviews(): Observable<any> {
    return this.http.get<any>(`${this.url}/home`);
  }
}
