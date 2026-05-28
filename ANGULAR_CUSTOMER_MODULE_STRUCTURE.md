# Angular Customer Module Structure - Complete Documentation

## Overview
The customer module (`src/app/featured/customer`) contains the customer-facing interface for a bus ticketing system. The modules handle trip search, booking, payment, and ticket management workflows.

---

## 1. TIM-KIEM-CHUYEN-XE (Search Trips)

### File Structure
```
tim-kiem-chuyen-xe/
├── tim-kiem-chuyen-xe.ts       (Component Logic)
├── tim-kiem-chuyen-xe.html     (Template)
└── tim-kiem-chuyen-xe.css      (Styling)
```

### Component: `TimKiemChuyenXe`
**Selector:** `app-tim-kiem-chuyen-xe`
**Type:** Standalone Component

### Key Data Interfaces & Types

#### Seat Interface
```typescript
interface Seat {
  name: string;
  status: 'sold' | 'available' | 'selected';
  deck: 'lower' | 'upper';
  side: 'left' | 'right';
  price: number;
}
```

#### Trip Interface
```typescript
interface Trip {
  id: any;
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
  diemDungLichTrinh?: any[];
}
```

### Core Properties

#### Search Form Data
- `isRoundTrip: boolean` - Toggle between one-way and round-trip
- `departure: string` - Starting location
- `destination: string` - Destination location
- `departureDate: string` - Departure date (dd/mm/yyyy format)
- `returnDate: string` - Return date for round trips
- `passengerCount: number` - Total passenger count (default: 1)

#### Passenger Categories
- `adultCount: number` - Number of adults
- `childCount: number` - Number of children
- `infantCount: number` - Number of infants

#### UI State Management
- `showDepartureCalendar: boolean` - Calendar visibility
- `showReturnCalendar: boolean` - Return calendar visibility
- `showPassengerPopover: boolean` - Passenger selection popover
- `showDepartureDropdown: boolean` - Departure location dropdown
- `showDestinationDropdown: boolean` - Destination location dropdown

#### Search Results & Filters
- `allTrips: Trip[]` - All search results
- `filteredTrips: Trip[]` - Filtered results
- `activeTrip: Trip | null` - Currently selected trip
- `selectedSeatsList: string[]` - Selected seat names
- `totalPrice: number` - Total booking price
- `sortBy: 'price' | 'time' | 'seats'` - Current sort method

#### Filter States
- `timeFilters` - Filter by time windows (early, morning, afternoon, evening)
- `floorFilters` - Filter by deck (upper, lower)
- `rowFilters` - Filter by row position (front, middle, back)
- `priceFilters` - Filter by price range

#### Shared Seat Arrays (for multiple room display)
- `sharedSeats1` through `sharedSeats6` - Individual seat arrays for Limousine rooms

#### Other Properties
- `locations: string[]` - Available trip locations
- `recentSearches: array` - User's recent searches
- `filteredDepartures: string[]` - Filtered departure options
- `filteredDestinations: string[]` - Filtered destination options
- `isLoggedIn: boolean` - Authentication status
- `isSearchPerformed: boolean` - Whether search has been executed

### Key Methods

#### Calendar & Date Management
```typescript
generateCalendarDays(): void
// Generates calendar for current month with lunar dates

parseDate(dateStr: string): Date | null
// Parses dd/mm/yyyy format to Date object

isPastDate(dateStr: string): boolean
// Validates if date is in the past

selectDepartureDate(dateStr: string): void
// Sets departure date with validation

selectReturnDate(dateStr: string): void
// Sets return date with validation against departure date
```

#### Location & Dropdown Logic
```typescript
selectDeparture(loc: string): void
// Sets departure location

selectDestination(loc: string): void
// Sets destination location

swapLocations(): void
// Swaps departure and destination

onDepartureFocus(): void
// Shows departure dropdown

onDepartureBlur(): void
// Hides departure dropdown with timeout

filteredDepartures: string[]
// Computed property: filters locations by departure search

filteredDestinations: string[]
// Computed property: filters locations by destination search
```

#### Passenger Management
```typescript
updatePassengerCount(): void
// Updates total passenger count from categories

openPassengerPopover(): void
// Displays passenger selection popover

closePassengerPopover(): void
// Hides passenger popover
```

#### Trip Search & Filtering
```typescript
fetchTripsFromBackend(): void
// Fetches trips from API using search criteria

loadActiveRoutes(): void
// Loads available routes from backend

loadTripDetails(trip: any): void
// Loads detailed stop information for trip

searchTrips(): void
// Main search execution with validation

applyFilters(): void
// Applies active filters to trip list

sortTrips(): void
// Sorts filtered trips by selected method (price/time/seats)
```

#### Seat Selection
```typescript
toggleSeat(seat: Seat): void
// Adds/removes seat from selection

generateLimousineRooms(price: number): Seat[]
// Creates virtual seat objects for Limousine rooms

selectSeats(seatNames: string[]): void
// Selects multiple seats at once
```

#### Trip Expansion & Details
```typescript
expandTrip(trip: Trip): void
// Expands trip details accordion

toggleSelectedTab(trip: Trip, tab: string): void
// Switches between seat/schedule/shuttle tabs
```

#### Navigation & Booking
```typescript
proceedToBooking(): void
// Validates selections and navigates to booking page

getCurrentRoute(): string
// Gets query parameters for route preservation
```

### Data Bindings (HTML Template Key Bindings)

#### Search Form
```html
[(ngModel)]="departure"           <!-- Two-way binding for departure -->
[(ngModel)]="destination"          <!-- Two-way binding for destination -->
[(ngModel)]="departureDate"        <!-- Two-way binding for departure date -->
[(ngModel)]="returnDate"           <!-- Two-way binding for return date -->
[(ngModel)]="passengerCount"       <!-- Two-way binding for passenger count -->
[(ngModel)]="adultCount"           <!-- Two-way binding for adult count -->
[(ngModel)]="childCount"           <!-- Two-way binding for child count -->
```

