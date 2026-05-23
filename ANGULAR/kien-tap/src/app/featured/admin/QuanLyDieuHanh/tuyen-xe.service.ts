import { Injectable } from '@angular/core';

export interface Route {
  id: number;
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
  private routes: Route[] = [
    {
      id: 1,
      name: 'Bến xe Miền Đông – Bến xe Hà Nội',
      startPoint: 'Bến xe Miền Đông',
      startProvince: 'TP. Hồ Chí Minh',
      endPoint: 'Bến xe Hà Nội',
      endProvince: 'Hà Nội',
      distance: 1720,
      estimatedHours: 32,
      estimatedMinutes: 0,
      status: 'active',
      createdAt: new Date('2026-05-01')
    },
    {
      id: 2,
      name: 'Bến xe Miền Đông – Bến xe Đà Nẵng',
      startPoint: 'Bến xe Miền Đông',
      startProvince: 'TP. Hồ Chí Minh',
      endPoint: 'Bến xe Đà Nẵng',
      endProvince: 'Đà Nẵng',
      distance: 960,
      estimatedHours: 18,
      estimatedMinutes: 30,
      status: 'active',
      createdAt: new Date('2026-05-02')
    },
    {
      id: 3,
      name: 'Bến xe Miền Đông – Bến xe Vinh',
      startPoint: 'Bến xe Miền Đông',
      startProvince: 'TP. Hồ Chí Minh',
      endPoint: 'Bến xe Vinh',
      endProvince: 'Nghệ An',
      distance: 1350,
      estimatedHours: 26,
      estimatedMinutes: 0,
      status: 'active',
      createdAt: new Date('2026-05-03')
    },
    {
      id: 4,
      name: 'Bến xe Miền Đông – Bến xe Huế',
      startPoint: 'Bến xe Miền Đông',
      startProvince: 'TP. Hồ Chí Minh',
      endPoint: 'Bến xe Huế',
      endProvince: 'Thừa Thiên – Huế',
      distance: 1050,
      estimatedHours: 20,
      estimatedMinutes: 0,
      status: 'active',
      createdAt: new Date('2026-05-04')
    },
    {
      id: 5,
      name: 'Bến xe Quy Nhơn – Bến xe Hà Nội',
      startPoint: 'Bến xe Quy Nhơn',
      startProvince: 'Bình Định',
      endPoint: 'Bến xe Hà Nội',
      endProvince: 'Hà Nội',
      distance: 1070,
      estimatedHours: 21,
      estimatedMinutes: 30,
      status: 'active',
      createdAt: new Date('2026-05-05')
    },
    {
      id: 6,
      name: 'Bến xe Quy Nhơn – Bến xe Cần Thơ',
      startPoint: 'Bến xe Quy Nhơn',
      startProvince: 'Bình Định',
      endPoint: 'Bến xe Cần Thơ',
      endProvince: 'Cần Thơ',
      distance: 720,
      estimatedHours: 14,
      estimatedMinutes: 0,
      status: 'active',
      createdAt: new Date('2026-05-06')
    },
    {
      id: 7,
      name: 'Bến xe Quy Nhơn – Bến xe Đà Lạt',
      startPoint: 'Bến xe Quy Nhơn',
      startProvince: 'Bình Định',
      endPoint: 'Bến xe Đà Lạt',
      endProvince: 'Lâm Đồng',
      distance: 430,
      estimatedHours: 9,
      estimatedMinutes: 0,
      status: 'active',
      createdAt: new Date('2026-05-07')
    },
    {
      id: 8,
      name: 'Bến xe Quy Nhơn – Bến xe Buôn Ma Thuột',
      startPoint: 'Bến xe Quy Nhơn',
      startProvince: 'Bình Định',
      endPoint: 'Bến xe Buôn Ma Thuột',
      endProvince: 'Đắk Lắk',
      distance: 280,
      estimatedHours: 6,
      estimatedMinutes: 30,
      status: 'locked',
      createdAt: new Date('2026-05-08')
    },
    {
      id: 9,
      name: 'Bến xe Miền Đông – Bến xe Quy Nhơn',
      startPoint: 'Bến xe Miền Đông',
      startProvince: 'TP. Hồ Chí Minh',
      endPoint: 'Bến xe Quy Nhơn',
      endProvince: 'Bình Định',
      distance: 650,
      estimatedHours: 13,
      estimatedMinutes: 30,
      status: 'active',
      createdAt: new Date('2026-05-09')
    },
    {
      id: 10,
      name: 'Bến xe Miền Tây – Bến xe Phan Thiết',
      startPoint: 'Bến xe Miền Tây',
      startProvince: 'TP. Hồ Chí Minh',
      endPoint: 'Bến xe Phan Thiết',
      endProvince: 'Bình Thuận',
      distance: 210,
      estimatedHours: 4,
      estimatedMinutes: 30,
      status: 'locked',
      createdAt: new Date('2026-05-10')
    },
    {
      id: 11,
      name: 'Bến xe Quy Nhơn – Bến xe Nha Trang',
      startPoint: 'Bến xe Quy Nhơn',
      startProvince: 'Bình Định',
      endPoint: 'Bến xe Nha Trang',
      endProvince: 'Khánh Hòa',
      distance: 220,
      estimatedHours: 5,
      estimatedMinutes: 0,
      status: 'active',
      createdAt: new Date('2026-05-11')
    },
    {
      id: 12,
      name: 'Bến xe Quy Nhơn – Bến xe Pleiku',
      startPoint: 'Bến xe Quy Nhơn',
      startProvince: 'Bình Định',
      endPoint: 'Bến xe Pleiku',
      endProvince: 'Gia Lai',
      distance: 170,
      estimatedHours: 4,
      estimatedMinutes: 0,
      status: 'active',
      createdAt: new Date('2026-05-12')
    },
    {
      id: 13,
      name: 'Bến xe An Sương – Bến xe Vũng Tàu',
      startPoint: 'Bến xe An Sương',
      startProvince: 'TP. Hồ Chí Minh',
      endPoint: 'Bến xe Vũng Tàu',
      endProvince: 'Bà Rịa – Vũng Tàu',
      distance: 120,
      estimatedHours: 3,
      estimatedMinutes: 0,
      status: 'active',
      createdAt: new Date('2026-05-13')
    },
    {
      id: 14,
      name: 'Bến xe Quy Nhơn – Bến xe Tuy Hòa',
      startPoint: 'Bến xe Quy Nhơn',
      startProvince: 'Bình Định',
      endPoint: 'Bến xe Tuy Hòa',
      endProvince: 'Phú Yên',
      distance: 100,
      estimatedHours: 2,
      estimatedMinutes: 30,
      status: 'active',
      createdAt: new Date('2026-05-14')
    }
  ];

  getRoutes(): Route[] {
    return this.routes;
  }

  getRoutesList(): string[] {
    return this.routes.map(r => r.name);
  }

  addRoute(route: Omit<Route, 'id'>): Route {
    const newId = Math.max(...this.routes.map(r => r.id), 0) + 1;
    const newRoute = { ...route, id: newId };
    this.routes.unshift(newRoute);
    return newRoute;
  }

  updateRoute(id: number, updated: Partial<Route>) {
    const idx = this.routes.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.routes[idx] = { ...this.routes[idx], ...updated };
    }
  }

  deleteRoute(id: number) {
    const idx = this.routes.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.routes.splice(idx, 1);
    }
  }
}
