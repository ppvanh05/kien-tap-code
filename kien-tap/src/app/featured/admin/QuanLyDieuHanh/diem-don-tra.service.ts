import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface DiemDonTra {
  id: string | number;
  name: string;
  address: string;
  city: string;
  phone: string;
  mapLink: string;
  image: string | null;
  status: 'active' | 'locked';
  type: 'don-tra' | 'dung';
}

@Injectable({
  providedIn: 'root'
})
export class DiemDonTraService {
  private apiUrl = 'http://localhost:3000/dieu-hanh/diem-don-tra-dung';
  private points: DiemDonTra[] = [];

  constructor(private http: HttpClient) {
    this.refreshPoints();
  }

  refreshPoints() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.points.length = 0;
        data.forEach(p => {
          this.points.push({
            id: p.MaDiem,
            name: p.TenDiem,
            address: p.DiaChi,
            city: p.ThanhPho || p.Tinh || '',
            phone: '',
            mapLink: p.LinkGoogleMap || '',
            image: p.AnhDiem || null,
            status: p.TrangThai || 'active',
            type: p.LoaiDiem || 'don-tra'
          });
        });
      },
      error: (err) => console.error('Lỗi khi tải danh sách điểm đón/trả/dừng:', err)
    });
  }

  getPoints(): DiemDonTra[] {
    return this.points;
  }

  savePoint(point: DiemDonTra) {
    const index = this.points.findIndex(p => p.id === point.id);
    if (index !== -1) {
      this.points[index] = { ...point };
    }

    this.http.put(`${this.apiUrl}/${point.id}`, point).subscribe({
      error: (err) => console.error('Lỗi khi cập nhật điểm đón/trả/dừng:', err)
    });
  }

  addPoint(point: Omit<DiemDonTra, 'id'>): DiemDonTra {
    const tempId = 'TEMP_' + Math.random().toString(36).substr(2, 9);
    const newPoint: DiemDonTra = { ...point, id: tempId } as DiemDonTra;
    this.points.unshift(newPoint);

    this.http.post<any>(this.apiUrl, point).subscribe({
      next: (res) => {
        newPoint.id = res.MaDiem;
      },
      error: (err) => console.error('Lỗi khi thêm điểm đón/trả/dừng:', err)
    });

    return newPoint;
  }

  deletePoint(id: string | number) {
    const index = this.points.findIndex(p => p.id === id);
    if (index !== -1) {
      this.points.splice(index, 1);
    }

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      error: (err) => console.error('Lỗi khi xóa điểm đón/trả/dừng:', err)
    });
  }
}
