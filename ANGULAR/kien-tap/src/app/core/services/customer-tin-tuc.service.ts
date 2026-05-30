import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiBase;

@Injectable({
  providedIn: 'root',
})
export class CustomerTinTucService {
  private url = `${API_BASE}/customer/tin-tuc`;

  constructor(private http: HttpClient) {}

  getPublishedNews(params: {
    page?: number;
    limit?: number;
    loai?: string;
    search?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.loai !== undefined && params.loai !== '') {
      httpParams = httpParams.set('loai', params.loai);
    }
    if (params.search !== undefined && params.search !== '') {
      httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<any>(this.url, { params: httpParams });
  }

  getHomeNews(): Observable<any> {
    return this.http.get<any>(`${this.url}/home`);
  }

  getNewsById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

}
