import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap, timeout } from 'rxjs/operators';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { environment } from '../../../../../../environments/environment';


interface Seat {
  name: string;
  maGheChuyen?: string;
  status: 'sold' | 'available' | 'selected';
  deck: 'lower' | 'upper';
  side: 'left' | 'right';
  price: number;
}

interface Trip {
  id: string | number;
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
  stops?: any[];
  expanded?: boolean;
  selectedTab?: 'seat' | 'schedule' | 'shuttle' | 'utilities' | 'policy';
}

@Component({
  selector: 'app-tim-kiem-chuyen-xe',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tim-kiem-chuyen-xe.html',
  styleUrl: './tim-kiem-chuyen-xe.css',
})
export class TimKiemChuyenXe implements OnInit {
  private readonly apiBaseUrl = environment.apiBase;

  // Alert modal
  showAlertModal: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'info';

  // Form search inputs
  isRoundTrip: boolean = false;
  departure: string = 'Hà Nội';
  destination: string = 'Quảng Ninh';
  departureDate: string = '30/05/2026';
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

  locations = ['Hà Nội', 'Quảng Ninh', 'Hải Phòng', 'Thái Bình', 'SaPa', 'TP. Hồ Chí Minh', 'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Đà Lạt', 'Đà Nẵng'];

  // Recent searches list
  recentSearches = [
    { from: 'Hà Nội', to: 'Quảng Ninh', date: '30/05/2026' },
    { from: 'Hải Phòng', to: 'Quảng Ninh', date: '26/05/2026' }
  ];

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
  isLoadingTrips = false;
  tripLoadError = '';


  // Currently active selected trip
  activeTrip: Trip | null = null;
  selectedSeatsList: string[] = [];
  totalPrice: number = 0;

  // Tracks guest count choice (1 or 2 guests) per selected room
  selectedRoomGuests: { [roomName: string]: number } = {};

