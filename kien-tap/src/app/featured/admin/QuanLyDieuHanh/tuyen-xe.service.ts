import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  private apiUrl = 'http://localhost:3000/dieu-hanh/tuyen-xe';
  private routes: Route[] = [];

  constructor(private http: HttpClient) {
    this.refreshRoutes();
  }

  refreshRoutes() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
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
            status: r.TrangThai || 'active',
            createdAt: new Date(),
          });
        });
      },
      error: (err) => console.error('Lỗi khi tải danh sách tuyến xe:', err)
    });
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
      error: (err) => console.error('Lỗi khi cập nhật tuyến xe:', err)
    });
  }

  deleteRoute(id: string | number) {
    const idx = this.routes.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.routes.splice(idx, 1);
    }

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      error: (err) => console.error('Lỗi khi xóa tuyến xe:', err)
    });
  }
}
