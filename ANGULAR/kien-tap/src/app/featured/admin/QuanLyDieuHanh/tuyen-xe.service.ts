import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Route {
  id: string | number;
  name: string;
  startPoint: string;
  startProvince: string;
  endPoint: string;
  endProvince: string;
  distance: number;
  estimatedHours: number;
  estimatedMinutes: number;
  status: 'active' | 'locked';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TuyenXeService {
  private apiUrl = environment.apiBase + '/dieu-hanh/tuyen-xe';
  private routes: Route[] = [];
  public routesUpdated$ = new Subject<void>();

  constructor(private http: HttpClient) {
    this.refreshRoutes();
  }

  refreshRoutes() {
    if (typeof window === 'undefined') return;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.loadMockRoutes();
        } else {
          this.routes.length = 0;
          data.forEach(r => {
            const hours = r.ThoiGianDiChuyenDuKien ? new Date(r.ThoiGianDiChuyenDuKien).getHours() : 0;
            const minutes = r.ThoiGianDiChuyenDuKien ? new Date(r.ThoiGianDiChuyenDuKien).getMinutes() : 0;
            this.routes.push({
              id: r.MaTuyenXe,
              name: r.TenTuyenXe,
              startPoint: r.DiemKhoiHanh,
              startProvince: r.DiemKhoiHanh,
              endPoint: r.DiemDen,
              endProvince: r.DiemDen,
              distance: r.KhoangCach || 0,
              estimatedHours: hours,
              estimatedMinutes: minutes,
              status: r.TrangThaiTuyenXe === 'DaKhoa' ? 'locked' : 'active',
              createdAt: new Date(),
            });
          });
          this.routesUpdated$.next();
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách tuyến xe:', err);
        this.loadMockRoutes();
      }
    });
  }

  private loadMockRoutes() {
    this.routes.length = 0;
    this.routes.push(
      {
        id: 1,
        name: 'Hà Nội - SaPa',
        startPoint: 'Bến xe Mỹ Đình',
        startProvince: 'Hà Nội',
        endPoint: 'Bến xe SaPa',
        endProvince: 'Lào Cai',
        distance: 320,
        estimatedHours: 5,
        estimatedMinutes: 30,
        status: 'active',
        createdAt: new Date()
      },
      {
        id: 2,
        name: 'Hà Nội - Hải Phòng',
        startPoint: 'Bến xe Mỹ Đình',
        startProvince: 'Hà Nội',
        endPoint: 'Bến xe Vĩnh Niệm',
        endProvince: 'Hải Phòng',
        distance: 120,
        estimatedHours: 2,
        estimatedMinutes: 0,
        status: 'active',
        createdAt: new Date()
      },
      {
        id: 3,
        name: 'Hải Phòng - Hà Giang',
        startPoint: 'Bến xe Vĩnh Niệm',
        startProvince: 'Hải Phòng',
        endPoint: 'Bến xe Hà Giang',
        endProvince: 'Hà Giang',
        distance: 380,
        estimatedHours: 7,
        estimatedMinutes: 15,
        status: 'active',
        createdAt: new Date()
      }
    );
    this.routesUpdated$.next();
  }

  getRoutes(): Route[] {
    return this.routes;
  }

  getRoutesList(): string[] {
    return this.routes.map(r => r.name);
  }

  addRoute(route: Omit<Route, 'id'>): Route {
    const tempId = 'TEMP_' + Math.random().toString(36).substr(2, 9);
    const newRoute: Route = { ...route, id: tempId, createdAt: new Date() };
    this.routes.unshift(newRoute);

    this.http.post<any>(this.apiUrl, route).subscribe({
      next: (res) => {
        newRoute.id = res.MaTuyenXe;
        this.routesUpdated$.next();
      },
      error: (err) => console.error('Lỗi khi thêm tuyến xe:', err)
    });

    return newRoute;
  }

  updateRoute(id: string | number, updated: Partial<Route>) {
    const idx = this.routes.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.routes[idx] = { ...this.routes[idx], ...updated };
    }

    this.http.put(`${this.apiUrl}/${id}`, updated).subscribe({
      next: () => {
        this.routesUpdated$.next();
      },
      error: (err) => console.error('Lỗi khi cập nhật tuyến xe:', err)
    });
  }

  deleteRoute(id: string | number) {
    const idx = this.routes.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.routes.splice(idx, 1);
    }

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.routesUpdated$.next();
      },
      error: (err) => console.error('Lỗi khi xóa tuyến xe:', err)
    });
  }
}
