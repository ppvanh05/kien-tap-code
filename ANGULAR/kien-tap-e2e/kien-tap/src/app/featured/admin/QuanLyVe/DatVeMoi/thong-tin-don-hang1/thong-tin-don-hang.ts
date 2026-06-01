import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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
  // Alert modal
  showAlertModal: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'info';

  bookingData: any = {
    tripId: 1,
    departureTime: '18:00',
    suggestedPresenceTime: '17:30',
    arrivalTime: '05:00',
    duration: '11 giờ',
    distance: '550km',
    startStation: 'Bến xe Miền Tây',
    endStation: 'Bến xe Quy Nhơn',
    price: 400000,
    selectedSeats: [],
    selectedRoomGuests: {},
    totalPrice: 0
  };

  seats: Seat[] = [];
  selectedRoomGuests: { [seatName: string]: number } = {};

  // Customer Form Fields
  customerName: string = '';
  customerPhone: string = '';
  customerEmail: string = '';
  agreeTerms: boolean = false;
  
  // Validation errors realtime
  validationErrors: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
  } = {};

  // Pickup/Dropoff dropdown states
  pickupSearch: string = '';
  dropoffSearch: string = '';
  showPickupDropdown: boolean = false;
  showDropoffDropdown: boolean = false;

  selectedPickup: any = null;
  selectedDropoff: any = null;

  pickupOptions: any[] = [
    { time: '18:15', name: 'Bến xe Miền Đông Cũ', address: '292 Đinh Bộ Lĩnh, P.26, Q.Bình Thạnh, TP HCM' },
    { time: '18:15', name: '43 Nguyễn Cư Trinh', address: '43 Đ. Nguyễn Cư Trinh, Phường Nguyễn Cư Trinh, Quận 1, Thành phố Hồ Chí Minh, Vietnam' },
    { time: '18:15', name: '202 Lê Hồng Phong', address: '202 Lê Hồng Phong - P.4 - Q.5 - TP. Hồ Chí Minh' },
    { time: '18:30', name: 'Bến xe Miền Tây', address: '395 Kinh Dương Vương, P.An Lạc, Q.Bình Tân, TP.HCM' }
  ];

  dropoffOptions: any[] = [
    { time: '05:00', name: 'Bến xe Quy Nhơn', address: '71 Tây Sơn, Phường Ghềnh Ráng, Quy Nhơn, Bình Định' },
    { time: '05:20', name: 'Văn phòng Quy Nhơn', address: '333 Chương Dương, Phường Nguyễn Văn Cừ, Quy Nhơn, Bình Định' },
    { time: '05:50', name: 'Điểm trả Phù Cát', address: 'Ngã tư huyện Phù Cát, Phù Cát, Bình Định' },
    { time: '05:00', name: 'Bến xe Vũng Tàu', address: '192 Nam Kỳ Khởi Nghĩa, P.Thắng Tam, TP.Vũng Tàu' }
  ];

  constructor(private router: Router) { }

  private formatStopTime(value: any): string {
    if (!value) return this.bookingData?.departureTime || '';
    if (typeof value === 'string') {
      const iso = value.match(/T(\d{2}:\d{2})/);
      if (iso) return iso[1];
      const plain = value.match(/^(\d{2}:\d{2})/);
      if (plain) return plain[1];
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return this.bookingData?.departureTime || '';
    return parsed.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  private mapTripStop(stop: any) {
    return {
      maDiem: stop.MaDiem,
      time: this.formatStopTime(stop.GioDenDuKien),
      name: stop.TenDiem || stop.name || '',
      address: stop.DiaChi || stop.address || '',
      city: stop.ThanhPho || '',
      province: stop.Tinh || '',
    };
  }

  private syncStopOptionsFromTrip() {
    const stops = Array.isArray(this.bookingData?.stops)
      ? this.bookingData.stops.map((stop: any) => this.mapTripStop(stop)).filter((stop: any) => stop.maDiem && stop.name)
      : [];
    if (stops.length === 0) return;

    this.pickupOptions = stops;
    this.dropoffOptions = stops;
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('current_booking');
      if (saved) {
        this.bookingData = JSON.parse(saved);
      }

      // Extract selected date from booking data if available
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

    this.syncStopOptionsFromTrip();

    // Set default pickup and dropoff based on saved data
    this.selectedPickup = this.pickupOptions.find(opt => opt.name.toLowerCase().includes((this.bookingData?.startStation || '').toLowerCase())) || this.pickupOptions[0];
    this.pickupSearch = this.selectedPickup.name;

    this.selectedDropoff = this.dropoffOptions.find(opt => opt.name.toLowerCase().includes((this.bookingData?.endStation || '').toLowerCase())) || this.dropoffOptions[this.dropoffOptions.length - 1] || this.dropoffOptions[0];
    this.dropoffSearch = this.selectedDropoff.name;

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
      } else if (soldLower.includes(index)) {
        status = 'sold';
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
      } else if (soldUpper.includes(index)) {
        status = 'sold';
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

  getSelectedDate(): string {
    return this.selectedDate;
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

  showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertModal = true;
  }

  closeAlert() {
    this.showAlertModal = false;
    this.alertMessage = '';
  }

  // ===== VALIDATION REALTIME =====
  validateCustomerName() {
    if (!this.customerName.trim()) {
      this.validationErrors.customerName = 'Vui lòng nhập Họ và tên';
    } else if (this.customerName.trim().length < 2) {
      this.validationErrors.customerName = 'Họ và tên phải có ít nhất 2 ký tự';
    } else {
      delete this.validationErrors.customerName;
    }
  }

  validateCustomerPhone() {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b$/;
    if (!this.customerPhone.trim()) {
      this.validationErrors.customerPhone = 'Vui lòng nhập Số điện thoại';
    } else if (!phoneRegex.test(this.customerPhone.trim())) {
      this.validationErrors.customerPhone = 'Số điện thoại không hợp lệ (phải bắt đầu bằng 03, 05, 07, 08, 09 và có 10 số)';
    } else {
      delete this.validationErrors.customerPhone;
    }
  }

  validateCustomerEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.customerEmail.trim() && !emailRegex.test(this.customerEmail.trim())) {
      this.validationErrors.customerEmail = 'Email không hợp lệ';
    } else {
      delete this.validationErrors.customerEmail;
    }
  }

  getPickupArrivalTime(): string {
    // Departure time minus 15 minutes
    const timeParts = this.bookingData.departureTime.split(':');
    if (timeParts.length !== 2) return this.bookingData.departureTime;
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

    const matched = this.pickupOptions.filter(opt =>
      this.removeAccents(opt.name).toLowerCase().includes(search) ||
      this.removeAccents(opt.address).toLowerCase().includes(search)
    );

    if (matched.length > 0) return matched;

    // Heuristic nearest stop propose
    let suggested = this.pickupOptions[2]; // Default: 202 Lê Hồng Phong
    if (search.includes('go vap') || search.includes('quang trung') || search.includes('12')) {
      suggested = this.pickupOptions[0]; // Bến xe Miền Đông
    } else if (search.includes('binh tan') || search.includes('an lac') || search.includes('mien tay')) {
      suggested = this.pickupOptions[3]; // Bến xe Miền Tây
    }

    return [
      {
        ...suggested,
        isSuggestion: true,
        suggestionLabel: `Gợi ý điểm gần nhất cho "${this.pickupSearch}":`
      }
    ];
  }

  get filteredDropoffs() {
    const search = this.removeAccents(this.dropoffSearch).toLowerCase().trim();
    if (!search) return this.dropoffOptions;

    const matched = this.dropoffOptions.filter(opt =>
      this.removeAccents(opt.name).toLowerCase().includes(search) ||
      this.removeAccents(opt.address).toLowerCase().includes(search)
    );

    if (matched.length > 0) return matched;

    // Propose nearest dropoff
    let suggested = this.dropoffOptions[0]; // Default: Bến xe Quy Nhơn
    if (search.includes('vung tau') || search.includes('thang tam')) {
      suggested = this.dropoffOptions[3]; // Bến xe Vũng Tàu
    } else if (search.includes('phu cat') || search.includes('cat')) {
      suggested = this.dropoffOptions[2]; // Phù Cát
    }

    return [
      {
        ...suggested,
        isSuggestion: true,
        suggestionLabel: `Gợi ý điểm gần nhất cho "${this.dropoffSearch}":`
      }
    ];
  }

  selectPickup(option: any) {
    this.selectedPickup = option;
    this.pickupSearch = option.name;
    this.showPickupDropdown = false;
  }

  selectDropoff(option: any) {
    this.selectedDropoff = option;
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
    this.router.navigate(['/admin/quan-ly-ve/dat-ve-moi'], {
      queryParams: {
        departure: this.bookingData.searchDeparture || this.bookingData.startStation || null,
        destination: this.bookingData.searchDestination || this.bookingData.endStation || null,
        date: this.bookingData.searchDate || this.bookingData.selectedDate || null,
        adults: this.bookingData.adults || null,
        children: this.bookingData.children || null,
        infants: this.bookingData.infants || null,
        isRoundTrip: this.bookingData.isRoundTrip || null,
        returnDate: this.bookingData.ngayVe || null,
        passengers: this.bookingData.passengers || null
      }
    });
  }

  payBooking() {
    if (this.bookingData.selectedSeats.length === 0) {
      this.showAlert('Vui lòng chọn ít nhất 1 ghế.', 'warning');
      return;
    }
    if (!this.customerName.trim()) {
      this.showAlert('Vui lòng nhập Họ và tên.', 'warning');
      return;
    }
    if (!this.customerPhone.trim()) {
      this.showAlert('Vui lòng nhập Số điện thoại.', 'warning');
      return;
    }
    if (!this.agreeTerms) {
      this.showAlert('Quý khách vui lòng đồng ý với điều khoản đặt vé.', 'warning');
      return;
    }
    if (!this.selectedPickup) {
      this.showAlert('Vui lòng chọn Điểm đón.', 'warning');
      return;
    }
    if (!this.selectedDropoff) {
      this.showAlert('Vui lòng chọn Điểm trả.', 'warning');
      return;
    }

    // Save final details for the payment screen
    const finalData = {
      ...this.bookingData,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerEmail: this.customerEmail,
      pickup: this.selectedPickup,
      dropoff: this.selectedDropoff
    };
    localStorage.setItem('final_booking', JSON.stringify(finalData));
    this.router.navigate(['/admin/quan-ly-ve/dat-ve-moi/thanh-toan']);
  }

  removeAccents(str: string): string {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }
}
