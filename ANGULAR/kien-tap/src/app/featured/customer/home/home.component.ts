import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { ToastService } from '../../../core/services/toast.service';
import { DanhGiaService } from '../../../core/services/danh-gia.service';
import { CustomerTinTucService } from '../../../core/services/customer-tin-tuc.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
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

  // Popover toggles
  showDepartureCalendar: boolean = false;
  showReturnCalendar: boolean = false;
  showPassengerPopover: boolean = false;

  showDepartureDropdown: boolean = false;
  showDestinationDropdown: boolean = false;

  departureSearch: string = 'TP. Hồ Chí Minh';
  destinationSearch: string = 'Bình Định';

  locations = ['TP. Hồ Chí Minh', 'Bình Định', 'Phú Yên'];

  recentSearches = [
    { from: 'TP. Hồ Chí Minh', to: 'Bình Định', date: '22/05/2026' },
    { from: 'TP. Hồ Chí Minh', to: 'Phú Yên', date: '25/05/2026' }
  ];

  popularRoutes = [
    { from: 'Bình Định', to: 'Bình Dương', price: '250.000đ', image: 'benxemientay.jpg' },
    { from: 'Bình Định', to: 'TP. Hồ Chí Minh', price: '250.000đ', image: 'benxebencat.jpg' },
    { from: 'Phú Yên', to: 'TP. Hồ Chí Minh', price: '250.000đ', image: 'benxemiendong.jpg' }
  ];

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

  homeReviews: any[] = [];
  homeNews: any[] = [];

  constructor(
    private router: Router,
    private toastService: ToastService,
    private danhGiaService: DanhGiaService,
    private tinTucService: CustomerTinTucService
  ) {}

  ngOnInit() {
    this.danhGiaService.getHomeReviews().subscribe({
      next: (data) => {
        this.homeReviews = data;
        // Fetch home news after reviews
        this.tinTucService.getHomeNews().subscribe({
          next: (news) => {
            this.homeNews = news;
          },
          error: (err) => {
            console.error('Error fetching home news:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error fetching home reviews:', err);
      }
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
    this.showPassengerPopover = false;
    this.router.navigate(['/tim-kiem-chuyen'], {
      queryParams: {
        departure: this.departure,
        destination: this.destination,
        date: this.departureDate,
        returnDate: this.returnDate,
        isRoundTrip: this.isRoundTrip,
        passengers: this.passengerCount,
        adults: this.adultCount,
        children: this.childCount,
        infants: this.infantCount
      }
    });
  }

  selectPopularRoute(route: any) {
    this.departure = route.from;
    this.destination = route.to;
    this.searchTrip();
  }
}