#### Conditional Rendering
```html
*ngIf="!isRoundTrip"              <!-- Show for one-way trips -->
*ngIf="isRoundTrip"               <!-- Show for round trips -->
*ngIf="showDepartureDropdown"     <!-- Dropdown visibility -->
*ngIf="showDestinationDropdown"   <!-- Dropdown visibility -->
*ngIf="filteredDepartures"        <!-- Location list filtering -->
```

#### Trip Results Loop
```html
*ngFor="let trip of filteredTrips" <!-- Iterate filtered trips -->
[class]="activeTrip === trip ? 'selected' : ''" <!-- Active trip styling -->
```

#### Seat Grid
```html
*ngFor="let seat of activeTrip.seats" <!-- Iterate seats -->
(click)="toggleSeat(seat)"         <!-- Seat selection click handler -->
[disabled]="seat.status === 'sold'" <!-- Disable sold seats -->
[class]="seat.status"              <!-- Dynamic status styling -->
```

---

## 2. THONG-TIN-DON-HANG (Order Information/Booking Details)

### File Structure
```
thong-tin-don-hang/
├── thong-tin-don-hang.ts         (Component Logic)
├── thong-tin-don-hang.html       (Template)
└── thong-tin-don-hang.css        (Styling)
```

### Component: `ThongTinDonHang`
**Selector:** `app-thong-tin-don-hang`
**Type:** Standalone Component

### Key Data Interfaces & Types

#### Seat Interface (same as search module)
```typescript
interface Seat {
  name: string;
  status: 'sold' | 'available' | 'selected';
  deck: 'lower' | 'upper';
  side: 'left' | 'right';
  price: number;
}
```

### Core Properties

#### Booking Data
```typescript
bookingData = {
  tripId: number;
  departureTime: string;            // e.g., "18:00"
  arrivalTime: string;              // e.g., "05:00"
  duration: string;                 // e.g., "11 giờ"
  distance: string;                 // e.g., "550km"
  startStation: string;             // Start location
  endStation: string;               // End location
  price: number;                    // Base price per seat
  selectedSeats: string[];          // Array of selected seat names
  selectedRoomGuests: {};           // Guests per room map
  totalPrice: number;               // Total booking amount
}
```

#### Customer Information
- `customerName: string` - Customer full name
- `customerPhone: string` - Customer phone number
- `customerEmail: string` - Customer email address
- `agreeTerms: boolean` - Terms agreement checkbox

#### Pickup/Dropoff Selection
- `pickupSearch: string` - Pickup location search input
- `dropoffSearch: string` - Dropoff location search input
- `showPickupDropdown: boolean` - Pickup dropdown visibility
- `showDropoffDropdown: boolean` - Dropoff dropdown visibility
- `selectedPickup: any` - Currently selected pickup
- `selectedDropoff: any` - Currently selected dropoff

#### Pickup/Dropoff Options
```typescript
pickupOptions: Array = [
  { 
    time: "18:15",
    name: "Bến xe Miền Đông Cũ",
    address: "292 Đinh Bộ Lĩnh, P.26, Q.Bình Thạnh, TP HCM" 
  },
  ...
]

dropoffOptions: Array = [
  { 
    time: "05:00",
    name: "Bến xe Quy Nhơn",
    address: "71 Tây Sơn, Phường Ghềnh Ráng, Quy Nhơn, Bình Định" 
  },
  ...
]
```

#### Seat Data
- `seats: Seat[]` - Array of available/selected seats
- `selectedRoomGuests: { [seatName: string]: number }` - Guest count per room (1 or 2)
- `backendSeats: any[]` - Seats loaded from backend

### Key Methods

#### Seat Management
```typescript
initSeats(): void
// Initializes seat array based on booking data
// Creates lower deck (1A-12A) and upper deck (1B-10B) seats
// Marks pre-selected seats with 'selected' status
// Simulates realistic sold seat distribution

toggleSeat(seat: Seat): void
// Toggles seat selection status
// Updates bookingData.selectedSeats array
// Calls recalculatePrice() to update total

recalculatePrice(): void
// Recalculates total price based on:
// - Base price per seat
// - Number of guests per room (1 = base, 2 = base + 200,000)
// - Selected seats count
```

#### Pickup/Dropoff Logic
```typescript
isCityMatch(stopCity: string, routeCity: string): boolean
// Matches pickup/dropoff stops to trip start/end cities
// Handles variations (HCM, Sài Gòn, Hồ Chí Minh, Bình Định, Quy Nhơn, etc.)

get filteredPickups(): any[]
// Computed: Filters pickup options by search text

get filteredDropoffs(): any[]
// Computed: Filters dropoff options by search text

selectPickup(option: any): void
// Sets selected pickup location

selectDropoff(option: any): void
// Sets selected dropoff location

onPickupFocus(): void
// Shows pickup dropdown

onDropoffFocus(): void
// Shows dropoff dropdown

onPickupBlur(): void
// Hides pickup dropdown (with timeout)

onDropoffBlur(): void
// Hides dropoff dropdown (with timeout)
```

#### Date & Time Formatting
```typescript
formatTimeStr(d: any): string
// Converts timestamp to HH:MM format

get suggestedPresenceTime(): string
// Returns suggested arrival time (30 minutes before departure)

getPickupArrivalTime(timeStr?: string): string
// Calculates pickup time (departure time - 30 minutes)

getDayOfWeek(): string
// Returns day name (Thứ 2, Thứ 3, etc.) from selected date

getSelectedDate(): string
// Returns formatted selected date

getDropoffDate(): string
// Returns next day's date for dropoff
```

#### Navigation
```typescript
cancelBooking(): void
// Cancels booking and navigates back

proceedToPayment(): void
// Validates booking data and moves to payment page
// Stores booking data in localStorage as 'final_booking'
```

