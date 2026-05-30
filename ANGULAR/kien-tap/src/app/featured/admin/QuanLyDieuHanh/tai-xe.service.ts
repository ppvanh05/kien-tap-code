import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Driver {
  id: string | number;
  name: string;
  dob: string;
  phone: string;
  licenseClass: string;
  licenseExpiry: string;
  avatar: string | null;
  licenseFront: string | null;
  licenseBack: string | null;
  cccdFront: string | null;
  cccdBack: string | null;
  status: 'active' | 'locked';
  cccdNumber: string;
  role: 'driver' | 'assistant';
}

@Injectable({
  providedIn: 'root'
}
)
export class TaiXeService {
  private apiUrl = environment.apiBase + '/dieu-hanh/tai-xe-phu-xe';
  private drivers: Driver[] = [];
  public driversUpdated$ = new Subject<void>();

  constructor(private http: HttpClient) {
    this.refreshDrivers();
  }

  refreshDrivers() {
    if (typeof window === 'undefined') return;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.loadMockDrivers();
        } else {
          this.drivers.length = 0;
          data.forEach(d => {
            this.drivers.push({
              id: d.MaTaiXePhuXe,
              name: d.HoTen,
              dob: d.NgaySinh ? new Date(d.NgaySinh).toLocaleDateString('vi-VN') : '',
              phone: d.SoDienThoai || '',
              licenseClass: d.LoaiBangLai || '',
              licenseExpiry: d.ThoiHanBangLai ? new Date(d.ThoiHanBangLai).toLocaleDateString('vi-VN') : '',
              avatar: d.AnhChanDung || null,
              licenseFront: d.AnhBangLai || null,
              licenseBack: null,
              cccdFront: d.AnhCCCD || null,
              cccdBack: null,
              status: d.TrangThaiLamViec === 'DaKhoa' ? 'locked' : 'active',
              cccdNumber: d.CCCD || '',
              role: d.LoaiNhanVien === 'TaiXe' ? 'driver' : 'assistant',
            });
          });
          this.driversUpdated$.next();
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách tài xế/phụ xe:', err);
        this.loadMockDrivers();
      }
    });
  }

  private loadMockDrivers() {
    this.drivers.length = 0;
    this.drivers.push(
      {
        id: 1,
        name: 'Nguyễn Văn Hùng',
        dob: '12/05/1985',
        phone: '0912345678',
        licenseClass: 'Hạng E',
        licenseExpiry: '12/05/2030',
        avatar: null,
        licenseFront: null,
        licenseBack: null,
        cccdFront: null,
        cccdBack: null,
        status: 'active',
        cccdNumber: '037085001234',
        role: 'driver'
      },
      {
        id: 2,
        name: 'Trần Thanh Sơn',
        dob: '22/10/1990',
        phone: '0987654321',
        licenseClass: 'Hạng D',
        licenseExpiry: '22/10/2029',
        avatar: null,
        licenseFront: null,
        licenseBack: null,
        cccdFront: null,
        cccdBack: null,
        status: 'active',
        cccdNumber: '037090005678',
        role: 'driver'
      },
      {
        id: 3,
        name: 'Lê Văn Nam',
        dob: '15/03/1995',
        phone: '0905111222',
        licenseClass: 'Hạng C',
        licenseExpiry: '15/03/2028',
        avatar: null,
        licenseFront: null,
        licenseBack: null,
        cccdFront: null,
        cccdBack: null,
        status: 'active',
        cccdNumber: '037095009999',
        role: 'assistant'
      }
    );
    this.driversUpdated$.next();
  }

  getDrivers(): Driver[] {
    return this.drivers;
  }

  getDriversList(): { name: string, status: 'active' | 'locked' }[] {
    return this.drivers
      .filter(d => d.role === 'driver')
      .map(d => ({ name: d.name, status: d.status }));
  }

  getAssistantsList(): { name: string, status: 'active' | 'locked' }[] {
    return this.drivers
      .filter(d => d.role === 'assistant')
      .map(d => ({ name: d.name, status: d.status }));
  }

  addDriver(driver: Omit<Driver, 'id'>): Driver {
    const tempId = 'TEMP_' + Math.random().toString(36).substr(2, 9);
    const newDriver: Driver = { ...driver, id: tempId };
    this.drivers.unshift(newDriver);

    this.http.post<any>(this.apiUrl, driver).subscribe({
      next: (res) => {
        newDriver.id = res.MaTaiXePhuXe;
        this.driversUpdated$.next();
      },
      error: (err) => console.error('Lỗi khi thêm nhân viên:', err)
    });

    return newDriver;
  }

  updateDriver(id: string | number, updated: Partial<Driver>) {
    const idx = this.drivers.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.drivers[idx] = { ...this.drivers[idx], ...updated };
    }

    const payload = { ...updated } as any;
    if (updated.dob && updated.dob.includes('/')) {
      const parts = updated.dob.split('/');
      payload.dob = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    if (updated.licenseExpiry && updated.licenseExpiry.includes('/')) {
      const parts = updated.licenseExpiry.split('/');
      payload.licenseExpiry = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }

    this.http.put(`${this.apiUrl}/${id}`, payload).subscribe({
      next: () => {
        this.driversUpdated$.next();
      },
      error: (err) => console.error('Lỗi khi cập nhật nhân viên:', err)
    });
  }

  deleteDriver(id: string | number) {
    const idx = this.drivers.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.drivers.splice(idx, 1);
    }

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.driversUpdated$.next();
      },
      error: (err) => console.error('Lỗi khi xóa nhân viên:', err)
    });
  }
}
