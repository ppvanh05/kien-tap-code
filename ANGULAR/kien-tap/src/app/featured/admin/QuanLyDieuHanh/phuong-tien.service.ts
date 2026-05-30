import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';

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

const dbToFrontendMap: { [key: string]: string } = {
  'Tivi': 'tivi',
  'Ổ sạc, USB': 'usb',
  'Wifi': 'wifi',
  'Nước, khăn ướt': 'water',
  'GPS': 'gps',
  'Điều hòa': 'ac',
  'tivi': 'tivi',
  'usb': 'usb',
  'wifi': 'wifi',
  'water': 'water',
  'gps': 'gps',
  'ac': 'ac',
  'OSac+USB': 'usb',
  'Nuoc+KhanUot': 'water',
  'DieuHoa': 'ac'
};

function parsePgArray(str: string): string[] {
  if (!str) return [];
  if (!str.startsWith('{') || !str.endsWith('}')) {
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  const clean = str.slice(1, -1);
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current) {
    result.push(current.trim());
  }
  return result;
}

@Injectable({
  providedIn: 'root'
})
export class PhuongTienService {
  private apiUrl = environment.apiBase + '/dieu-hanh/phuong-tien';
  private vehicles: Vehicle[] = [];
  public vehiclesUpdated$ = new Subject<void>();

  constructor(private http: HttpClient) {
    this.refreshVehicles();
  }

  refreshVehicles() {
    if (typeof window === 'undefined') return;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.loadMockVehicles();
        } else {
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
              amenities: v.TienIch ? (Array.isArray(v.TienIch) ? v.TienIch : parsePgArray(v.TienIch)).map((x: string) => dbToFrontendMap[x] || x) : [],
              status: v.TrangThaiPhuongTien === 'DaKhoa' ? 'locked' : 'active',
              vehicleImage: v.AnhXe || undefined,
              selectedSeats: [],
              createdAt: new Date(),
            });
          });
          this.vehiclesUpdated$.next();
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách xe:', err);
        this.loadMockVehicles();
      }
    });
  }

  private loadMockVehicles() {
    this.vehicles.length = 0;
    this.vehicles.push(
      {
        id: 1,
        name: 'Limousine 22 phòng',
        licensePlate: '15B-888.99',
        type: 'Limousine 22 phòng',
        seats: 22,
        floors: 2,
        rows: 6,
        registrationExpiry: '30/12/2026',
        insuranceExpiry: '30/12/2026',
        amenities: ['wifi', 'usb', 'water', 'ac'],
        status: 'active',
        selectedSeats: [],
        createdAt: new Date()
      },
      {
        id: 2,
        name: 'Xe giường nằm 36 chỗ',
        licensePlate: '29B-123.45',
        type: 'Giường nằm 36 chỗ',
        seats: 36,
        floors: 2,
        rows: 6,
        registrationExpiry: '15/08/2026',
        insuranceExpiry: '15/08/2026',
        amenities: ['wifi', 'water', 'ac'],
        status: 'active',
        selectedSeats: [],
        createdAt: new Date()
      },
      {
        id: 3,
        name: 'Limousine 9 chỗ VIP',
        licensePlate: '30F-999.99',
        type: 'Limousine 9 chỗ',
        seats: 9,
        floors: 1,
        rows: 3,
        registrationExpiry: '01/10/2026',
        insuranceExpiry: '01/10/2026',
        amenities: ['wifi', 'usb', 'water', 'tivi', 'ac'],
        status: 'locked',
        selectedSeats: [],
        createdAt: new Date()
      }
    );
    this.vehiclesUpdated$.next();
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
        this.vehiclesUpdated$.next();
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
      next: () => {
        this.vehiclesUpdated$.next();
      },
      error: (err) => console.error('Lỗi khi cập nhật phương tiện:', err)
    });
  }

  deleteVehicle(id: string | number) {
    const idx = this.vehicles.findIndex(v => v.id === id);
    if (idx !== -1) {
      this.vehicles.splice(idx, 1);
    }

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.vehiclesUpdated$.next();
      },
      error: (err) => console.error('Lỗi khi xóa phương tiện:', err)
    });
  }
}