#### Data Validation
```typescript
validateCustomerInfo(): boolean
// Validates customer name, phone, email
// Validates terms agreement

validateSeats(): boolean
// Ensures at least one seat is selected

validatePickupDropoff(): boolean
// Ensures both pickup and dropoff are selected
```

### Data Bindings (HTML Template Key Bindings)

#### Customer Form
```html
[(ngModel)]="customerName"         <!-- Customer name input -->
[(ngModel)]="customerPhone"        <!-- Customer phone input -->
[(ngModel)]="customerEmail"        <!-- Customer email input -->
[(ngModel)]="agreeTerms"           <!-- Terms checkbox -->
```

#### Pickup/Dropoff Dropdowns
```html
[(ngModel)]="pickupSearch"         <!-- Pickup search input -->
[(ngModel)]="dropoffSearch"        <!-- Dropoff search input -->
(focus)="onPickupFocus()"          <!-- Show pickup dropdown -->
(blur)="onPickupBlur()"            <!-- Hide pickup dropdown -->
*ngIf="showPickupDropdown"         <!-- Conditional dropdown display -->
*ngFor="let opt of filteredPickups" <!-- Loop pickup options -->
```

#### Seat Selection
```html
*ngFor="let seat of seats"         <!-- Iterate all seats -->
(click)="toggleSeat(seat)"         <!-- Toggle seat selection -->
[disabled]="seat.status === 'sold'" <!-- Disable sold seats -->
[class]="seat.status"              <!-- Dynamic seat styling -->
{{ seat.name }}                    <!-- Display seat number -->
```

#### Guest Count Selection
```html
*ngFor="let seat of selectedSeats" <!-- Iterate selected seats -->
[(ngModel)]="selectedRoomGuests[seat]" <!-- Guest count per room -->
[value]="1" [value]="2"            <!-- Room options -->
```

#### Price Display
```html
{{ formatPrice(bookingData.price) }} <!-- Display base price -->
{{ formatPrice(bookingData.totalPrice) }} <!-- Display total -->
```

---

## 3. THANH-TOAN (Payment)

### File Structure
```
thanh-toan/
├── thanh-toan.ts                  (Component Logic)
├── thanh-toan.html                (Template)
└── thanh-toan.css                 (Styling)
```

### Component: `ThanhToan`
**Selector:** `app-thanh-toan`
**Type:** Standalone Component
**Lifecycle:** `OnInit, OnDestroy`

### Key Properties

#### Booking Data (loaded from localStorage)
```typescript
bookingData = {
  tripId: number;
  departureTime: string;            // e.g., "18:00"
  arrivalTime: string;              // e.g., "05:00"
  duration: string;
  distance: string;
  startStation: string;
  endStation: string;
  price: number;                    // Base price per seat
  selectedSeats: string[];          // e.g., ['1A', '2A']
  totalPrice: number;               // e.g., 800000
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickup: { time, name, address };
  dropoff: { time, name, address };
}
```

#### Payment Methods
```typescript
paymentMethods = [
  { 
    id: 'vietqr',
    name: 'Thanh toán qua VietQR',
    icon: 'asset/images/customer/VietQR_Logo.png',
    badge: ''
  },
  {
    id: 'momo',
    name: 'Ví MoMo',
    icon: 'asset/images/customer/MoMo_Logo.png',
    badge: ''
  },
  {
    id: 'vnpay',
    name: 'Ví VNPay',
    icon: 'asset/images/customer/VNPay_logo.png',
    badge: ''
  },
  {
    id: 'zalopay',
    name: 'Ví ZaloPay',
    icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay.png',
    badge: 'Giảm 25% tối đa 20k cho khách lần đầu...'
  }
]
```

#### Payment State
- `selectedPayment: string` - Currently selected payment method (default: 'vietqr')

#### Timer Management
```typescript
timeLeft: number = 600              // 10 minutes in seconds
timerInterval: any = null           // Timer interval reference
formattedTimeLeft: string           // Computed: MM:SS format
```

#### Modal States
- `showCancelModal: boolean` - Cancel confirmation modal
- `showExpirationModal: boolean` - Expiration warning modal
- `expirationRedirectTime: number` - Countdown to redirect (5 seconds)
- `expirationInterval: any` - Expiration countdown interval
- `showSuccessModal: boolean` - Success confirmation modal
- `successRedirectTime: number` - Countdown to home redirect (20 seconds)
- `successInterval: any` - Success countdown interval

#### Other
- `selectedDate: string` - Selected trip date from booking context

### Key Methods

#### Timer Management
```typescript
startCountdown(): void
// Starts 10-minute countdown timer
// Decrements timeLeft every 1 second
// Triggers expiration when timeLeft reaches 0

triggerExpiration(): void
// Shows expiration modal with 5-second countdown
// Auto-redirects to search page after 5 seconds

formatCountdown(seconds: number): string
// Formats seconds to MM:SS display format

get formattedTimeLeft(): string
// Computed: Returns formatted MM:SS timer display
```

#### Payment Processing
```typescript
finishPayment(): void
// Main payment execution flow:
// 1. Maps selected payment method to string name
// 2. Creates transaction via API
// 3. Calls success callback
// 4. Shows success modal
// 5. Auto-redirects after 20 seconds

simulateSuccess(): void
// Simulates successful payment for demo
// Shows success modal
// Clears booking data from localStorage
```

#### Modal Management
```typescript
goBack(): void
// Shows cancel confirmation modal

cancelCancel(): void
// Hides cancel modal, stays on payment page

confirmCancel(): void
// Confirms cancellation
// Clears booking data
// Navigates back to search page

closeSuccessModal(): void
// Closes success modal
// Clears success countdown interval
// Navigates to home page

closeExpirationModal(): void
// Closes expiration modal
// Clears expiration countdown interval
// Navigates to search page
```