  calendarDays = [
    { day: 1, label: '15/3', dateStr: '01/05/2026' },
    { day: 2, label: '16', dateStr: '02/05/2026' },
    { day: 3, label: '17', dateStr: '03/05/2026' },
    { day: 4, label: '18', dateStr: '04/05/2026' },
    { day: 5, label: '19', dateStr: '05/05/2026' },
    { day: 6, label: '20', dateStr: '06/05/2026' },
    { day: 7, label: '21', dateStr: '07/05/2026' },
    { day: 8, label: '22', dateStr: '08/05/2026' },
    { day: 9, label: '23', dateStr: '09/05/2026' },
    { day: 10, label: '24', dateStr: '10/05/2026' },
    { day: 11, label: '25', dateStr: '11/05/2026' },
    { day: 12, label: '26', dateStr: '12/05/2026' },
    { day: 13, label: '27', dateStr: '13/05/2026' },
    { day: 14, label: '28', dateStr: '14/05/2026' },
    { day: 15, label: '29', dateStr: '15/05/2026' },
    { day: 16, label: '30', dateStr: '16/05/2026' },
    { day: 17, label: '1/4', dateStr: '17/05/2026' },
    { day: 18, label: '2', dateStr: '18/05/2026' },
    { day: 19, label: '3', dateStr: '19/05/2026' },
    { day: 20, label: '4', dateStr: '20/05/2026' },
    { day: 21, label: '5', dateStr: '21/05/2026' },
    { day: 22, label: '6', dateStr: '22/05/2026', highlighted: true },
    { day: 23, label: '7', dateStr: '23/05/2026' },
    { day: 24, label: '8', dateStr: '24/05/2026' },
    { day: 25, label: '9', dateStr: '25/05/2026' },
    { day: 26, label: '10', dateStr: '26/05/2026' },
    { day: 27, label: '11', dateStr: '27/05/2026' },
    { day: 28, label: '12', dateStr: '28/05/2026' },
    { day: 29, label: '13', dateStr: '29/05/2026' },
    { day: 30, label: '14', dateStr: '30/05/2026' },
    { day: 31, label: '15', dateStr: '31/05/2026' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.departure = params['departure'] || this.departure;
      this.destination = params['destination'] || this.destination;
      this.departureDate = params['date'] || this.departureDate;
      this.returnDate = params['returnDate'] || '';
      this.isRoundTrip = params['isRoundTrip'] === 'true';
      this.adultCount = Number(params['adults']) || 1;
      this.childCount = Number(params['children']) || 0;
      this.infantCount = Number(params['infants']) || 0;
      this.updatePassengerCount();
      this.loadTripsFromApi();
    });
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.setupRealtimeSubscriptions();
      } catch (error) {
        console.error('Lỗi khởi tạo Supabase Realtime:', error);
      }
    }
  }




  getEarlyArrivalTime(trip: Trip): number {
    if (trip.stops && trip.stops.length > 0) {
      const firstStopWithArrival = trip.stops.find(s => s.ThoiGianCoMatTruoc != null);
      if (firstStopWithArrival) {
        return firstStopWithArrival.ThoiGianCoMatTruoc;
      }
    }
    return 30; // Default fallback if not found
  }

  get departureOptions() {
    return this.locations.filter(loc => loc !== this.destination);
  }

  get destinationOptions() {
    return this.locations.filter(loc => loc !== this.departure);
  }

  // Generate standard 22 limousine rooms with A (lower) & B (upper) seat coordinates
  private generateLimousineRooms(basePrice: number): Seat[] {
    const rooms: Seat[] = [];
    
    // Lower Deck rooms (Tầng dưới): Room 1A to 12A
    const lowerNames = ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A'];
    lowerNames.forEach((name, index) => {
      let status: 'sold' | 'available' = 'available';
      const num = index + 1;
      if (num === 2 || num === 3 || num === 5 || num === 10) {
        status = 'sold';
      } else {
        status = Math.random() > 0.4 ? 'sold' : 'available';
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
      const num = index + 1;
      if (num === 2 || num === 5 || num === 8) {
        status = 'sold';
      } else {
        status = Math.random() > 0.4 ? 'sold' : 'available';
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
    this.allTrips = [
      // TP. Hồ Chí Minh → Bình Định
      {
        id: 1,
        departureTime: '18:00',
        arrivalTime: '05:00',
        duration: '11:00 h',
        distance: '550Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 12,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Bình Định',
        price: 400000,
        seats: this.generateLimousineRooms(400000),
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
        availableSeats: 15,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Bình Định',
        price: 400000,
        seats: this.generateLimousineRooms(400000),
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 3,
        departureTime: '19:00',
        arrivalTime: '06:00',
        duration: '11:00 h',
        distance: '550Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 9,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Bình Định',
        price: 520000,
        seats: this.generateLimousineRooms(520000),
        expanded: false,
        selectedTab: 'seat'
      },
      // TP. Hồ Chí Minh → Phú Yên
      {
        id: 4,
        departureTime: '06:00',
        arrivalTime: '17:00',
        duration: '11:00 h',
        distance: '450Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 8,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Phú Yên',
        price: 350000,
        seats: this.generateLimousineRooms(350000),
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 5,
        departureTime: '19:30',
        arrivalTime: '07:30',
        duration: '12:00 h',
        distance: '570Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 10,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Phú Yên',
        price: 400000,
        seats: this.generateLimousineRooms(400000),
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 6,
        departureTime: '20:00',
        arrivalTime: '07:30',
        duration: '11:30 h',
        distance: '540Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 11,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Phú Yên',
        price: 520000,
        seats: this.generateLimousineRooms(520000),
        expanded: false,
        selectedTab: 'seat'
      },
      // TP. Hồ Chí Minh → Khánh Hòa
      {
        id: 7,
        departureTime: '07:00',
        arrivalTime: '15:00',
        duration: '8:00 h',
        distance: '400Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 5,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Khánh Hòa',
        price: 300000,
        seats: this.generateLimousineRooms(300000),
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 8,
        departureTime: '13:00',
        arrivalTime: '21:00',
        duration: '8:00 h',
        distance: '400Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 18,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Khánh Hòa',
        price: 320000,
        seats: this.generateLimousineRooms(320000),
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 9,
        departureTime: '21:00',
        arrivalTime: '05:00',
        duration: '8:00 h',
        distance: '400Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 20,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Khánh Hòa',
        price: 350000,
        seats: this.generateLimousineRooms(350000),
        expanded: false,
        selectedTab: 'seat'
      },
      // TP. Hồ Chí Minh → Đà Lạt
      {
        id: 10,
        departureTime: '05:00',
        arrivalTime: '12:00',
        duration: '7:00 h',
        distance: '300Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 3,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Đà Lạt',
        price: 280000,
        seats: this.generateLimousineRooms(280000),
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 11,
        departureTime: '08:00',
        arrivalTime: '15:00',
        duration: '7:00 h',
        distance: '300Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 12,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Đà Lạt',
        price: 300000,
        seats: this.generateLimousineRooms(300000),
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 12,
        departureTime: '14:00',
        arrivalTime: '21:00',
        duration: '7:00 h',
        distance: '300Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 16,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Đà Lạt',
        price: 320000,
        seats: this.generateLimousineRooms(320000),
        expanded: false,
        selectedTab: 'seat'
      },
      // TP. Hồ Chí Minh → Hà Nội
      {
        id: 13,
        departureTime: '17:00',
        arrivalTime: '12:00',
        duration: '19:00 h',
        distance: '1700Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 10,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Hà Nội',
        price: 800000,
        seats: this.generateLimousineRooms(800000),
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 14,
        departureTime: '18:00',
        arrivalTime: '13:00',
        duration: '19:00 h',
        distance: '1700Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 8,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Hà Nội',
        price: 850000,
        seats: this.generateLimousineRooms(850000),
        expanded: false,
        selectedTab: 'seat'
      },
      // TP. Hồ Chí Minh → Đà Nẵng
      {
        id: 15,
        departureTime: '09:00',
        arrivalTime: '20:00',
        duration: '11:00 h',
        distance: '800Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 6,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Đà Nẵng',
        price: 550000,
        seats: this.generateLimousineRooms(550000),
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 16,
        departureTime: '19:00',
        arrivalTime: '06:00',
        duration: '11:00 h',
        distance: '800Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 14,
        startStation: 'TP. Hồ Chí Minh',
        endStation: 'Đà Nẵng',
        price: 600000,
        seats: this.generateLimousineRooms(600000),
        expanded: false,
        selectedTab: 'seat'
      },
      // Đảo chiều: Bình Định → TP. Hồ Chí Minh
      {
        id: 17,
        departureTime: '18:00',
        arrivalTime: '05:00',
        duration: '11:00 h',
        distance: '550Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 10,
        startStation: 'Bình Định',
        endStation: 'TP. Hồ Chí Minh',
        price: 400000,
        seats: this.generateLimousineRooms(400000),
        expanded: false,
        selectedTab: 'seat'
      },
      // Đảo chiều: Phú Yên → TP. Hồ Chí Minh
      {
        id: 18,
        departureTime: '19:00',
        arrivalTime: '06:30',
        duration: '11:30 h',
        distance: '540Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 15,
        startStation: 'Phú Yên',
        endStation: 'TP. Hồ Chí Minh',
        price: 400000,
        seats: this.generateLimousineRooms(400000),
        expanded: false,
        selectedTab: 'seat'
      }
    ];

    // Compute suggested presence time dynamically (30 minutes before departure)
    this.allTrips.forEach(trip => {
      const parts = trip.departureTime.split(':');
      if (parts.length === 2) {
        let hrs = parseInt(parts[0], 10);
        let mins = parseInt(parts[1], 10);
        mins -= 30;
        if (mins < 0) {
          mins += 60;
          hrs -= 1;
        }
        if (hrs < 0) {
          hrs += 24;
        }
        trip.suggestedPresenceTime = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      } else {
        trip.suggestedPresenceTime = trip.departureTime;
      }
    });
  }

  private buildSearchParams(): Record<string, string> {
    const params: Record<string, string> = {};
    if (this.departure?.trim()) params['departure'] = this.departure.trim();
    if (this.destination?.trim()) params['destination'] = this.destination.trim();
    if (this.departureDate?.trim()) params['date'] = this.departureDate.trim();
    return params;
  }

  isPastDate(dateStr: string): boolean {
    if (!dateStr) return false;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const targetDate = new Date(year, month, day);
    targetDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return targetDate.getTime() < today.getTime();
  }

  loadTripsFromApi() {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoadingTrips = false;
      return;
    }

    this.isLoadingTrips = true;
    this.tripLoadError = '';
    this.allTrips = [];
    this.filteredTrips = [];

    this.http.get<any[]>(`${this.apiBaseUrl}/customer/tim-kiem-chuyen-xe/search`, {
      params: this.buildSearchParams(),
    }).pipe(
      timeout(15000),
      catchError(error => {
        console.error('Không tải được chuyến xe:', error);
        this.tripLoadError = 'Không tải được dữ liệu chuyến xe từ API. Vui lòng kiểm tra backend.';
        return of([]);
      }),
      finalize(() => {
        this.isLoadingTrips = false;
      }),
    ).subscribe((res: any) => {
      const tripsArray = Array.isArray(res) ? res : (res && res.data ? res.data : []);
      this.allTrips = tripsArray.map((trip: any) => this.mapApiTrip(trip));
      this.syncLocationsFromTrips(this.allTrips);
      this.activeTrip = null;
      this.selectedSeatsList = [];
      this.selectedRoomGuests = {};
      this.totalPrice = 0;
      this.filterTrips();
    });
  }

  private mapApiTrip(data: any): Trip {
    const seats = this.mapApiSeats(data.gheChuyenXe || [], this.toNumber(data.GiaVeCoBan));
    const startStation = data.tuyenXe?.DiemKhoiHanh || data.TUYEN_XE?.DiemKhoiHanh || '';
    const endStation = data.tuyenXe?.DiemDen || data.TUYEN_XE?.DiemDen || '';
    const departureTime = this.formatApiTime(data.GioKhoiHanh);
    const arrivalTime = this.formatApiTime(data.GioDenDuKien);
    const price = this.toNumber(data.GiaVeCoBan);
    const distance = this.toNumber(data.tuyenXe?.KhoangCach || data.TUYEN_XE?.KhoangCach);
    const stops = Array.isArray(data.diemDungLichTrinh) ? data.diemDungLichTrinh : [];

    return {
      id: data.MaLichTrinh,
      departureTime,
      arrivalTime,
      duration: this.calculateDuration(departureTime, arrivalTime),
      distance: distance > 0 ? `${distance}Km` : '',
      timezone: 'Asia/Ho_Chi_Minh',
      type: 'Limousine',
      availableSeats: seats.filter(seat => seat.status === 'available').length,
      startStation,
      endStation,
      price,
      seats,
      stops,
      expanded: false,
      selectedTab: 'seat',
    };
  }

  private mapApiSeats(seats: any[], fallbackPrice: number): Seat[] {
    return seats.map(seat => {
      const name = seat.SoGhe || this.extractSeatName(seat.MaGheChuyen) || seat.MaGheChuyen;
      const seatNumber = parseInt(String(name).replace(/[^0-9]/g, ''), 10);
      const deck: 'lower' | 'upper' = Number(seat.TangGhe) === 2 ? 'upper' : 'lower';
      const side: 'left' | 'right' = Number.isFinite(seatNumber) && seatNumber % 2 === 0 ? 'right' : 'left';

      return {
        name,
        maGheChuyen: seat.MaGheChuyen,
        status: this.mapSeatStatus(seat.TrangThaiGhe),
        deck,
        side,
        price: this.toNumber(seat.GiaVe) || fallbackPrice,
      };
    }).sort((a, b) => {
      if (a.deck !== b.deck) return a.deck === 'lower' ? -1 : 1;
      return this.getSeatNumber(a.name) - this.getSeatNumber(b.name);
    });
  }

  private mapSeatStatus(status?: string): 'sold' | 'available' {
    return status === 'Trong' ? 'available' : 'sold';
  }

  private extractSeatName(maGheChuyen?: string): string {
    if (!maGheChuyen) return '';
    const parts = maGheChuyen.split('_');
    return parts[parts.length - 1] || '';
  }

  private getSeatNumber(name: string): number {
    const parsed = parseInt(String(name).replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private formatApiTime(value: any): string {
    if (!value) return '--:--';
    if (typeof value === 'string') {
      const isoTime = value.match(/T(\d{2}:\d{2})/);
      if (isoTime) return isoTime[1];
      const plainTime = value.match(/^(\d{2}:\d{2})/);
      if (plainTime) return plainTime[1];
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  private calculateDuration(start: string, end: string): string {
    const startParts = start.split(':').map(Number);
    const endParts = end.split(':').map(Number);
    if (startParts.length < 2 || endParts.length < 2 || startParts.some(Number.isNaN) || endParts.some(Number.isNaN)) {
      return '';
    }

    let startMinutes = startParts[0] * 60 + startParts[1];
    let endMinutes = endParts[0] * 60 + endParts[1];
    if (endMinutes < startMinutes) endMinutes += 24 * 60;
    const diff = endMinutes - startMinutes;
    return `${Math.floor(diff / 60)}:${String(diff % 60).padStart(2, '0')} h`;
  }

  private toNumber(value: any): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private normalizeLocation(value: string): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }

  private matchLocation(value: string, keyword: string): boolean {
    if (!keyword) return true;
    return this.normalizeLocation(value).includes(this.normalizeLocation(keyword));
  }

  private syncLocationsFromTrips(trips: Trip[]) {
    const values = new Set(this.locations);
    trips.forEach(trip => {
      if (trip.startStation) values.add(trip.startStation);
      if (trip.endStation) values.add(trip.endStation);
    });
    this.locations = Array.from(values);
  }

  // Handle Search button
  searchTrip() {
    this.showPassengerPopover = false;
    this.loadTripsFromApi();
    // Add to recent searches
    const exists = this.recentSearches.some(s => s.from === this.departure && s.to === this.destination);
    if (!exists && this.departure && this.destination) {
      this.recentSearches.unshift({
        from: this.departure,
        to: this.destination,
        date: this.departureDate
      });
      if (this.recentSearches.length > 3) {
        this.recentSearches.pop();
      }
    }
  }

  // Apply Sidebar filters and sorts
  filterTrips() {
    let result = [...this.allTrips];
    
    // 0. Filter by Departure and Destination (most important!)
    result = result.filter(trip => {
      const matchDeparture = this.matchLocation(trip.startStation, this.departure);
      const matchDestination = this.matchLocation(trip.endStation, this.destination);
      return matchDeparture && matchDestination;
    });

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
          // Parse number from name (e.g. "11A" -> 11, "2B" -> 2)
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

    // Apply Sorting
    if (this.sortBy === 'price') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'time') {
      result.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    } else if (this.sortBy === 'seats') {
      result.sort((a, b) => b.availableSeats - a.availableSeats);
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
    this.departureDate = search.date;
    this.loadTripsFromApi();
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

  selectDepartureDate(dateStr: string) {
    this.departureDate = dateStr;
    this.showDepartureCalendar = false;
  }

  selectReturnDate(dateStr: string) {
    this.returnDate = dateStr;
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
    }
    this.activeTrip = trip;
    this.updateSelectedSeats(trip);
  }

  // Switch tab in card details directly
  switchTab(trip: Trip, tab: 'seat' | 'schedule' | 'shuttle' | 'utilities' | 'policy') {
    trip.expanded = true;
    trip.selectedTab = tab;
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

  showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertModal = true;
  }

  closeAlert() {
    this.showAlertModal = false;
    this.alertMessage = '';
  }

  confirmSelection(trip: Trip) {
    if (this.selectedSeatsList.length === 0) {
      this.showAlert('Vui lòng chọn ít nhất 1 ghế.', 'warning');
      return;
    }
    this.selectTripAndNavigate(trip, true);
  }

  selectTripAndNavigate(trip: Trip, withSeats: boolean) {
    const selectedSeats = withSeats ? trip.seats.filter(s => s.status === 'selected') : [];
    const selectedSeatIds = selectedSeats.map(seat => seat.maGheChuyen || seat.name);
    const bookingData = {
      tripId: trip.id,
      maLichTrinh: trip.id,
      selectedDate: this.departureDate,
      departureTime: trip.departureTime,
      suggestedPresenceTime: trip.suggestedPresenceTime,
      arrivalTime: trip.arrivalTime,
      duration: trip.duration,
      distance: trip.distance,
      startStation: trip.startStation,
      endStation: trip.endStation,
      price: trip.price,
      selectedSeats: withSeats ? this.selectedSeatsList : [],
      selectedSeatIds,
      maGheChuyenList: selectedSeatIds,
      stops: trip.stops || [],
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
    localStorage.setItem('current_booking', JSON.stringify(bookingData));
    this.router.navigate(['/admin/quan-ly-ve/dat-ve-moi/thong-tin-don-hang']);
  }

  setupRealtimeSubscriptions() {
    // Subscribe to GHE_CHUYEN_XE changes
    this.supabaseService.subscribeTableChanges('GHE_CHUYEN_XE', (payload: any) => {
      console.log('Realtime seat change payload:', payload);
      this.handleSeatStatusChange(payload);
    });

    // Subscribe to LICH_TRINH changes
    this.supabaseService.subscribeTableChanges('LICH_TRINH', (payload: any) => {
      console.log('Realtime schedule change payload:', payload);
      this.handleScheduleChange(payload);
    });
  }

  handleSeatStatusChange(payload: any) {
    const newRecord = payload.new;
    if (!newRecord) return;

    // Find the trip
    const trip = this.allTrips.find(t => String(t.id) === String(newRecord.MaLichTrinh));
    if (!trip) return;

    // Extract seat name
    let seatName = '';
    seatName = this.extractSeatName(newRecord.MaGheChuyen);

    if (!seatName) return;

    const seat = trip.seats.find(s => s.maGheChuyen === newRecord.MaGheChuyen || s.name === seatName);
    if (!seat) return;

    // Map db status to frontend status
    const dbStatus = newRecord.TrangThaiGhe;
    const newStatus: 'sold' | 'available' | 'selected' = this.mapSeatStatus(dbStatus);

    // Update if it's not the seat currently selected by this admin
    if (seat.status !== 'selected' || newStatus === 'sold') {
      seat.status = newStatus;
      this.updateSelectedSeats(trip);
      this.filterTrips();
    }
  }

  handleScheduleChange(payload: any) {
    const newRecord = payload.new;
    const oldRecord = payload.old;

    if (payload.eventType === 'DELETE' && oldRecord) {
      this.allTrips = this.allTrips.filter(t => String(t.id) !== String(oldRecord.MaLichTrinh));
    } else if (payload.eventType === 'INSERT' && newRecord) {
      // Check if already exists
      const exists = this.allTrips.some(t => String(t.id) === String(newRecord.MaLichTrinh));
      if (!exists) {
        // Create LIMOUSINE rooms for it
        const basePrice = Number(newRecord.GiaVeCoBan) || 400000;
        this.allTrips.push({
          id: newRecord.MaLichTrinh,
          departureTime: newRecord.GioKhoiHanh ? new Date(newRecord.GioKhoiHanh).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '18:00',
          arrivalTime: newRecord.GioDenDuKien ? new Date(newRecord.GioDenDuKien).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '05:00',
          duration: '11:00 h',
          distance: '550Km',
          timezone: 'Asian/Ho Chi Minh',
          type: 'Limousine',
          availableSeats: 22,
          startStation: 'TP. Hồ Chí Minh',
          endStation: 'Bình Định',
          price: basePrice,
          seats: this.generateLimousineRooms(basePrice),
          expanded: false,
          selectedTab: 'seat'
        });
      }
    } else if (payload.eventType === 'UPDATE' && newRecord) {
      const trip = this.allTrips.find(t => String(t.id) === String(newRecord.MaLichTrinh));
      if (trip) {
        trip.price = Number(newRecord.GiaVeCoBan) || trip.price;
        trip.departureTime = newRecord.GioKhoiHanh ? new Date(newRecord.GioKhoiHanh).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) : trip.departureTime;
        trip.arrivalTime = newRecord.GioDenDuKien ? new Date(newRecord.GioDenDuKien).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) : trip.arrivalTime;
      }
    }
    this.filterTrips();
  }
}
