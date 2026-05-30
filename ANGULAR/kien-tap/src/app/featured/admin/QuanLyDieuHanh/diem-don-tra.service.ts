import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
  private apiUrl = environment.apiBase + '/dieu-hanh/diem-don-tra-dung';
  private points: DiemDonTra[] = [];
  public pointsUpdated$ = new Subject<void>();

  constructor(private http: HttpClient) {
    this.refreshPoints();
  }

  refreshPoints() {
    if (typeof window === 'undefined') return;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.loadMockPoints();
        } else {
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
              status: p.TrangThaiDiem === 'DaKhoa' ? 'locked' : 'active',
              type: p.LoaiDiem === 'DiemDonTra' ? 'don-tra' : 'dung'
            });
          });
          this.pointsUpdated$.next();
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách điểm đón/trả/dừng:', err);
        this.loadMockPoints();
      }
    });
  }

  private loadMockPoints() {
    this.points.length = 0;
    this.points.push(
      {
        id: 1,
        name: 'Bến xe Mỹ Đình',
        address: '20 Phạm Hùng, Mỹ Đình, Từ Liêm',
        city: 'Hà Nội',
        phone: '02437685549',
        mapLink: '',
        image: null,
        status: 'active',
        type: 'don-tra'
      },
      {
        id: 2,
        name: 'Bến xe SaPa',
        address: 'Đường Điện Biên Phủ, Sa Pa',
        city: 'Lào Cai',
        phone: '02143771771',
        mapLink: '',
        image: null,
        status: 'active',
        type: 'don-tra'
      },
      {
        id: 3,
        name: 'Trạm dừng chân Km57',
        address: 'Cao tốc Nội Bài - Lào Cai',
        city: 'Phú Thọ',
        phone: '',
        mapLink: '',
        image: null,
        status: 'active',
        type: 'dung'
      },
      {
        id: 4,
        name: 'Văn phòng Hải Phòng',
        address: '129 Đinh Tiên Hoàng',
        city: 'Hải Phòng',
        phone: '02253888999',
        mapLink: '',
        image: null,
        status: 'active',
        type: 'don-tra'
      }
    );
    this.pointsUpdated$.next();
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
      next: () => {
        this.pointsUpdated$.next();
      },
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
        this.pointsUpdated$.next();
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
      next: () => {
        this.pointsUpdated$.next();
      },
      error: (err) => console.error('Lỗi khi xóa điểm đón/trả/dừng:', err)
    });
  }
}