#### Data Formatting
```typescript
formatPrice(price: number): string
// Formats number to Vietnamese currency (đ)
// Example: 800000 => "800.000đ"

getSelectedDate(): string
// Returns booking date

getDayOfWeek(): string
// Returns day name from selected date

getPaymentQR(): string
// Returns QR code image URL based on payment method

getPaymentLogo(): string
// Returns payment method logo image URL
```

### Data Bindings (HTML Template Key Bindings)

#### Payment Method Selection
```html
*ngFor="let method of paymentMethods" <!-- Loop payment methods -->
(click)="selectedPayment = method.id" <!-- Select method on click -->
[class.border-primary]="selectedPayment === method.id" <!-- Highlight selected -->
{{ method.name }}                      <!-- Display method name -->
{{ method.badge }}                     <!-- Display method badge/promotion -->
```

#### Timer Display
```html
{{ formattedTimeLeft }}               <!-- Display MM:SS timer -->
```

#### Booking Summary
```html
{{ bookingData.startStation }}        <!-- Start location -->
{{ bookingData.endStation }}          <!-- End location -->
{{ bookingData.departureTime }}       <!-- Departure time -->
{{ getDayOfWeek() }}, {{ getSelectedDate() }} <!-- Date display -->
```

#### Total Price
```html
{{ formatPrice(bookingData.totalPrice) }} <!-- Display total amount -->
```

#### Payment Instructions
```html
*ngIf="getPaymentQR()"               <!-- Show QR code if available -->
[src]="getPaymentQR()"               <!-- Dynamic QR image source -->
```

#### Modal States
```html
*ngIf="showCancelModal"              <!-- Show/hide cancel modal -->
*ngIf="showExpirationModal"          <!-- Show/hide expiration modal -->
*ngIf="showSuccessModal"             <!-- Show/hide success modal -->
{{ expirationRedirectTime }}         <!-- Expiration countdown display -->
{{ successRedirectTime }}            <!-- Success countdown display -->
```

### Lifecycle Hooks

#### ngOnInit
- Checks if running in browser environment
- Loads booking data from localStorage ('final_booking')
- Extracts selected date from booking data
- Starts countdown timer

#### ngOnDestroy
- Clears all interval timers
- Prevents memory leaks

---

## 4. TRA-CUU-VE (Ticket Lookup)

### File Structure
```
tra-cuu-ve/
├── tra-cuu-ve.ts                  (Component Logic)
├── tra-cuu-ve.html                (Template)
└── tra-cuu-ve.css                 (Styling)
```

### Component: `TraCuuVeComponent`
**Selector:** `app-tim-kiem-chuyen-xe` (reuses selector name - NOTE: potential conflict)
**Type:** Standalone Component
**Lifecycle:** `OnInit`

### Key Data Interfaces & Types

#### Ticket Interface
```typescript
interface Ticket {
  maVe: string;                     // Ticket ID
  soGhe: string;                    // Seat number
  bienSoXe: string;                 // Vehicle plate number
  diemDon: string;                  // Pickup location
  diemDonThoiGian: string;          // Pickup time
  diemTra: string;                  // Dropoff location
  diemTraThoiGian: string;          // Dropoff time
  giaVe: number;                    // Ticket price
  trangThaiVe: 'Chờ thanh toán' | 'Chờ khởi hành' | 'Đã hoàn thành' | 'Đã hủy' | 'Đã đánh giá';
  maQRVe: string;                   // Ticket QR code
}
```

#### Order Interface
```typescript
interface Order {
  maDonHang: string;                // Order ID
  maKhachHang: string;              // Customer ID
  hoTenNguoiDi: string;             // Passenger name
  soDienThoai: string;              // Phone number
  email: string;                    // Email address
  thoiGianDat: string;              // Booking time
  soLuongVeDaDat: number;           // Ticket quantity
  tenTuyen: string;                 // Route name
  gioKhoiHanh: string;              // Departure time
  gioTra: string;                   // Arrival time
  departureDate: string;            // Departure date (yyyy-mm-dd)
  diemDon: string;                  // Pickup location
  diemTra: string;                  // Dropoff location
  thoiGianCoMatTruoc: string;       // Suggested arrival time before departure
  gioCanCoMat: string;              // Required presence time
  tongGiaVe: number;                // Total ticket price
  phuongThucThanhToan: string;      // Payment method
  trangThaiDonHang: 'Chờ thanh toán' | 'Chờ khởi hành' | 'Đã hoàn thành' | 'Đã hủy' | 'Đã đánh giá';
  bienSoXe: string;                 // Vehicle plate number
  maDiemDon: string;                // Pickup location ID
  maDiemTra: string;                // Dropoff location ID
  soLanDaSua: number;               // Number of times modified
  gioiHanChinhSua: number;          // Modification limit (max 2)
  tickets: Ticket[];                // Array of tickets in order
}
```

#### Location Option Interface
```typescript
interface LocationOption {
  maDiem: string;                   // Location ID
  tenDiem: string;                  // Location name
  thoiGian?: string;                // Time (optional)
  diaChi?: string;                  // Address (optional)
}
```

#### Rating Criteria Item
```typescript
interface RatingCriteriaItem {
  label: string;                    // Criterion name
  score: number;                    // Rating score (0-5)
}
```

### Core Properties

#### Search Form
- `phoneNumber: string` - Customer phone for lookup
- `bookingCode: string` - Order code/ID to lookup
- `isLoading: boolean` - Loading state
- `loading: boolean` - Alternative loading flag

#### Search Results
- `currentOrder: Order | null` - Retrieved order data
- `searchError: string` - Error message if lookup fails
- `currentStep: 'search' | 'results'` - Current UI step

