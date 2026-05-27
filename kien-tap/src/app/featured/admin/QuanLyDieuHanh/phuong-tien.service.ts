import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Vehicle {
  id: string | number;
  name: string;
  licensePlate: string;
  type: string;
  seats: number;
  floors?: number;
  rows?: number;
  registrationExpiry: string;
  insuranceExpiry: string;
  amenities: string[];
  status: 'active' | 'locked';
  registrationImage?: string;
  insuranceImage?: string;
  vehicleImage?: string;
  selectedSeats: string[];
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PhuongTienService {
  private apiUrl = 'http://localhost:3000/dieu-hanh/phuong-tien';
  private vehicles: Vehicle[] = [];

  constructor(private http: HttpClient) {
    this.refreshVehicles();
  }

  refreshVehicles() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.vehicles.length = 0;
        data.forEach(v => {
          this.vehicles.push({
            id: v.MaXe,
            name: v.TenXe,
            licensePlate: v.BienSoXe,
            type: v.LoaiXe,
            seats: v.SoGhe,
            floors: v.SoTang,
            rows: v.SoDay,
            registrationExpiry: v.HanDangKiem ? new Date(v.HanDangKiem).toLocaleDateString('vi-VN') : '',
            insuranceExpiry: v.HanBaoHiem ? new Date(v.HanBaoHiem).toLocaleDateString('vi-VN') : '',
            amenities: v.TienIch ? v.TienIch.split(', ').filter((x: string) => x.length > 0) : [],
            status: v.TrangThai || 'active',
            vehicleImage: v.AnhXe || undefined,
            selectedSeats: [],
            createdAt: new Date(),
          });
        });
      },
      error: (err) => console.error('Lỗi khi tải danh sách xe:', err)
    });
  }

  getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  addVehicle(vehicle: Omit<Vehicle, 'id'>): Vehicle {
    const tempId = 'TEMP_' + Math.random().toString(36).substr(2, 9);
    const newVehicle: Vehicle = { ...vehicle, id: tempId, createdAt: new Date() };
    this.vehicles.unshift(newVehicle);

    this.http.post<any>(this.apiUrl, vehicle).subscribe({
      next: (res) => {
        newVehicle.id = res.MaXe;
      },
      error: (err) => console.error('Lỗi khi thêm phương tiện:', err)
    });

    return newVehicle;
  }

  updateVehicle(id: string | number, updated: Partial<Vehicle>) {
    const idx = this.vehicles.findIndex(v => v.id === id);
    if (idx !== -1) {
      this.vehicles[idx] = { ...this.vehicles[idx], ...updated };
    }

    // Convert date format DD/MM/YYYY to Date object if present
    const payload = { ...updated } as any;
    if (updated.registrationExpiry && updated.registrationExpiry.includes('/')) {
      const parts = updated.registrationExpiry.split('/');
      payload.registrationExpiry = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    if (updated.insuranceExpiry && updated.insuranceExpiry.includes('/')) {
      const parts = updated.insuranceExpiry.split('/');
      payload.insuranceExpiry = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }

    this.http.put(`${this.apiUrl}/${id}`, payload).subscribe({
      error: (err) => console.error('Lỗi khi cập nhật phương tiện:', err)
    });
  }

  deleteVehicle(id: string | number) {
    const idx = this.vehicles.findIndex(v => v.id === id);
    if (idx !== -1) {
      this.vehicles.splice(idx, 1);
    }

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      error: (err) => console.error('Lỗi khi xóa phương tiện:', err)
    });
  }
}
