import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Seat {
  name: string;
  status: 'sold' | 'available' | 'selected';
  deck: 'lower' | 'upper';
  side: 'left' | 'right';
  price: number;
}

interface Trip {
  id: number;
  departureTime: string;
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
}

@Component({
  selector: 'app-tim-kiem-chuyen-xe',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tim-kiem-chuyen-xe.html',
  styleUrl: './tim-kiem-chuyen-xe.css',
})
export class TimKiemChuyenXe implements OnInit {
  // Form search inputs
  isRoundTrip: boolean = false;
  departure: string = 'TP. Hồ Chí Minh';
  destination: string = 'Bình Định';
  departureDate: string = '22/05/2026';
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

  locations = ['TP. Hồ Chí Minh', 'Bình Định', 'Phú Yên'];

  // Recent searches list
  recentSearches = [
    { from: 'TP. Hồ Chí Minh', to: 'Bình Định', date: '22/05/2026' },
    { from: 'TP. Hồ Chí Minh', to: 'Phú Yên', date: '25/05/2026' }
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

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.initMockTrips();
    this.route.queryParams.subscribe(params => {
      this.departure = params['departure'] || 'TP. Hồ Chí Minh';
      this.destination = params['destination'] || 'Bình Định';
      this.departureDate = params['date'] || '22/05/2026';
      this.returnDate = params['returnDate'] || '';
      this.isRoundTrip = params['isRoundTrip'] === 'true';
      this.adultCount = Number(params['adults']) || 1;
      this.childCount = Number(params['children']) || 0;
      this.infantCount = Number(params['infants']) || 0;
      this.updatePassengerCount();
      this.filterTrips();
    });
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
      {
        id: 1,
        departureTime: '18:00',
        arrivalTime: '05:00',
        duration: '11:00 h',
        distance: '550Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 12,
        startStation: 'Bến xe Miền Đông',
        endStation: 'Bến xe Quy Nhơn',
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
        startStation: 'Bến xe Miền Tây',
        endStation: 'Bến xe Quy Nhơn',
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
        startStation: 'Bến xe An Sương',
        endStation: 'Bến xe Quy Nhơn',
        price: 520000,
        seats: this.generateLimousineRooms(520000),
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 4,
        departureTime: '19:30',
        arrivalTime: '07:30',
        duration: '12:00 h',
        distance: '570Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 10,
        startStation: 'Bến xe Miền Đông',
        endStation: 'Tuy Hòa (Phú Yên)',
        price: 400000,
        seats: this.generateLimousineRooms(400000),
        expanded: false,
        selectedTab: 'seat'
      },
      {
        id: 5,
        departureTime: '20:00',
        arrivalTime: '07:30',
        duration: '11:30 h',
        distance: '540Km',
        timezone: 'Asian/Ho Chi Minh',
        type: 'Limousine',
        availableSeats: 11,
        startStation: 'Bến xe Miền Đông',
        endStation: 'Tuy Hòa (Phú Yên)',
        price: 520000,
        seats: this.generateLimousineRooms(520000),
        expanded: false,
        selectedTab: 'seat'
      }
    ];
  }

  // Handle Search button
  searchTrip() {
    this.showPassengerPopover = false;
    this.filterTrips();
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
    this.filterTrips();
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

  confirmSelection(trip: Trip) {
    if (this.selectedSeatsList.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ghế.');
      return;
    }
    this.selectTripAndNavigate(trip, true);
  }

  selectTripAndNavigate(trip: Trip, withSeats: boolean) {
    const bookingData = {
      tripId: trip.id,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      duration: trip.duration,
      distance: trip.distance,
      startStation: trip.startStation,
      endStation: trip.endStation,
      price: trip.price,
      selectedSeats: withSeats ? this.selectedSeatsList : [],
      selectedRoomGuests: withSeats ? this.selectedRoomGuests : {},
      totalPrice: withSeats ? this.totalPrice : 0
    };
    localStorage.setItem('current_booking', JSON.stringify(bookingData));
    this.router.navigate(['/admin/quan-ly-ve/dat-ve-moi/thong-tin-don-hang']);
  }
}