#### Edit Modal
- `showEditModal: boolean` - Edit modal visibility
- `editFullName: string` - Editable full name
- `editPhone: string` - Editable phone number
- `editEmail: string` - Editable email address
- `editDiemDonSearchText: string` - Editable pickup location search
- `editDiemTraSearchText: string` - Editable dropoff location search
- `editMaDiemDon: string` - Selected pickup location ID
- `editMaDiemTra: string` - Selected dropoff location ID
- `showDiemDonDropdown: boolean` - Pickup dropdown visibility
- `showDiemTraDropdown: boolean` - Dropoff dropdown visibility

#### Cancel Modal
- `showCancelModal: boolean` - Cancel modal visibility
- `selectedCancelReason: string` - Selected cancellation reason

#### Review Modal
- `showReviewModal: boolean` - Review modal visibility
- `reviewComment: string` - Customer review text
- `reviewFiles: File[]` - Attached review files

#### Cancel Reasons List
```typescript
cancelReasons = [
  'Tôi đổi kế hoạch',
  'Khách hàng không thể tham gia',
  'Tôi gặp sự cố',
  'Lý do khác'
]
```

#### Rating Criteria
```typescript
ratingCriteria: RatingCriteriaItem[] = [
  { label: 'An toàn', score: 0 },
  { label: 'Sạch sẽ', score: 0 },
  { label: 'Thái độ Nhân viên', score: 0 },
  { label: 'Đúng giờ', score: 0 },
  { label: 'Thông tin đầy đủ', score: 0 },
  { label: 'Tiện nghi', score: 0 }
]
```

#### Quick Review Tags
```typescript
quickReviewTags = [
  'An toàn', 'Sạch sẽ', 'Đúng giờ', 'Thông tin đầy đủ', 'Tiện nghi'
]
```

#### Toast Notifications
- `toastMessage: string` - Toast message text
- `toastType: 'success' | 'error'` - Toast type

#### Location Options (Predefined)
```typescript
const LOCATION_OPTIONS: LocationOption[] = [
  { maDiem: 'MD01', tenDiem: 'Bến xe Miền Đông Cũ', ... },
  { maDiem: 'MD02', tenDiem: 'Bến xe Giáp Bát', ... },
  // ... more locations
]
```

### Key Methods

#### Search & Lookup
```typescript
searchTickets(): void
// Main lookup execution:
// 1. Validates phone and booking code
// 2. Calls API service to lookup order
// 3. On success: loads order and shows results
// 4. On error: displays error message

backToSearch(): void
// Resets to search step
// Clears modals and error messages
```

#### Data Processing
```typescript
syncTicketFieldsFromOrder(): void
// Syncs order data to form fields
// Initializes edit modal fields
// Prepares dropdown options

maskPhone(phone: string): string
// Masks phone number: "0987654321" => "098****21"

maskEmail(email: string): string
// Masks email: "user@example.com" => "us***@example.com"
```

#### Status & Validation
```typescript
get canReview(): boolean
// Checks if order can be reviewed:
// - Status must be 'Đã hoàn thành'
// - Must have tickets
// - All tickets must be completed

get isReviewSubmitDisabled(): boolean
// Disables submit if no ratings provided

isCancelDisabled(): boolean
// Disables cancel if:
// - Status is 'Đã hoàn thành', 'Đã đánh giá', or 'Đã hủy'

canEditOrder(): boolean
// Checks if edits remaining (max 2 edits)

getEditRemaining(): number
// Returns remaining edit count (0-2)

getEditLimit(): number
// Returns max edit limit (2)

getEditTimesLabel(): string
// Returns label like "1/2 lần chỉnh"
```

#### Refund Calculation
```typescript
getRefundPercentage(): number
// Calculates refund percentage based on time until departure:
// - 0-12 hours: 0%
// - 12-24 hours: 50%
// - 24+ hours: 100%

getRefundFee(): number
// Calculates actual refund amount

getRefundAmountDisplay(): string
// Returns formatted refund display
```

#### Date & Time Formatting
```typescript
formatDisplayDate(dateString: string): string
// Converts yyyy-mm-dd to dd-mm-yyyy format

buildDepartureDate(dateString: string, timeString: string): Date
// Builds Date object from date and time strings

getDayOfWeek(): string
// Returns day name from departure date

getPresenceTimeLabel(): string
// Returns formatted presence time requirement

getPickupTimeLabel(): string
// Returns formatted pickup time (departure - 30 min)
```

#### Status Display
```typescript
getStatusClasses(status: string): { [key: string]: boolean }
// Returns CSS classes for order status:
// - 'Đã hoàn thành'/'Đã đánh giá': success (green)
// - 'Đã hủy': danger (red)
// - 'Chờ thanh toán': info (blue)
// - 'Chờ khởi hành': warning (orange)

getTicketStatusClasses(status: string): { [key: string]: boolean }
// Returns CSS classes for ticket status (same as order)
```

#### Price Formatting
```typescript
formatPrice(price: number): string
// Formats to Vietnamese currency: 800000 => "800.000đ"
```

#### Order Modification
```typescript
openEditModal(): void
// Opens edit information modal
// Pre-fills with current order data

submitEdit(): void
// Validates and submits edited information
// Increments modification counter
// Updates order via API

openCancelModal(): void
// Opens cancellation confirmation modal

submitCancel(): void
// Processes cancellation with selected reason
// Calls API to cancel order
// Shows success/error toast

openReviewModal(): void
// Opens review submission modal

submitReview(): void
// Validates review data (at least 1 rating)
// Uploads files if attached
// Submits review to API
// Updates order status to 'Đã đánh giá'
```

#### Dropdown Logic
```typescript
selectEditDiemDon(location: LocationOption): void
// Sets pickup location in edit mode

selectEditDiemTra(location: LocationOption): void
// Sets dropoff location in edit mode

onEditDiemDonFocus(): void
// Shows pickup dropdown

onEditDiemTraFocus(): void
// Shows dropoff dropdown

onEditDiemDonBlur(): void
// Hides pickup dropdown with delay

onEditDiemTraBlur(): void
// Hides dropoff dropdown with delay

get filteredDiemDonOptions(): LocationOption[]
// Filters pickup locations by search text

get filteredDiemTraOptions(): LocationOption[]
// Filters dropoff locations by search text
```

