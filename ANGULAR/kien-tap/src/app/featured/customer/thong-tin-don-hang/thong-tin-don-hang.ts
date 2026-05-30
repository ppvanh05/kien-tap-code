import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../core/services/toast.service';
import { TimKiemApiService } from '../../../core/services/tim-kiem-api.service';

interface Seat {
  name: string;
  status: 'sold' | 'available' | 'selected';
  deck: 'lower' | 'upper';
  side: 'left' | 'right';
  price: number;
}

@Component({
  selector: 'app-thong-tin-don-hang',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './thong-tin-don-hang.html',
  styleUrl: './thong-tin-don-hang.css',
})
export class ThongTinDonHang implements OnInit {
  bookingData: any = {
    tripId: null,
    routeCode: '',
    selectedDate: '',
    departureTime: '',
    suggestedPresenceTime: '',
    gioGoiYCoMat: '',
    arrivalTime: '',
    duration: '',
    distance: '',
    startStation: '',
    endStation: '',
    price: 0,
    selectedSeats: [],
    selectedRoomGuests: {},
    totalPrice: 0,
    pickup: null,
    dropoff: null,
  };

  seats: Seat[] = [];
  selectedRoomGuests: { [seatName: string]: number } = {};

  // Customer Form Fields
  customerName: string = '';
  customerPhone: string = '';
  customerEmail: string = '';
  agreeTerms: boolean = false;

  // Pickup/Dropoff dropdown states
  pickupSearch: string = '';
  dropoffSearch: string = '';
  showPickupDropdown: boolean = false;
  showDropoffDropdown: boolean = false;

  selectedPickup: any = null;
  selectedDropoff: any = null;

  pickupOptions: any[] = [];
  dropoffOptions: any[] = [];

  backendSeats: any[] = [];

  constructor(
    private router: Router,
    private toastService: ToastService,
    private timKiemApiService: TimKiemApiService,
    private cdr: ChangeDetectorRef
  ) { }

  isCityMatch(stopCity: string, routeCity: string): boolean {
    if (!stopCity || !routeCity) return false;
    const cleanStop = stopCity.toLowerCase().trim();
    const cleanRoute = routeCity.toLowerCase().trim();
    
    if (cleanStop.includes(cleanRoute) || cleanRoute.includes(cleanStop)) return true;
    if (cleanRoute.includes('hồ chí minh') || cleanRoute.includes('hcm') || cleanRoute.includes('sài gòn')) {
      return cleanStop.includes('hồ chí minh') || cleanStop.includes('hcm') || cleanStop.includes('quận') || cleanStop.includes('thành phố hồ chí minh');
    }
    if (cleanRoute.includes('quy nhơn') || cleanRoute.includes('bình định')) {
      return cleanStop.includes('quy nhơn') || cleanStop.includes('bình định');
    }
    if (cleanRoute.includes('tuy hòa') || cleanRoute.includes('phú yên')) {
      return cleanStop.includes('tuy hòa') || cleanStop.includes('phú yên');
    }
    return false;
  }

