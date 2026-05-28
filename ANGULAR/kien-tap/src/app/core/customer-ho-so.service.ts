import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { supabase } from './supabase.client';

@Injectable({
  providedIn: 'root'
})
export class CustomerHoSoService {
  private apiUrl = `${environment.apiUrl}/customer/ho-so`;

  constructor(private http: HttpClient) { }

  getProfile(MaKhachHang: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${MaKhachHang}`);
  }

  updateProfile(MaKhachHang: string, payload: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${MaKhachHang}`, payload);
  }

  async uploadAvatar(file: File, MaKhachHang: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${MaKhachHang}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}