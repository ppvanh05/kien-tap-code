import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../core/services/toast.service';
import { HomeApiService } from '../../../core/services/home-api.service';
import { LunarCalendarService } from '../../../core/services/lunar-calendar.service';
import { CustomerTinTucService } from '../../../core/services/customer-tin-tuc.service';
import { DanhGiaService } from '../../../core/services/danh-gia.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
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

  // Popover toggles
  showDepartureCalendar: boolean = false;
  showReturnCalendar: boolean = false;
  showPassengerPopover: boolean = false;

  showDepartureDropdown: boolean = false;
  showDestinationDropdown: boolean = false;

  departureSearch: string = '';
  destinationSearch: string = '';

  locations = ['TP. Hồ Chí Minh', 'Bình Định', 'Phú Yên'];

  recentSearches: any[] = [];

  popularRoutes = [
    { from: 'Bình Định', to: 'Bình Dương', price: '250.000đ', image: 'benxemientay.jpg' },
    { from: 'Bình Định', to: 'TP. Hồ Chí Minh', price: '250.000đ', image: 'benxebencat.jpg' },
    { from: 'Phú Yên', to: 'TP. Hồ Chí Minh', price: '250.000đ', image: 'benxemiendong.jpg' }
  ];

  // placeholders used by template
  homeReviews: any[] = [];
  homeNews: any[] = [];

  isLoadingReviews: boolean = true;
  isLoadingNews: boolean = true;

  calendarTitle: string = '';
  calendarEmptySpaces: number[] = [];
  calendarDays: any[] = [];

  constructor(
    private router: Router, 
    private toastService: ToastService,
    private homeApiService: HomeApiService,
    private lunarCalendarService: LunarCalendarService,
    private newsService: CustomerTinTucService,
    private reviewService: DanhGiaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.departureDate = '';

    this.generateCalendarDays();
    this.loadActiveRoutes();
    this.loadRecentSearches();
    this.loadHomeNews();
    this.loadHomeReviews();
  }

  loadHomeReviews(): void {
    this.isLoadingReviews = true;
    this.reviewService.getHomeReviews().subscribe({
      next: (response: any) => {
        console.log('[DEBUG] Home Reviews Response:', response);
        const data = response.data || response;
        if (Array.isArray(data)) {
          this.homeReviews = data;
        }
        this.isLoadingReviews = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load home reviews', err);
        this.isLoadingReviews = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadHomeNews(): void {
    this.isLoadingNews = true;
    this.newsService.getHomeNews().subscribe({
      next: (response: any) => {
        console.log('[DEBUG] Home News Response:', response);
        if (response && response.success && Array.isArray(response.data)) {
          this.homeNews = response.data;
        } else if (Array.isArray(response)) {
          // Fallback if backend returns array directly
          this.homeNews = response;
        }
        this.isLoadingNews = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load home news', err);
        this.isLoadingNews = false;
        this.cdr.detectChanges();
      }
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
    this.recentSearches = this.recentSearches.filter(s => !(s.from === from && s.to === to && s.date === date));
    this.recentSearches.unshift(search);

    if (this.recentSearches.length > 5) {
      this.recentSearches = this.recentSearches.slice(0, 5);
    }

    window.localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
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

  get departureOptions() {
    return this.locations.filter(loc => loc !== this.destination);
  }

  get destinationOptions() {
    return this.locations.filter(loc => loc !== this.departure);
  }

  get filteredDepartures() {
    const search = this.departureSearch.toLowerCase().trim();
    const opts = this.locations.filter(loc => loc !== this.destination);
    if (!search) return opts;
    return opts.filter(loc => loc.toLowerCase().includes(search));
  }

  get filteredDestinations() {
    const search = this.destinationSearch.toLowerCase().trim();
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

  swapLocations() {
    const temp = this.departure;
    this.departure = this.destination;
    this.destination = temp;

    this.departureSearch = this.departure;
    this.destinationSearch = this.destination;
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

  // Increment / Decrement passenger counts
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

  selectRecentSearch(search: any) {
    this.departure = search.from;
    this.destination = search.to;
    this.departureDate = search.date;

    this.departureSearch = this.departure;
    this.destinationSearch = this.destination;
  }

  searchTrip() {
    this.departure = this.departureSearch ? this.departureSearch.trim() : '';
    this.destination = this.destinationSearch ? this.destinationSearch.trim() : '';

    if (!this.departure || !this.destination || !this.departureDate) {
      this.toastService.show('Vui lòng nhập đầy đủ thông tin tìm kiếm', 'warning');
      return;
    }

    this.showPassengerPopover = false;
    
    // Save to recent searches
    this.saveSearchToRecent(this.departure, this.destination, this.departureDate);
    
    this.router.navigate(['/tim-kiem-chuyen'], {
      queryParams: {
        diemDi: this.departure || null,
        diemDen: this.destination || null,
        ngayDi: this.departureDate || null,
        ngayVe: this.returnDate || null,
        isRoundTrip: this.isRoundTrip || null,
        passengers: this.passengerCount || null,
        adults: this.adultCount || null,
        children: this.childCount || null,
        infants: this.infantCount || null
      }
    });
  }

  selectPopularRoute(route: any) {
    this.departure = route.from;
    this.destination = route.to;
    this.searchTrip();
  }
}