#### Utilities
```typescript
printTicket(ticket: Ticket): void
// Prints individual ticket

printOrder(): void
// Prints full order details
```

### Data Bindings (HTML Template Key Bindings)

#### Search Form
```html
[(ngModel)]="phoneNumber"          <!-- Phone number input -->
[(ngModel)]="bookingCode"          <!-- Booking code input -->
(ngSubmit)="searchTickets()"       <!-- Submit search -->
```

#### Search Results Display
```html
*ngIf="currentOrder"               <!-- Show if order found -->
{{ currentOrder.hoTenNguoiDi }}    <!-- Passenger name -->
{{ maskPhone(currentOrder.soDienThoai) }} <!-- Masked phone -->
{{ maskEmail(currentOrder.email) }} <!-- Masked email -->
{{ formatPrice(currentOrder.tongGiaVe) }} <!-- Order total -->
```

#### Ticket List
```html
*ngFor="let ticket of currentOrder.tickets" <!-- Iterate tickets -->
{{ ticket.maVe }}                  <!-- Ticket ID -->
{{ ticket.soGhe }}                 <!-- Seat number -->
[class]="getTicketStatusClasses(ticket.trangThaiVe)" <!-- Status styling -->
```

#### Modal Triggers
```html
(click)="openEditModal()"          <!-- Open edit modal -->
(click)="openCancelModal()"        <!-- Open cancel modal -->
(click)="openReviewModal()"        <!-- Open review modal (if canReview) -->
```

#### Edit Modal
```html
[(ngModel)]="editFullName"         <!-- Editable name -->
[(ngModel)]="editPhone"            <!-- Editable phone -->
[(ngModel)]="editEmail"            <!-- Editable email -->
[(ngModel)]="editDiemDonSearchText" <!-- Pickup search -->
[(ngModel)]="editDiemTraSearchText" <!-- Dropoff search -->
*ngIf="showDiemDonDropdown"        <!-- Pickup dropdown -->
*ngFor="let loc of filteredDiemDonOptions" <!-- Location list -->
```

#### Cancel Modal
```html
[(ngModel)]="selectedCancelReason" <!-- Reason selection -->
[value]="reason"                   <!-- Reason option -->
```

#### Review Modal
```html
[(ngModel)]="reviewComment"        <!-- Comment input -->
*ngFor="let criteria of ratingCriteria" <!-- Iterate criteria -->
[(ngModel)]="criteria.score"       <!-- Score rating -->
[disabled]="isReviewSubmitDisabled" <!-- Disable if no ratings -->
```

#### Computed Display
```html
{{ getStatusClasses(currentOrder.trangThaiDonHang) }} <!-- Order status styling -->
{{ canReview }}                    <!-- Show review option if eligible -->
{{ canEditOrder() }}               <!-- Show edit button if allowed -->
{{ getEditRemaining() }}/2         <!-- Display remaining edits -->
{{ getRefundPercentage() }}%       <!-- Show refund percentage -->
```

---

## 5. AUTH (Authentication Module)

### Module Structure
```
auth/
├── auth-modal.service.ts          (Service)
├── login/
│   ├── login.component.ts         (Component Logic)
│   ├── login.component.html       (Template)
│   └── login.component.css        (Styling)
├── register/
│   ├── register.component.ts      (Component Logic)
│   ├── register.component.html    (Template)
│   └── register.component.css     (Styling)
└── forgot-password/
    ├── forgot-password.component.ts (Component Logic)
    ├── forgot-password.component.html (Template)
    └── forgot-password.component.css (Styling)
```

### Service: `AuthModalService`

**Type:** Singleton Injectable Service
**Provided in:** Root

#### Observable Interface
```typescript
type AuthModalMode = 'login' | 'register' | 'forgot' | null;
modalMode$: Observable<AuthModalMode> // Subject as observable
```

#### Properties
- `modalModeSubject: BehaviorSubject<AuthModalMode>` - Tracks current modal mode

#### Methods
```typescript
openLoginModal(): void
// Emits 'login' mode

openRegisterModal(): void
// Emits 'register' mode

openForgotModal(): void
// Emits 'forgot' mode

closeModal(): void
// Emits null to close modal
```

---

### Component: `LoginComponent`

**Selector:** `app-login-modal`
**Type:** Standalone Component
**Lifecycle:** `OnInit`

#### Properties

##### Form Inputs
- `phoneOrEmail: string` - Phone or email input
- `password: string` - Password input
- `showPassword: boolean` - Password visibility toggle

##### Validation Errors
- `phoneOrEmailError: string` - Validation message
- `passwordError: string` - Validation message
- `loginError: string` - Login error message

##### UI State
- `isLoading: boolean` - Loading indicator (optional)

#### Methods

```typescript
onLogin(): void
// Login flow:
// 1. Validates phone/email and password
// 2. Creates login payload
// 3. Calls API service
// 4. On success:
//    - Stores access token in localStorage
//    - Stores customer info in localStorage
//    - Stores last login credentials
//    - Emits loggedIn event
//    - Closes modal
// 5. On error: displays error message

toggleShowPassword(): void
// Toggles password visibility

getMockUsers(): MockUser[]
// Retrieves mock user list from localStorage
// Returns default user if not found

openRegister(event: Event): void
// Prevents default
// Calls authModalService.openRegisterModal()

openForgot(event: Event): void
// Prevents default
// Calls authModalService.openForgotModal()

closeModal(): void
// Emits close event
// Calls authModalService.closeModal()
```

#### Interfaces
```typescript
interface MockUser {
  phoneNumber: string;
  fullName: string;
  email: string;
  password: string;
}
```

