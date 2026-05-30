import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthModalService } from '../auth/auth-modal.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { TimKiemApiService } from '../../../core/services/tim-kiem-api.service';
import { HomeApiService } from '../../../core/services/home-api.service';
import { LunarCalendarService } from '../../../core/services/lunar-calendar.service';

interface Seat {
  name: string;
  status: 'sold' | 'available' | 'selected';
  deck: 'lower' | 'upper';
  side: 'left' | 'right';
  price: number;
}

interface Trip {
  id: any;
  routeCode?: string;
  departureTime: string;
  suggestedPresenceTime?: string;
  arrivalTime: string;
  duration: string;
  distance: string;
  timezone: string;
  type: 'Limousine';
  availableSeats: number;
  startStation: string;
  endStation: string;
  price: number;
  seats: Seat[];
  expanded?: boolean;
  selectedTab?: 'seat' | 'schedule' | 'shuttle' | 'utilities' | 'policy';
  diemDungLichTrinh?: any[];
}

@Component({
  selector: 'app-tim-kiem-chuyen-xe',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tim-kiem-chuyen-xe.html',
  styleUrl: './tim-kiem-chuyen-xe.css',
})
export class TimKiemChuyenXe implements OnInit {
  isSearchPerformed: boolean = false;
  // Form search inputs
  isRoundTrip: boolean = false;
  departure: string = '';
  destination: string = '';
  departureDate: string = '';
  returnDate: string = '';
  passengerCount: number = 1;

  // Passenger categories
  adultCount: number = 1;
  childCount: number = 0;
  infantCount: number = 0;

  // Calendar & Passenger popover toggles
  showDepartureCalendar: boolean = false;
  showReturnCalendar: boolean = false;
  showPassengerPopover: boolean = false;

  showDepartureDropdown: boolean = false;
  showDestinationDropdown: boolean = false;
  departureSearch: string = '';
  destinationSearch: string = '';
  isLoggedIn: boolean = false;

  sharedSeats1: Seat[] = [];
  sharedSeats2: Seat[] = [];
  sharedSeats3: Seat[] = [];
  sharedSeats4: Seat[] = [];
  sharedSeats5: Seat[] = [];
  sharedSeats6: Seat[] = [];

  locations = ['TP. Hồ Chí Minh', 'Bình Định', 'Phú Yên'];

  // Recent searches list
  recentSearches: any[] = [];

  // Sorting state
  sortBy: 'price' | 'time' | 'seats' = 'time';

  // Filtering states
  timeFilters = {
    early: false,     // 00:00 - 06:00
    morning: false,   // 06:00 - 12:00
    afternoon: false, // 12:00 - 18:00
    evening: false    // 18:00 - 24:00
  };

  floorFilters = {
    upper: false,
    lower: false
  };

  rowFilters = {
    front: false, // Rows 1-2
    middle: false, // Rows 3-4
    back: false // Rows 5-6
  };

  priceFilters = {
    under500: false,
    above500: false
  };

  // Base list of mock trips
  allTrips: Trip[] = [];
  filteredTrips: Trip[] = [];

  // Currently active selected trip
  activeTrip: Trip | null = null;
  selectedSeatsList: string[] = [];
  totalPrice: number = 0;

  // Tracks guest count choice (1 or 2 guests) per selected room
  selectedRoomGuests: { [roomName: string]: number } = {};