  formatTimeStr(d: any): string {
    if (!d) return '18:00';
    const dateObj = new Date(d);
    return `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  }

  get suggestedPresenceTime(): string {
    // Return the trip's original scheduled presence time (gioGoiYCoMat) instead of pickup point time
    return this.bookingData.gioGoiYCoMat || this.bookingData.suggestedPresenceTime || '';
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('current_booking');
      if (saved) {
        try {
          this.bookingData = {
            ...this.bookingData,
            ...JSON.parse(saved)
          };
        } catch (e) {
          console.error('Invalid current_booking payload', e);
        }
      }

      if (this.bookingData && this.bookingData.selectedDate) {
        this.selectedDate = this.bookingData.selectedDate;
      }

      const custInfoStr = localStorage.getItem('customer_info');
      if (custInfoStr) {
        try {
          const custInfo = JSON.parse(custInfoStr);
          if (custInfo) {
            this.customerName = custInfo.HoTenKhachHang || '';
            this.customerPhone = custInfo.SoDienThoai || '';
            this.customerEmail = custInfo.Email || '';
          }
        } catch (e) {
          console.error('Failed to parse customer_info', e);
        }
      }
    }

    if (!this.bookingData || !this.bookingData.tripId) {
      this.router.navigate(['/tim-kiem-chuyen']);
      return;
    }

    if (this.bookingData && this.bookingData.tripId) {
      this.timKiemApiService.getTripDetail(this.bookingData.tripId).subscribe({
        next: (response: any) => {
          if (response && response.success && response.data) {
            this.backendSeats = response.data.gheChuyenXe || [];
            // Keep gioGoiYCoMat synchronized from getTripDetail response
            if (response.data.GioGoiYCoMat) {
              this.bookingData.gioGoiYCoMat = this.formatTimeStr(response.data.GioGoiYCoMat);
            } else if (response.data.gioGoiYCoMat) {
              this.bookingData.gioGoiYCoMat = this.formatTimeStr(response.data.gioGoiYCoMat);
            }
            const allStops = response.data.diemDungLichTrinh || [];
            const routeCode = this.bookingData.routeCode || response.data.MaTuyenXe || response.data.tuyenXe?.MaTuyenXe;

            this.pickupOptions = allStops
              .filter((stop: any) => stop.LoaiDiem === 'DiemDonTra' || stop.LoaiDiem === 'DiemDon' || stop.LoaiDiem === 'Don' || (stop.GhiChu && stop.GhiChu.toLowerCase().includes('don')))
              .map((stop: any) => ({
                time: this.formatTimeStr(stop.GioDenDuKien || stop.GioKhoiHanh || stop.GioGoiYCoMat),
                name: this.restoreVietnameseAccents(stop.TenDiem || stop.TenDiembb || stop.TenDiemDon),
                address: this.restoreVietnameseAccents(stop.DiaChi || stop.GhiChu || stop.DuongDan || ''),
                maDiem: stop.MaDiem || stop.MaDiemDon || stop.MaDiemDiem,
                raw: stop
              }));

            this.dropoffOptions = allStops
              .filter((stop: any) => stop.LoaiDiem === 'DiemDonTra' || stop.LoaiDiem === 'DiemTra' || stop.LoaiDiem === 'Tra' || (stop.GhiChu && stop.GhiChu.toLowerCase().includes('tra')))
              .map((stop: any) => ({
                time: this.formatTimeStr(stop.GioDenDuKien || stop.GioKhoiHanh || stop.GioGoiYCoMat),
                name: this.restoreVietnameseAccents(stop.TenDiem || stop.TenDiemTra || stop.TenDiembb),
                address: this.restoreVietnameseAccents(stop.DiaChi || stop.GhiChu || stop.DuongDan || ''),
                maDiem: stop.MaDiem || stop.MaDiemTra || stop.MaDiemDiem,
                raw: stop
              }));

            if (this.bookingData.pickup) {
              this.selectedPickup = this.bookingData.pickup;
              this.pickupSearch = this.restoreVietnameseAccents(this.bookingData.pickup.name || this.bookingData.pickup.address || '');
            } else {
              this.selectedPickup = null;
              this.pickupSearch = '';
            }

            if (this.bookingData.dropoff) {
              this.selectedDropoff = this.bookingData.dropoff;
              this.dropoffSearch = this.restoreVietnameseAccents(this.bookingData.dropoff.name || this.bookingData.dropoff.address || '');
            } else {
              this.selectedDropoff = null;
              this.dropoffSearch = '';
            }

            this.initSeats();
            this.recalculatePrice();
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load trip details', err);
          this.cdr.detectChanges();
        }
      });
    }

    this.initSeats();
    this.recalculatePrice();
  }

  initSeats() {
    const lowerNames = ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A'];
    const upperNames = ['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B'];

    const basePrice = this.bookingData.price;
    const selected = this.bookingData.selectedSeats || [];

    // Simulate consistent sold seats for realism
    const soldLower = [1, 2, 4, 9];
    const soldUpper = [2, 5, 8];

    this.seats = [];

    lowerNames.forEach((name, index) => {
      const isSelected = selected.includes(name);
      let status: 'sold' | 'available' | 'selected' = 'available';
      if (isSelected) {
        status = 'selected';
      } else {
        if (this.backendSeats && this.backendSeats.length > 0) {
          const match = this.backendSeats.find(s => s.SoGhe === name);
          if (match && (match.TrangThaiGhe === 'DaBan' || match.TrangThaiGhe === 'GiuCho')) {
            status = 'sold';
          }
        } else if (soldLower.includes(index)) {
          status = 'sold';
        }
      }
      this.seats.push({
        name,
        deck: 'lower',
        side: index % 2 === 0 ? 'left' : 'right',
        status,
        price: basePrice
      });
    });

    upperNames.forEach((name, index) => {
      const isSelected = selected.includes(name);
      let status: 'sold' | 'available' | 'selected' = 'available';
      if (isSelected) {
        status = 'selected';
      } else {
        if (this.backendSeats && this.backendSeats.length > 0) {
          const match = this.backendSeats.find(s => s.SoGhe === name);
          if (match && (match.TrangThaiGhe === 'DaBan' || match.TrangThaiGhe === 'GiuCho')) {
            status = 'sold';
          }
        } else if (soldUpper.includes(index)) {
          status = 'sold';
        }
      }
      this.seats.push({
        name,
        deck: 'upper',
        side: index % 2 === 0 ? 'left' : 'right',
        status,
        price: basePrice
      });
    });

    // Sync guest count choices
    selected.forEach((seat: string) => {
      this.selectedRoomGuests[seat] = this.bookingData.selectedRoomGuests[seat] || 1;
    });
  }

  toggleSeat(seat: Seat) {
    if (seat.status === 'sold') return;

    if (seat.status === 'selected') {
      seat.status = 'available';
      this.bookingData.selectedSeats = this.bookingData.selectedSeats.filter((s: string) => s !== seat.name);
      delete this.selectedRoomGuests[seat.name];
    } else {
      seat.status = 'selected';
      this.bookingData.selectedSeats.push(seat.name);
      this.selectedRoomGuests[seat.name] = 1; // Default to single
    }

    this.recalculatePrice();
  }

  recalculatePrice() {
    const basePrice = this.bookingData.price;
    const selected = this.seats.filter(s => s.status === 'selected');

    this.bookingData.selectedSeats = selected.map(s => s.name);

    let total = 0;
    selected.forEach(s => {
      const guests = this.selectedRoomGuests[s.name] || 1;
      const seatPrice = Number(guests) === 2 ? (basePrice + 200000) : basePrice;
      total += seatPrice;
    });

    this.bookingData.totalPrice = total;
  }

  // Selected date from booking context
  selectedDate: string = '22/05/2026';

  formatPrice(price: number): string {
    return (price || 0).toLocaleString('vi-VN') + 'đ';
  }

  encodeUri(val: string): string {
    return encodeURIComponent(val || '');
  }

  getSelectedDate(): string {
    return this.selectedDate;
  }

  getDropoffDate(): string {
    const parts = this.selectedDate.split('/');
    if (parts.length !== 3) return this.selectedDate;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    date.setDate(date.getDate() + 1);
    
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    
    return `${dd}/${mm}/${yyyy}`;
  }

  getDayOfWeek(): string {
    // Parse date from dd/mm/yyyy format
    const parts = this.selectedDate.split('/');
    if (parts.length !== 3) return '';
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return dayNames[date.getDay()];
  }

  getPickupArrivalTime(timeStr?: string): string {
    const timeToUse = this.bookingData.departureTime || '18:00';
    const timeParts = timeToUse.split(':');
    if (timeParts.length !== 2) return timeToUse;
    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);
    minutes -= 15;
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    if (hours < 0) {
      hours += 24;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Combobox Search Logic
  get filteredPickups() {
    const search = this.removeAccents(this.pickupSearch).toLowerCase().trim();
    if (!search) return this.pickupOptions;

    return this.pickupOptions.filter(opt =>
      this.removeAccents(opt.name).toLowerCase().includes(search) ||
      this.removeAccents(opt.address).toLowerCase().includes(search)
    );
  }

  get filteredDropoffs() {
    const search = this.removeAccents(this.dropoffSearch).toLowerCase().trim();
    if (!search) return this.dropoffOptions;

    return this.dropoffOptions.filter(opt =>
      this.removeAccents(opt.name).toLowerCase().includes(search) ||
      this.removeAccents(opt.address).toLowerCase().includes(search)
    );
  }

  selectPickup(option: any) {
    this.selectedPickup = option;
    this.bookingData.pickup = option;
    this.bookingData.suggestedPresenceTime = option.time || this.getPickupArrivalTime(option.time);
    this.pickupSearch = option.name;
    this.showPickupDropdown = false;
  }

  selectDropoff(option: any) {
    this.selectedDropoff = option;
    this.bookingData.dropoff = option;
    this.dropoffSearch = option.name;
    this.showDropoffDropdown = false;
  }

  onPickupFocus() {
    this.showPickupDropdown = true;
    if (this.selectedPickup && this.pickupSearch === this.selectedPickup.name) {
      this.pickupSearch = '';
    }
  }

  onPickupBlur() {
    setTimeout(() => {
      this.showPickupDropdown = false;
      if (this.selectedPickup) {
        this.pickupSearch = this.selectedPickup.name;
      }
    }, 250);
  }

  onDropoffFocus() {
    this.showDropoffDropdown = true;
    if (this.selectedDropoff && this.dropoffSearch === this.selectedDropoff.name) {
      this.dropoffSearch = '';
    }
  }

  onDropoffBlur() {
    setTimeout(() => {
      this.showDropoffDropdown = false;
      if (this.selectedDropoff) {
        this.dropoffSearch = this.selectedDropoff.name;
      }
    }, 250);
  }

  cancelBooking() {
    this.router.navigate(['/tim-kiem-chuyen'], {
      queryParams: {
        diemDi: this.bookingData.searchDeparture || this.bookingData.startStation || null,
        diemDen: this.bookingData.searchDestination || this.bookingData.endStation || null,
        ngayDi: this.bookingData.searchDate || this.bookingData.selectedDate || null,
        adults: this.bookingData.adults || null,
        children: this.bookingData.children || null,
        infants: this.bookingData.infants || null,
        isRoundTrip: this.bookingData.isRoundTrip || null,
        ngayVe: this.bookingData.ngayVe || null,
        passengers: this.bookingData.passengers || null
      }
    });
  }

  payBooking() {
    if (this.bookingData.selectedSeats.length === 0) {
      this.toastService.show('Vui lòng chọn ít nhất 1 ghế.', 'warning');
      return;
    }
    if (!this.customerName.trim()) {
      this.toastService.show('Vui lòng nhập Họ và tên.', 'warning');
      return;
    }
    if (!this.customerPhone.trim()) {
      this.toastService.show('Vui lòng nhập Số điện thoại.', 'warning');
      return;
    }
    if (!this.agreeTerms) {
      this.toastService.show('Quý khách vui lòng đồng ý với điều khoản đặt vé.', 'warning');
      return;
    }
    if (!this.selectedPickup) {
      this.toastService.show('Vui lòng chọn Điểm đón.', 'warning');
      return;
    }
    if (!this.selectedDropoff) {
      this.toastService.show('Vui lòng chọn Điểm trả.', 'warning');
      return;
    }

    let maKhachHang = 'KH001';
    if (typeof localStorage !== 'undefined') {
      const custInfoStr = localStorage.getItem('customer_info');
      if (custInfoStr) {
        const custInfo = JSON.parse(custInfoStr);
        if (custInfo && custInfo.MaKhachHang) {
          maKhachHang = custInfo.MaKhachHang;
        }
      }
    }

    const selectedMaGheChuyens = this.bookingData.selectedSeats.map((seatName: string) => {
      const match = this.backendSeats.find(s => s.SoGhe === seatName);
      return match ? match.MaGheChuyen : `${this.bookingData.tripId}_GHE_${seatName}`;
    });

    const finalData = {
      ...this.bookingData,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerEmail: this.customerEmail,
      pickup: this.selectedPickup,
      dropoff: this.selectedDropoff,
      MaKhachHang: maKhachHang,
      MaLichTrinh: String(this.bookingData.tripId || 1),
      DanhSachMaGheChuyen: selectedMaGheChuyens,
      HoTenNguoiDi: this.customerName,
      SdtNguoiDi: this.customerPhone,
      EmailNguoiDi: this.customerEmail,
      MaDiemDon: this.selectedPickup?.maDiem || 'MD04',
      MaDiemTra: this.selectedDropoff?.maDiem || 'MT03',
      totalPrice: this.bookingData.totalPrice
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('final_booking', JSON.stringify(finalData));
    }
    this.router.navigate(['/thanh-toan']);
  }
 
  restoreVietnameseAccents(text: string): string {
    if (!text) return '';
    const trimmed = text.trim();
    const mapping: { [key: string]: string } = {
      'ben xe thuong ly': 'Bến xe Thượng Lý',
      'ben xe bai chay': 'Bến xe Bãi Cháy',
      'ben xe my dinh': 'Bến xe Mỹ Đình',
      'nha tho da sapa': 'Nhà thờ đá SaPa',
      '52 ha ly, hong bang': '52 Hạ Lý, Hồng Bàng',
      'duong ha long, bai chay': 'Đường Hạ Long, Bãi Cháy',
      '20 pham hung, nam tu liem': '20 Phạm Hùng, Nam Từ Liêm',
      'trung tam sapa': 'Trung tâm SaPa'
    };
    const key = trimmed.toLowerCase();
    return mapping[key] || text;
  }

  removeAccents(str: string): string {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }
}