### Data Bindings (HTML Template Key Bindings)

```html
[(ngModel)]="phoneOrEmail"         <!-- Phone/email input -->
[(ngModel)]="password"             <!-- Password input -->
(ngSubmit)="onLogin()"             <!-- Login submission -->
[type]="showPassword ? 'text' : 'password'" <!-- Password visibility toggle -->
(click)="toggleShowPassword()"     <!-- Toggle password visibility -->
*ngIf="phoneOrEmailError"          <!-- Show validation error -->
*ngIf="passwordError"              <!-- Show validation error -->
*ngIf="loginError"                 <!-- Show login error -->
(click)="openForgot($event)"       <!-- Forgot password link -->
(click)="openRegister($event)"     <!-- Register link -->
(click)="closeModal()"             <!-- Close modal button -->
```

---

### Component: `RegisterComponent`

**Selector:** `app-register-modal`
**Type:** Standalone Component
**Lifecycle:** `OnDestroy`

#### Properties

##### Registration Steps
```typescript
step: 'phone' | 'otp' | 'profile' = 'phone'
```

##### Step 1: Phone
- `phoneNumber: string` - Phone number input
- `phoneNumberError: string` - Validation error

##### Step 2: OTP Verification
```typescript
otpDigits: string[] = Array(6).fill('')  // Individual OTP digits
otpDigitsString: string = ''             // Combined OTP string
otpCountdown: number = 180               // 3-minute countdown
otpTimer: any = null                     // Timer reference
generatedOtp: string = ''                // Generated OTP for validation
otpError: string = ''                    // OTP error message
```

##### Step 3: Profile Information
- `fullName: string` - Full name input
- `email: string` - Email input
- `password: string` - Password input
- `confirmPassword: string` - Confirm password input
- `avatarUrl: string` - Profile avatar URL
- `gender: string` - Gender selection
- `birthDate: string` - Birth date

##### Validation Errors
- `fullNameError: string`
- `emailError: string`
- `passwordError: string`
- `confirmPasswordError: string`
- `registrationError: string`

##### UI State
- `showPassword: boolean` - Password visibility toggle
- `showConfirmPassword: boolean` - Confirm password visibility
- `registrationSuccess: boolean` - Success flag
- `showToast: boolean` - Toast notification visibility
- `toastMessage: string` - Toast message text

#### Methods

```typescript
continueFromPhone(): void
// Step 1 submission:
// 1. Validates phone number format
// 2. Generates OTP
// 3. Stores OTP for verification
// 4. Moves to 'otp' step
// 5. Starts OTP countdown timer

onOtpChange(val: string): void
// Parses OTP input (digits only, max 6)
// Updates otpDigits array

verifyOtp(): void
// Step 2 submission:
// 1. Validates OTP matches generated code
// 2. On success: moves to 'profile' step
// 3. On error: shows error message

submitRegistration(): void
// Step 3 submission:
// 1. Validates all profile fields
// 2. Validates password match
// 3. Creates user object
// 4. Saves to localStorage (mock)
// 5. Calls API service to register
// 6. On success:
//    - Shows success toast
//    - Stores login credentials
//    - Emits loggedIn/registered events
//    - Closes modal after delay
// 7. On error: displays error message

startOtpTimer(): void
// Starts 180-second countdown
// Updates otpCountdown every 1 second
// Auto-clears when countdown ends

clearOtpTimer(): void
// Clears OTP countdown interval
// Resets timer reference

formatCountdown(seconds: number): string
// Converts seconds to MM:SS format

toggleShowPassword(): void
// Toggles password visibility

toggleShowConfirmPassword(): void
// Toggles confirm password visibility

getMockUsers(): any[]
// Retrieves mock user list from localStorage

saveMockUser(user: any): void
// Adds new user to mock user list in localStorage

showToastMessage(message: string): void
// Displays toast notification

resendOtp(): void
// Resends OTP to phone number
// Restarts countdown timer

openLogin(event: Event): void
// Switches to login modal

closeModal(): void
// Clears OTP timer
// Closes modal via service
// Emits close event

ngOnDestroy(): void
// Lifecycle hook: clears OTP timer on destroy
```

### Data Bindings (HTML Template Key Bindings)

#### Step 1: Phone
```html
[(ngModel)]="phoneNumber"          <!-- Phone input -->
(click)="continueFromPhone()"      <!-- Continue button -->
*ngIf="phoneNumberError"           <!-- Show error -->
```

#### Step 2: OTP
```html
[(ngModel)]="otpDigitsString"      <!-- OTP input (combined) -->
(change)="onOtpChange($event)"     <!-- Parse OTP input -->
(click)="verifyOtp()"              <!-- Verify button -->
{{ formatCountdown(otpCountdown) }} <!-- Display countdown MM:SS -->
*ngIf="otpCountdown > 0"           <!-- Hide when expired -->
(click)="resendOtp()"              <!-- Resend OTP button -->
*ngIf="otpError"                   <!-- Show error -->
{{ phoneNumber }}                  <!-- Display masked phone -->
```

#### Step 3: Profile
```html
[(ngModel)]="fullName"             <!-- Full name input -->
[(ngModel)]="email"                <!-- Email input -->
[(ngModel)]="password"             <!-- Password input -->
[(ngModel)]="confirmPassword"      <!-- Confirm password input -->
[type]="showPassword ? 'text' : 'password'" <!-- Password visibility -->
(click)="toggleShowPassword()"     <!-- Toggle password visibility -->
[type]="showConfirmPassword ? 'text' : 'password'" <!-- Confirm visibility -->
(click)="toggleShowConfirmPassword()" <!-- Toggle confirm visibility -->
[(ngModel)]="gender"               <!-- Gender selection -->
[(ngModel)]="birthDate"            <!-- Birth date input -->
(click)="submitRegistration()"     <!-- Submit registration -->
*ngIf="fullNameError"              <!-- Show validation errors -->
*ngIf="emailError"
*ngIf="passwordError"
*ngIf="confirmPasswordError"
```