  calendarTitle: string = '';
  calendarEmptySpaces: number[] = [];
  calendarDays: any[] = [];

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private authModalService: AuthModalService,
    private authService: AuthService,
    private toastService: ToastService,
    private timKiemApiService: TimKiemApiService,
    private homeApiService: HomeApiService,
    private lunarCalendarService: LunarCalendarService,
    private cdr: ChangeDetectorRef
  ) {
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      this.cdr.markForCheck();
    });
  }

  isPastDate(dateStr: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const parts = dateStr.split('/');
    const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    
    return date < today;
  }

  parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }

  selectDepartureDate(dateStr: string) {
    if (this.isPastDate(dateStr)) {
      this.toastService.show('Không thể chọn ngày trong quá khứ', 'error');
      return;
    }
    
    this.departureDate = dateStr;
    
    // Check if return date is now before departure date
    if (this.isRoundTrip && this.returnDate) {
      const depDate = this.parseDate(this.departureDate);
      const retDate = this.parseDate(this.returnDate);
      
      if (depDate && retDate && retDate < depDate) {
        this.returnDate = ''; // Clear invalid return date
        this.toastService.show('Ngày về phải sau ngày đi. Vui lòng chọn lại ngày về.', 'warning');
      }
    }
    
    this.showDepartureCalendar = false;
  }

  selectReturnDate(dateStr: string) {
    if (this.isPastDate(dateStr)) {
      this.toastService.show('Không thể chọn ngày trong quá khứ', 'error');
      return;
    }

    const depDate = this.parseDate(this.departureDate);
    const retDate = this.parseDate(dateStr);

    if (depDate && retDate && retDate < depDate) {
      this.toastService.show('Ngày về phải sau ngày đi', 'error');
      return;
    }

    this.returnDate = dateStr;
    this.showReturnCalendar = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Close departure calendar if click is outside
    const clickedInsideDeparture = target.closest('.departure-calendar-container');
    if (!clickedInsideDeparture) {
      this.showDepartureCalendar = false;
    }
    
    // Close return calendar if click is outside
    const clickedInsideReturn = target.closest('.return-calendar-container');
    if (!clickedInsideReturn) {
      this.showReturnCalendar = false;
    }
  }

  ngOnInit() {
    this.generateCalendarDays();
    this.loadActiveRoutes();
    this.loadRecentSearches();
    
    this.route.queryParams.subscribe(params => {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const todayStr = `${dd}/${mm}/${yyyy}`;

      this.departure = params['diemDi'] || '';
      this.destination = params['diemDen'] || '';
      this.departureDate = params['ngayDi'] || todayStr;
      this.returnDate = params['ngayVe'] || '';
      this.isRoundTrip = params['isRoundTrip'] === 'true';
      this.adultCount = Number(params['adults']) || 1;
      this.childCount = Number(params['children']) || 0;
      this.infantCount = Number(params['infants']) || 0;
      this.updatePassengerCount();
      
      this.departureSearch = this.departure;
      this.destinationSearch = this.destination;
      
      // If the route contains any search-related query params, consider this a performed search
      if (params && Object.keys(params).length > 0 && (params['diemDi'] || params['diemDen'] || params['ngayDi'])) {
        this.isSearchPerformed = true;
        // Ensure we fetch results whenever search params are present (handles navigation from Home)
        this.fetchTripsFromBackend();
      } else {
        this.isSearchPerformed = false;
        this.allTrips = [];
        this.filteredTrips = [];
      }
      this.cdr.markForCheck();
    });
  }

  generateCalendarDays() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    this.calendarTitle = `THÁNG ${month + 1}/${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const emptySpacesCount = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    this.calendarEmptySpaces = Array(emptySpacesCount).fill(0);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const d = String(i).padStart(2, '0');
      const m = String(month + 1).padStart(2, '0');
      const dateStr = `${d}/${m}/${year}`;

      const lunar = this.lunarCalendarService.getLunarDate(i, month + 1, year);
      const label = lunar.day === 1 ? `1/${lunar.month}` : `${lunar.day}`;

      const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();

      days.push({
        day: i,
        label: label,
        dateStr: dateStr,
        highlighted: isToday
      });
    }

    this.calendarDays = days;
  }

  loadActiveRoutes(): void {
    this.homeApiService.getActiveRoutes().subscribe({
      next: (response: any) => {
        if (response && response.success && Array.isArray(response.data)) {
          const locSet = new Set<string>();
          response.data.forEach((route: any) => {
            if (route.DiemKhoiHanh) locSet.add(route.DiemKhoiHanh.trim());
            if (route.DiemDen) locSet.add(route.DiemDen.trim());
          });
          if (locSet.size > 0) {
            this.locations = Array.from(locSet);
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load active routes', err);
      }
    });
  }

  loadRecentSearches(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined' || !window.localStorage) return;
    const stored = window.localStorage.getItem('recentSearches');
    if (stored) {
      try {
        this.recentSearches = JSON.parse(stored);
      } catch (e) {
        this.recentSearches = [];
      }
    } else {
      this.recentSearches = [];
    }
  }

  saveSearchToRecent(from: string, to: string, date: string): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined' || !window.localStorage) return;
    if (!from || !to || !date) return;

    const search = { from, to, date };
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(s => !(s.from === from && s.to === to && s.date === date));
    // Add to top
    this.recentSearches.unshift(search);
    // Keep only last 5
    if (this.recentSearches.length > 5) {
      this.recentSearches = this.recentSearches.slice(0, 5);
    }
    // Save to localStorage
    window.localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  formatTimeStr(d: any): string {
    if (!d) return '00:00';
    const dateObj = new Date(d);
    return `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  }

  getPresenceTime(time: any): string {
    if (!time) return '00:00';
    const dateObj = new Date(time);
    if (isNaN(dateObj.getTime())) return String(time).slice(0, 5);
    dateObj.setMinutes(dateObj.getMinutes() - 30);
    return `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  }

  loadTripDetails(trip: any) {
    if (trip.diemDungLichTrinh && trip.diemDungLichTrinh.length > 0) {
      return;
    }
    this.timKiemApiService.getTripDetail(trip.id).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          if (Array.isArray(response.data.diemDungLichTrinh)) {
            trip.diemDungLichTrinh = response.data.diemDungLichTrinh.map((stop: any) => ({
              ...stop,
              TenDiem: this.restoreVietnameseAccents(stop.TenDiem),
              DiaChi: this.restoreVietnameseAccents(stop.DiaChi || stop.GhiChu || '')
            }));
          } else {
            trip.diemDungLichTrinh = [];
          }
          if (Array.isArray(response.data.gheChuyenXe) && response.data.gheChuyenXe.length > 0) {
            const mapped = response.data.gheChuyenXe.map((s: any) => ({
              name: s.SoGhe,
              deck: s.TangGhe === 2 ? 'upper' : 'lower',
              side: s.DayGhe === 'A' ? 'left' : 'right',
              price: Number(s.GiaVe),
              status: s.TrangThaiGhe === 'DaBan' ? 'sold' : (s.TrangThaiGhe === 'GiuCho' ? 'sold' : 'available'),
            }));
            mapped.sort((a: any, b: any) => {
              if (a.deck !== b.deck) {
                return a.deck === 'lower' ? -1 : 1;
              }
              const numA = parseInt(a.name.replace(/[^0-9]/g, ''), 10);
              const numB = parseInt(b.name.replace(/[^0-9]/g, ''), 10);
              return numA - numB;
            });
            trip.seats = mapped;
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load trip details', err);
        this.cdr.detectChanges();
      }
    });
  }

  private mapSearchSeat(s: any, fallbackPrice: number): Seat {
    const seatName = s.soGhe || s.SoGhe || '';
    const deckNum = s.tangGhe ?? s.TangGhe ?? 1;
    const rowNum = parseInt(seatName.replace(/[^0-9]/g, ''), 10) || 0;
    const statusRaw = s.trangThaiGhe || s.TrangThaiGhe || 'Trong';
    const dayGhe = s.dayGhe || s.DayGhe || '';

    return {
      name: seatName,
      deck: deckNum === 2 ? 'upper' : 'lower',
      side: dayGhe === 'A' || seatName.endsWith('A') ? 'left' : 'right',
      price: Number(s.giaVe ?? s.GiaVe ?? fallbackPrice),
      status:
        statusRaw === 'DaBan' || statusRaw === 'GiuCho' ? 'sold' : 'available',
    };
  }

  private mapBackendTrip(item: any): Trip {
    const basePrice = Number(item.giaVeCoBan ?? item.GiaVeCoBan ?? item.GiaVe ?? 0);
    const rawSeats = item.seats || item.gheChuyenXe || [];
    let seats: Seat[] = [];

    if (Array.isArray(rawSeats) && rawSeats.length > 0) {
      seats = rawSeats.map((s: any) => this.mapSearchSeat(s, basePrice));
      seats.sort((a, b) => {
        if (a.deck !== b.deck) {
          return a.deck === 'lower' ? -1 : 1;
        }
        const numA = parseInt(a.name.replace(/[^0-9]/g, ''), 10);
        const numB = parseInt(b.name.replace(/[^0-9]/g, ''), 10);
        return numA - numB;
      });
    } else {
      seats = this.generateLimousineRooms(basePrice);
    }

    const gioKhoiHanh = item.gioKhoiHanh ?? item.GioKhoiHanh;
    const gioDenDuKien = item.gioDenDuKien ?? item.GioDenDuKien;
    const gioGoiYCoMat = item.gioGoiYCoMat ?? item.GioGoiYCoMat;
    const depTime = gioKhoiHanh ? new Date(gioKhoiHanh) : null;
    const arrTime = gioDenDuKien ? new Date(gioDenDuKien) : null;

    let durationStr = '11:00 h';
    if (depTime && arrTime && !isNaN(depTime.getTime()) && !isNaN(arrTime.getTime())) {
      const diffMs = arrTime.getTime() - depTime.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      durationStr = `${diffHours}:${String(diffMins).padStart(2, '0')} h`;
    }

    const availableFromApi = item.soGheTrong ?? item.availableSeats;
    const availableSeats =
      availableFromApi !== undefined && availableFromApi !== null
        ? Number(availableFromApi)
        : seats.filter((s) => s.status === 'available').length;

    return {
      id: item.maLichTrinh ?? item.MaLichTrinh,
      routeCode: item.tuyenXe?.MaTuyenXe || item.MaTuyenXe || '',
      departureTime: this.formatTimeStr(gioKhoiHanh),
      suggestedPresenceTime: gioGoiYCoMat
        ? this.formatTimeStr(gioGoiYCoMat)
        : this.getPresenceTime(gioKhoiHanh),
      arrivalTime: this.formatTimeStr(gioDenDuKien),
      duration: durationStr,
      distance: item.tuyenXe?.KhoangCach
        ? `${item.tuyenXe.KhoangCach}Km`
        : item.KhoangCach
          ? `${item.KhoangCach}Km`
          : 'Không rõ',
      timezone: item.tuyenXe?.MienGio || 'Asia/Ho_Chi_Minh',
      type: 'Limousine',
      availableSeats,
      startStation: item.diemKhoiHanh ?? item.tuyenXe?.DiemKhoiHanh ?? item.DiemKhoiHanh ?? 'Nơi đi',
      endStation: item.diemDen ?? item.tuyenXe?.DiemDen ?? item.DiemDen ?? 'Nơi đến',
      price: basePrice,
      seats,
      expanded: false,
      selectedTab: 'seat',
    };
  }

  fetchTripsFromBackend(): void {
    this.timKiemApiService.searchTrips(this.departure, this.destination, this.departureDate).subscribe({
      next: (response: any) => {
        console.log('[searchTrips] API response:', response);
        const tripData = Array.isArray(response?.data) ? response.data : [];
        console.log('[searchTrips] response.data.length:', tripData.length);

        if (response?.success && tripData.length > 0) {
          this.allTrips = tripData.map((item: any) => this.mapBackendTrip(item));
          this.filterTrips();
          console.log('[searchTrips] allTrips.length:', this.allTrips.length);
          console.log('[searchTrips] filteredTrips.length (render):', this.filteredTrips.length);
        } else {
          this.allTrips = [];
          this.filteredTrips = [];
          console.log('[searchTrips] filteredTrips.length (render):', this.filteredTrips.length);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to search trips', err);
        this.allTrips = [];
        this.filteredTrips = [];
        this.cdr.detectChanges();
      }
    });
  }

  

  removeAccents(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
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

  get departureOptions() {
    return this.locations.filter(loc => loc !== this.destination);
  }

  openLoginModal() {
    this.authModalService.openLoginModal();
  }

  get destinationOptions() {
    return this.locations.filter(loc => loc !== this.departure);
  }

  get filteredDepartures() {
    const search = (this.departureSearch || '').toLowerCase().trim();
    const opts = this.locations.filter(loc => loc !== this.destination);
    if (!search) return opts;
    return opts.filter(loc => loc.toLowerCase().includes(search));
  }

  get filteredDestinations() {
    const search = (this.destinationSearch || '').toLowerCase().trim();
    const opts = this.locations.filter(loc => loc !== this.departure);
    if (!search) return opts;
    return opts.filter(loc => loc.toLowerCase().includes(search));
  }

  selectDeparture(loc: string) {
    this.departure = loc;
    this.departureSearch = loc;
    this.showDepartureDropdown = false;
  }

  selectDestination(loc: string) {
    this.destination = loc;
    this.destinationSearch = loc;
    this.showDestinationDropdown = false;
  }

  onDepartureFocus() {
    this.showDepartureDropdown = true;
    if (this.departure) {
      this.departureSearch = '';
    }
  }

  onDepartureBlur() {
    setTimeout(() => {
      this.showDepartureDropdown = false;
      this.departureSearch = this.departure;
    }, 250);
  }

  onDestinationFocus() {
    this.showDestinationDropdown = true;
    if (this.destination) {
      this.destinationSearch = '';
    }
  }

  onDestinationBlur() {
    setTimeout(() => {
      this.showDestinationDropdown = false;
      this.destinationSearch = this.destination;
    }, 250);
  }

  // Generate standard 22 limousine rooms with A (lower) & B (upper) seat coordinates
  private generateLimousineRooms(basePrice: number): Seat[] {
    const rooms: Seat[] = [];
    
    // Lower Deck rooms (Tầng dưới): Room 1A to 12A
    const lowerNames = ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A'];
    lowerNames.forEach((name, index) => {
      let status: 'sold' | 'available' = 'available';
      // Mark a fixed number of seats as sold to ensure some are always available
      if ([2, 3, 5, 10].includes(index + 1)) { // Example: seats 2A, 3A, 5A, 10A are sold
        status = 'sold';
      }

      rooms.push({
        name: name,
        deck: 'lower',
        side: (index % 2 === 0) ? 'left' : 'right',
        price: basePrice,
        status: status
      });
    });

    // Upper Deck rooms (Tầng trên): Room 1B to 10B
    const upperNames = ['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B'];
    upperNames.forEach((name, index) => {
      let status: 'sold' | 'available' = 'available';
      // Mark a fixed number of seats as sold to ensure some are always available
      if ([2, 5, 8].includes(index + 1)) { // Example: seats 2B, 5B, 8B are sold
        status = 'sold';
      }

      rooms.push({
        name: name,
        deck: 'upper',
        side: (index % 2 === 0) ? 'left' : 'right',
        price: basePrice,
        status: status
      });
    });

    return rooms;
  }

  // Initialize trips data (Evening departures starting from 18:00)
  initMockTrips() {
    if (this.sharedSeats1.length === 0) {
      this.sharedSeats1 = this.generateLimousineRooms(400000);
      this.sharedSeats2 = this.generateLimousineRooms(400000);
      this.sharedSeats3 = this.generateLimousineRooms(400000);
      this.sharedSeats4 = this.generateLimousineRooms(400000);
      this.sharedSeats5 = this.generateLimousineRooms(400000);
      this.sharedSeats6 = this.generateLimousineRooms(400000);
    }

    this.allTrips = [
      // === TPHCM -> BÌNH ĐỊNH ===
      {
        id: 1,
        departureTime: '18:00',
        arrivalTime: '05:00',
        duration: '11:00 h',
        distance: '550Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 0,
        startStation: 'Bến xe Miền Đông',
        endStation: 'Bến xe Quy Nhơn (Bình Định)',
        price: 400000,
        seats: this.sharedSeats1,
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 2,
        departureTime: '18:30',
        arrivalTime: '06:30',
        duration: '12:00 h',
        distance: '580Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 0,
        startStation: 'Bến xe Miền Tây',
        endStation: 'Bến xe Quy Nhơn (Bình Định)',
        price: 400000,
        seats: this.sharedSeats2,
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 3,
        departureTime: '19:00',
        arrivalTime: '07:00',
        duration: '12:00 h',
        distance: '570Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 0,
        startStation: 'Bến xe Bến Cát',
        endStation: 'Bến xe Quy Nhơn (Bình Định)',
        price: 400000,
        seats: this.sharedSeats3,
        expanded: false,
        selectedTab: 'seat'
      },

      // === BÌNH ĐỊNH -> TPHCM ===
      {
        id: 4,
        departureTime: '18:00',
        arrivalTime: '05:00',
        duration: '11:00 h',
        distance: '550Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 0,
        startStation: 'Bến xe Quy Nhơn (Bình Định)',
        endStation: 'Bến xe Miền Đông',
        price: 400000,
        seats: this.sharedSeats4,
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 5,
        departureTime: '18:30',
        arrivalTime: '06:30',
        duration: '12:00 h',
        distance: '580Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 0,
        startStation: 'Bến xe Quy Nhơn (Bình Định)',
        endStation: 'Bến xe Miền Tây',
        price: 400000,
        seats: this.sharedSeats5,
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 6,
        departureTime: '19:00',
        arrivalTime: '07:00',
        duration: '12:00 h',
        distance: '570Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 0,
        startStation: 'Bến xe Quy Nhơn (Bình Định)',
        endStation: 'Bến xe Bến Cát',
        price: 400000,
        seats: this.sharedSeats6,
        expanded: false,
        selectedTab: 'seat'
      },

      // === TPHCM -> PHÚ YÊN ===
      {
        id: 7,
        departureTime: '18:00',
        arrivalTime: '03:00',
        duration: '9:00 h',
        distance: '450Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 0,
        startStation: 'Bến xe Miền Đông',
        endStation: 'Tuy Hòa (Phú Yên)',
        price: 350000,
        seats: this.sharedSeats1,
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 8,
        departureTime: '18:30',
        arrivalTime: '04:30',
        duration: '10:00 h',
        distance: '480Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 0,
        startStation: 'Bến xe Miền Tây',
        endStation: 'Tuy Hòa (Phú Yên)',
        price: 350000,
        seats: this.sharedSeats2,
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 9,
        departureTime: '19:00',
        arrivalTime: '05:00',
        duration: '10:00 h',
        distance: '470Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 0,
        startStation: 'Bến xe Bến Cát',
        endStation: 'Tuy Hòa (Phú Yên)',
        price: 350000,
        seats: this.sharedSeats3,
        expanded: false,
        selectedTab: 'seat'
      },

      // === PHÚ YÊN -> TPHCM ===
      {
        id: 10,
        departureTime: '20:00',
        arrivalTime: '05:00',
        duration: '9:00 h',
        distance: '450Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 0,
        startStation: 'Tuy Hòa (Phú Yên)',
        endStation: 'Bến xe Miền Đông',
        price: 350000,
        seats: this.sharedSeats4,
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 11,
        departureTime: '20:30',
        arrivalTime: '06:30',
        duration: '10:00 h',
        distance: '480Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 0,
        startStation: 'Tuy Hòa (Phú Yên)',
        endStation: 'Bến xe Miền Tây',
        price: 350000,
        seats: this.sharedSeats5,
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 12,
        departureTime: '21:00',
        arrivalTime: '07:00',
        duration: '10:00 h',
        distance: '470Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 0,
        startStation: 'Tuy Hòa (Phú Yên)',
        endStation: 'Bến xe Bến Cát',
        price: 350000,
        seats: this.sharedSeats6,
        expanded: false,
        selectedTab: 'seat'
      }
    ];

    // Compute active available seats count dynamically
    this.allTrips.forEach(t => {
      t.availableSeats = t.seats.filter(s => s.status === 'available').length;
    });
  }

  // Handle Search button
  searchTrip() {
    this.departure = this.departureSearch ? this.departureSearch.trim() : '';
    this.destination = this.destinationSearch ? this.destinationSearch.trim() : '';

    this.showPassengerPopover = false;

    if (!this.departure || !this.destination || !this.departureDate) {
      this.toastService.show('Vui lòng nhập đủ Điểm đi, Điểm đến và Ngày đi trước khi tìm kiếm.', 'warning');
      return;
    }

    this.isSearchPerformed = true;
    
    // Save to recent searches
    this.saveSearchToRecent(this.departure, this.destination, this.departureDate);
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        diemDi: this.departure,
        diemDen: this.destination,
        ngayDi: this.departureDate,
        ngayVe: this.returnDate || null,
        isRoundTrip: this.isRoundTrip || null,
        passengers: this.passengerCount || null,
        adults: this.adultCount || null,
        children: this.childCount || null,
        infants: this.infantCount || null
      },
      queryParamsHandling: 'merge'
    });
  }

  // Apply Sidebar filters and sorts
  filterTrips() {
    this.allTrips.forEach((t) => {
      if (!(typeof t.id === 'string' && t.id.startsWith('LT'))) {
        t.availableSeats = t.seats.filter((s) => s.status === 'available').length;
      }
    });

    let result = [...this.allTrips];

    const isBackendTripList =
      result.length > 0 &&
      result.every((trip) => typeof trip.id === 'string' && trip.id.startsWith('LT'));

    // Backend đã lọc tuyến/ngày — chỉ lọc lại trên mock data
    if (this.departure && this.destination && !isBackendTripList) {
      const cleanSearchDeparture = this.removeAccents(this.departure).toLowerCase();
      const cleanSearchDestination = this.removeAccents(this.destination).toLowerCase();

      result = result.filter((trip) => {
        const cleanTripStart = this.removeAccents(trip.startStation).toLowerCase();
        const cleanTripEnd = this.removeAccents(trip.endStation).toLowerCase();

        const fromMatch =
          cleanTripStart.includes(cleanSearchDeparture) ||
          (cleanSearchDeparture.includes('ho chi minh') &&
            (cleanTripStart.includes('mien dong') ||
              cleanTripStart.includes('mien tay') ||
              cleanTripStart.includes('ben cat')));

        const toMatch =
          cleanTripEnd.includes(cleanSearchDestination) ||
          (cleanSearchDestination.includes('ho chi minh') &&
            (cleanTripEnd.includes('mien dong') ||
              cleanTripEnd.includes('mien tay') ||
              cleanTripEnd.includes('ben cat')));

        return fromMatch && toMatch;
      });
    }

    // 1. Filter by Time
    const hasTimeFilter = this.timeFilters.early || this.timeFilters.morning || this.timeFilters.afternoon || this.timeFilters.evening;
    if (hasTimeFilter) {
      result = result.filter(trip => {
        const hour = parseInt(trip.departureTime.split(':')[0], 10);
        if (this.timeFilters.early && hour >= 0 && hour < 6) return true;
        if (this.timeFilters.morning && hour >= 6 && hour < 12) return true;
        if (this.timeFilters.afternoon && hour >= 12 && hour < 18) return true;
        if (this.timeFilters.evening && hour >= 18 && hour < 24) return true;
        return false;
      });
    }

    // 2. Filter by Floor
    const hasFloorFilter = this.floorFilters.upper || this.floorFilters.lower;
    if (hasFloorFilter) {
      result = result.filter(trip => {
        return true;
      });
    }

    // 3. Filter by Row Location
    const hasRowFilter = this.rowFilters.front || this.rowFilters.middle || this.rowFilters.back;
    if (hasRowFilter) {
      result = result.filter(trip => {
        return trip.seats.some(seat => {
          if (seat.status !== 'available') return false;
          const num = parseInt(seat.name.replace(/[^0-9]/g, ''), 10);
          if (this.rowFilters.front && ((num >= 1 && num <= 4))) return true;
          if (this.rowFilters.middle && ((num >= 5 && num <= 8))) return true;
          if (this.rowFilters.back && ((num >= 9 && num <= 12))) return true;
          return false;
        });
      });
    }

    // 4. Filter by Price
    const hasPriceFilter = this.priceFilters.under500 || this.priceFilters.above500;
    if (hasPriceFilter) {
      result = result.filter(trip => {
        if (this.priceFilters.under500 && trip.price < 500000) return true;
        if (this.priceFilters.above500 && trip.price >= 500000) return true;
        return false;
      });
    }

    this.filteredTrips = result;
  }

  // Clear all filters
  clearFilters() {
    this.timeFilters = { early: false, morning: false, afternoon: false, evening: false };
    this.floorFilters = { upper: false, lower: false };
    this.rowFilters = { front: false, middle: false, back: false };
    this.priceFilters = { under500: false, above500: false };
    this.filterTrips();
  }

  // Select a recent search
  selectRecentSearch(search: any) {
    this.departure = search.from;
    this.destination = search.to;
    this.departureSearch = search.from;
    this.destinationSearch = search.to;
    this.departureDate = search.date;
  }

  // Swap locations
  swapLocations() {
    const temp = this.departure;
    this.departure = this.destination;
    this.destination = temp;
  }

  toggleDepartureCalendar() {
    this.showDepartureCalendar = !this.showDepartureCalendar;
    this.showReturnCalendar = false;
    this.showPassengerPopover = false;
  }

  toggleReturnCalendar() {
    this.showReturnCalendar = !this.showReturnCalendar;
    this.showDepartureCalendar = false;
    this.showPassengerPopover = false;
  }

  togglePassengerPopover() {
    this.showPassengerPopover = !this.showPassengerPopover;
    this.showDepartureCalendar = false;
    this.showReturnCalendar = false;
  }



  // Passenger increment/decrement
  incrementAdults() {
    if (this.adultCount < 5) {
      this.adultCount++;
      this.updatePassengerCount();
    }
  }

  decrementAdults() {
    if (this.adultCount > 1) {
      this.adultCount--;
      this.updatePassengerCount();
    }
  }

  incrementChildren() {
    if (this.childCount < 5) {
      this.childCount++;
      this.updatePassengerCount();
    }
  }

  decrementChildren() {
    if (this.childCount > 0) {
      this.childCount--;
      this.updatePassengerCount();
    }
  }

  incrementInfants() {
    if (this.infantCount < 5) {
      this.infantCount++;
      this.updatePassengerCount();
    }
  }

  decrementInfants() {
    if (this.infantCount > 0) {
      this.infantCount--;
      this.updatePassengerCount();
    }
  }

  updatePassengerCount() {
    this.passengerCount = this.adultCount + this.childCount + this.infantCount;
  }

  // Toggle card details
  toggleTripDetails(trip: Trip) {
    if (trip.expanded) {
      trip.expanded = false;
    } else {
      this.allTrips.forEach(t => t.expanded = false);
      trip.expanded = true;
      trip.selectedTab = 'seat';
      this.loadTripDetails(trip);
    }
    this.activeTrip = trip;
    this.updateSelectedSeats(trip);
  }

  // Switch tab in card details directly
  switchTab(trip: Trip, tab: 'seat' | 'schedule' | 'shuttle' | 'utilities' | 'policy') {
    trip.expanded = true;
    trip.selectedTab = tab;
    if (tab === 'schedule') {
      this.loadTripDetails(trip);
    }
    this.activeTrip = trip;
    this.updateSelectedSeats(trip);
  }

  // Select/Deselect seat
  toggleSeat(trip: Trip, seat: Seat) {
    if (seat.status === 'sold') return;

    if (seat.status === 'selected') {
      seat.status = 'available';
      delete this.selectedRoomGuests[seat.name];
    } else if (seat.status === 'available') {
      seat.status = 'selected';
      this.selectedRoomGuests[seat.name] = 1;
    }

    this.updateSelectedSeats(trip);

    // Sync available seats for all trips
    this.allTrips.forEach(t => {
      t.availableSeats = t.seats.filter(s => s.status === 'available').length;
    });
  }

  updateSelectedSeats(trip: Trip) {
    const selected = trip.seats.filter(s => s.status === 'selected');
    this.selectedSeatsList = selected.map(s => s.name);
    this.recalculatePrice();
  }

  recalculatePrice() {
    if (!this.activeTrip) return;
    const baseRoomPrice = this.activeTrip.price;
    const selected = this.activeTrip.seats.filter(s => s.status === 'selected');
    this.totalPrice = selected.reduce((sum, s) => {
      const guests = this.selectedRoomGuests[s.name] || 1;
      const roomPrice = Number(guests) === 2 ? (baseRoomPrice + 200000) : baseRoomPrice;
      return sum + roomPrice;
    }, 0);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + 'đ';
  }

  confirmSelection(trip: Trip) {
    if (this.selectedSeatsList.length === 0) {
      this.toastService.show('Vui lòng chọn ít nhất 1 ghế.', 'warning');
      return;
    }
    this.selectTripAndNavigate(trip, true);
  }

  selectTripAndNavigate(trip: Trip, withSeats: boolean) {
    const bookingData = {
      tripId: trip.id,
      routeCode: trip.routeCode,
      selectedDate: this.departureDate,
      departureTime: trip.departureTime,
      suggestedPresenceTime: trip.suggestedPresenceTime,
      gioGoiYCoMat: trip.suggestedPresenceTime,
      arrivalTime: trip.arrivalTime,
      duration: trip.duration,
      distance: trip.distance,
      startStation: trip.startStation,
      endStation: trip.endStation,
      price: trip.price,
      selectedSeats: withSeats ? this.selectedSeatsList : [],
      selectedRoomGuests: withSeats ? this.selectedRoomGuests : {},
      totalPrice: withSeats ? this.totalPrice : 0,
      searchDeparture: this.departure,
      searchDestination: this.destination,
      searchDate: this.departureDate,
      adults: this.adultCount,
      children: this.childCount,
      infants: this.infantCount,
      isRoundTrip: this.isRoundTrip,
      ngayVe: this.returnDate,
      passengers: this.passengerCount
    };
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('current_booking', JSON.stringify(bookingData));
    }
    this.router.navigate(['/thong-tin-don-hang']);
  }


}