#### Toast & Modals
```html
*ngIf="showToast"                  <!-- Show toast notification -->
{{ toastMessage }}                 <!-- Toast message -->
(click)="closeModal()"             <!-- Close modal -->
(click)="openLogin($event)"        <!-- Switch to login -->
```

---

### Component: `ForgotPasswordComponent`

**Selector:** `app-forgot-password`
**Type:** Standalone Component
**Lifecycle:** `OnDestroy`

#### Properties

##### Forgot Password Steps
```typescript
step: 'phone' | 'otp' | 'reset' = 'phone'
```

##### Step 1: Phone Input
- `phoneNumber: string` - Phone number for account lookup
- `phoneNumberError: string` - Validation error

##### Step 2: OTP Verification
```typescript
otpDigits: string[] = Array(6).fill('')
otpDigitsString: string = ''
otpError: string = ''
otpCountdown: number = 180
otpTimer: ReturnType<typeof setInterval> | null = null
generatedOtp: string = ''
```

##### Step 3: Password Reset
- `newPassword: string` - New password input
- `confirmPassword: string` - Confirm password input
- `showNewPassword: boolean` - New password visibility
- `showConfirmPassword: boolean` - Confirm password visibility
- `newPasswordError: string` - Validation error
- `confirmPasswordError: string` - Validation error
- `resetError: string` - Reset error message

##### UI State
- `showToast: boolean` - Toast notification visibility
- `toastMessage: string` - Toast message text

#### Methods

```typescript
continueFromPhone(): void
// Step 1 submission:
// 1. Validates phone number
// 2. Generates OTP
// 3. Moves to 'otp' step
// 4. Starts countdown timer

onOtpChange(val: string): void
// Parses OTP input (digits only, max 6)

verifyOtp(): void
// Step 2 submission:
// 1. Validates OTP
// 2. On success: moves to 'reset' step
// 3. On error: shows error message

submitReset(): void
// Step 3 submission:
// 1. Validates password requirements
// 2. Validates passwords match
// 3. Calls API to reset password
// 4. On success:
//    - Shows success message
//    - Auto-redirects to login
//    - Updates mock user password
// 5. On error: displays error message

startOtpTimer(): void
// Starts 180-second countdown
// Updates every 1 second
// Auto-clears at zero

clearOtpTimer(): void
// Clears countdown interval

formatCountdown(seconds: number): string
// Converts seconds to MM:SS

toggleShowNewPassword(): void
// Toggles new password visibility

toggleShowConfirmPassword(): void
// Toggles confirm password visibility

getMockUsers(): any[]
// Retrieves mock user list

showToastMessage(message: string): void
// Displays toast notification

resendOtp(): void
// Resends OTP and restarts timer

openLogin(event: Event): void
// Switches to login modal

closeModal(): void
// Clears timer and closes modal

ngOnDestroy(): void
// Lifecycle: clears timer on destroy
```

### Data Bindings (HTML Template Key Bindings)

Similar to RegisterComponent with three-step flow:

#### Step 1: Phone
```html
[(ngModel)]="phoneNumber"          <!-- Phone input -->
(click)="continueFromPhone()"      <!-- Continue button -->
```

#### Step 2: OTP
```html
[(ngModel)]="otpDigitsString"      <!-- OTP input -->
(change)="onOtpChange($event)"     <!-- Parse input -->
{{ formatCountdown(otpCountdown) }} <!-- Countdown display -->
(click)="verifyOtp()"              <!-- Verify button -->
```

#### Step 3: Reset Password
```html
[(ngModel)]="newPassword"          <!-- New password input -->
[(ngModel)]="confirmPassword"      <!-- Confirm password input -->
[type]="showNewPassword ? 'text' : 'password'" <!-- Visibility toggle -->
(click)="toggleShowNewPassword()"  <!-- Toggle button -->
(click)="submitReset()"            <!-- Submit button -->
```

---

## Service Dependencies Summary

### Services Used Across Modules

| Service | Used By | Purpose |
|---------|---------|---------|
| `AuthService` | All modules | Authentication state management |
| `AuthModalService` | Auth components | Modal state management |
| `AuthApiService` | Login, Register, ForgotPassword | Authentication API calls |
| `ToastService` | Tim-kiem, Thong-tin-don-hang | Notification display |
| `TimKiemApiService` | Tim-kiem, Thong-tin-don-hang | Trip search & details |
| `HomeApiService` | Tim-kiem | Load active routes |
| `ThanhToanApiService` | Thanh-toan | Payment processing |
| `TraCuuVeApiService` | Tra-cuu-ve | Ticket lookup |
| `PrintService` | Tra-cuu-ve | Ticket printing |
| `LunarCalendarService` | Tim-kiem | Lunar date calculations |

---

## Summary of Component Interactions

1. **User searches trips** → `TimKiemChuyenXe` fetches data via `TimKiemApiService`
2. **User selects trip and seats** → Navigates to `ThongTinDonHang` with query parameters
3. **User fills customer info** → Validates and navigates to `ThanhToan` page
4. **User selects payment method** → `ThanhToan` initiates payment via `ThanhToanApiService`
5. **User looks up booking** → `TraCuuVeComponent` queries via `TraCuuVeApiService`
6. **User needs authentication** → `AuthModalService` manages login/register/forgot modals

---

## CSS Architecture Notes

Each module uses:
- **Tailwind CSS** classes for responsive design
- **Material Design Icons** via `material-symbols-outlined`
- **Custom color system**: primary, secondary, success, danger, warning, info, etc.
- **Spacing system**: margin-*, padding-* utilities
- **Responsive breakpoints**: sm, md, lg screen sizes
- **Flexbox and Grid** layouts for modern responsive UI
