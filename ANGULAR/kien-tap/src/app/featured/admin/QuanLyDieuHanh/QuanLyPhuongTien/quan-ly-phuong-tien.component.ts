import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhuongTienService, Vehicle } from '../phuong-tien.service';
import { CustomSelectComponent } from '../custom-select.component';

@Component({
  selector: 'app-quan-ly-phuong-tien',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './quan-ly-phuong-tien.component.html',
  styleUrls: ['./quan-ly-phuong-tien.component.css']
})
export class QuanLyPhuongTienComponent implements OnInit {
  constructor(private phuongTienService: PhuongTienService) { }

  activeTab: 'all' | 'active' | 'locked' = 'all';
  searchQuery: string = '';
  selectedType: string = '';
  searchVehicleName: string = '';
  searchLicensePlate: string = '';

  get typeFilterOptions() {
    const options = this.vehicleTypes.map(t => ({ value: t, label: t }));
    return [{ value: '', label: 'Loại xe' }, ...options];
  }

  get typeFormOptions() {
    return this.vehicleTypes.map(t => ({ value: t, label: t }));
  }

  activeDropdown: 'type' | null = null;

  toggleDropdown(type: 'type', event: MouseEvent) {
    event.stopPropagation();
    if (this.activeDropdown === type) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = type;
    }
  }

  selectFilter(type: 'type', value: string) {
    if (type === 'type') {
      this.selectedType = value;
    }
    this.activeDropdown = null;
  }

  preventNegativeKey(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'e' || event.key === '+' || event.key === ',') {
      event.preventDefault();
    }
  }

  vehicles: Vehicle[] = [];

  filteredVehicles: Vehicle[] = [];
  isModalOpen = false;
  isEditMode = false;
  currentVehicle: Partial<Vehicle> = {};

  // Custom Alert State
  isAlertOpen = false;
  alertMessage = '';

  // Uploading states
  isUploadingReg = false;
  isUploadingIns = false;
  isUploadingVeh = false;

  vehicleTypes = ['Limousine 22 phòng'];

  vehicleConfigs: { [key: string]: { floors: number | undefined, rows: number | undefined, seats: number | undefined } } = {
    'Limousine 22 phòng': { floors: 2, rows: 2, seats: 22 }
  };

  amenitiesList = [
    { id: 'tivi', label: 'Tivi', icon: 'tv' },
    { id: 'usb', label: 'Ổ sạc, USB', icon: 'usb' },
    { id: 'wifi', label: 'Wifi', icon: 'wifi' },
    { id: 'water', label: 'Nước, khăn ướt', icon: 'opacity' },
    { id: 'gps', label: 'GPS', icon: 'gps_fixed' },
    { id: 'ac', label: 'Điều hòa', icon: 'ac_unit' }
  ];

  // Date Picker State
  isRegPickerOpen = false;
  isInsPickerOpen = false;
  viewDate: Date = new Date();
  calendarDays: (number | null)[] = [];
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  pickerViewMode: 'day' | 'month' | 'year' = 'day';
  yearRangeStart: number = 2020;

  get yearsList(): number[] {
    return Array.from({ length: 12 }, (_, i) => this.yearRangeStart + i);
  }

  ngOnInit() {
    this.vehicles = this.phuongTienService.getVehicles();
    this.filterVehicles();

    this.phuongTienService.vehiclesUpdated$.subscribe(() => {
      this.vehicles = this.phuongTienService.getVehicles();
      this.filterVehicles();
    });
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isRegPickerOpen = false;
    this.isInsPickerOpen = false;
    this.activeDropdown = null;
  }

  setTab(tab: 'all' | 'active' | 'locked') {
    this.activeTab = tab;
    this.filterVehicles();
  }

  filterVehicles() {
    let result = this.vehicles.filter(v => {
      const matchesTab = this.activeTab === 'all' ||
        (this.activeTab === 'active' && v.status === 'active') ||
        (this.activeTab === 'locked' && v.status === 'locked');

      const matchesName = !this.searchVehicleName ||
        v.name.toLowerCase().includes(this.searchVehicleName.toLowerCase());

      const matchesPlate = !this.searchLicensePlate ||
        v.licensePlate.toLowerCase().includes(this.searchLicensePlate.toLowerCase());

      const matchesType = !this.selectedType || v.type === this.selectedType;

      return matchesTab && matchesName && matchesPlate && matchesType;
    });

    // Default sort by newest
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    this.filteredVehicles = result;
  }

  clearFilters() {
    this.searchVehicleName = '';
    this.searchLicensePlate = '';
    this.selectedType = '';
    this.filterVehicles();
  }

  floorLayouts: any[] = [];

  onVehicleTypeChange() {
    const config = this.vehicleConfigs[this.currentVehicle.type || ''];
    if (config) {
      this.currentVehicle.floors = config.floors;
      this.currentVehicle.rows = config.rows;
      this.currentVehicle.seats = config.seats;
    } else {
      this.currentVehicle.floors = undefined;
      this.currentVehicle.rows = undefined;
      this.currentVehicle.seats = undefined;
    }
    this.onLayoutChange();
  }

  onLayoutChange() {
    this.generateSeatLayout();
  }

  getDummyArray(count: number): number[] {
    return Array(Math.max(0, count)).fill(0);
  }

  generateSeatLayout() {
    if (!this.currentVehicle.floors || !this.currentVehicle.rows || !this.currentVehicle.seats || !this.currentVehicle.type) {
      this.floorLayouts = [];
      return;
    }

    if (this.currentVehicle.type === 'Limousine 22 phòng') {
      this.generateLimousine22Layout();
      return;
    }

    const floors = this.currentVehicle.floors;
    const rows = this.currentVehicle.rows;
    const seats = this.currentVehicle.seats;

    this.floorLayouts = [];

    const seatsPerFloor = Math.floor(seats / floors);
    const extraSeats = seats % floors;

    const floorPrefixes = ['A', 'B', 'C', 'D', 'E'];

    for (let f = 0; f < floors; f++) {
      const floorSeatsCount = seatsPerFloor + (f < extraSeats ? 1 : 0);
      const prefix = floorPrefixes[f] || String.fromCharCode(65 + f);

      const floorSeatsList: string[] = [];
      for (let s = 1; s <= floorSeatsCount; s++) {
        floorSeatsList.push(`${prefix}${s}`);
      }

      const layoutRows: any[] = [];
      let i = 0;

      while (i < floorSeatsList.length) {
        const remaining = floorSeatsList.length - i;

        if (remaining <= rows + 1 && remaining > 1 && rows > 1) {
          const backRowSeats = floorSeatsList.slice(i);
          layoutRows.push({
            isBackRow: true,
            seats: backRowSeats
          });
          break;
        }

        const rowSeats = floorSeatsList.slice(i, i + rows);
        layoutRows.push({
          isBackRow: false,
          seats: rowSeats
        });
        i += rows;
      }

      this.floorLayouts.push({
        floorNumber: f + 1,
        floorName: `Tầng ${f + 1}`,
        rows: layoutRows
      });
    }
  }

  generateLimousine22Layout() {
    this.floorLayouts = [];

    // Tầng 1 (Tầng Dưới) - 12 ghế: 1A, 2A, ..., 12A
    const floor1Rows: any[] = [];
    for (let r = 0; r < 6; r++) {
      floor1Rows.push({
        isBackRow: false,
        seats: [`${r * 2 + 1}A`, `${r * 2 + 2}A`]
      });
    }
    this.floorLayouts.push({
      floorNumber: 1,
      floorName: 'TẦNG DƯỚI',
      rows: floor1Rows
    });

    // Tầng 2 (Tầng Trên) - 10 ghế: 1B, 2B, ..., 10B
    const floor2Rows: any[] = [];
    for (let r = 0; r < 5; r++) {
      floor2Rows.push({
        isBackRow: false,
        seats: [`${r * 2 + 1}B`, `${r * 2 + 2}B`]
      });
    }
    this.floorLayouts.push({
      floorNumber: 2,
      floorName: 'TẦNG TRÊN',
      rows: floor2Rows
    });
  }

  errors: { name?: boolean; licensePlate?: boolean; registrationExpiry?: boolean; insuranceExpiry?: boolean; type?: boolean } = {};

  openAddModal() {
    this.isEditMode = false;
    this.errors = {};
    this.currentVehicle = {
      status: 'active',
      type: '',
      amenities: [],
      selectedSeats: [],
      seats: undefined,
      floors: undefined,
      rows: undefined,
      createdAt: new Date()
    };
    this.generateSeatLayout();
    this.isModalOpen = true;
  }

  openEditModal(vehicle: Vehicle) {
    this.isEditMode = true;
    this.errors = {};
    this.currentVehicle = { ...vehicle };
    this.generateSeatLayout();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isRegPickerOpen = false;
    this.isInsPickerOpen = false;
    this.errors = {};
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  showAlert(message: string) {
    this.alertMessage = message;
    this.isAlertOpen = true;
  }

  closeAlert() {
    this.isAlertOpen = false;
  }

  saveVehicle() {
    // Validation
    this.errors = {
      name: !this.currentVehicle.name,
      licensePlate: !this.currentVehicle.licensePlate,
      registrationExpiry: !this.currentVehicle.registrationExpiry,
      insuranceExpiry: !this.currentVehicle.insuranceExpiry,
      type: !this.currentVehicle.type
    };

    if (Object.values(this.errors).some(Boolean)) {
      return;
    }

    if (this.isEditMode) {
      this.phuongTienService.updateVehicle(this.currentVehicle.id!, this.currentVehicle);
    } else {
      this.phuongTienService.addVehicle(this.currentVehicle as any);
    }
    this.filterVehicles();
    this.closeModal();
  }

  toggleStatus() {
    if (this.currentVehicle.status === 'active') {
      this.currentVehicle.status = 'locked';
    } else {
      this.currentVehicle.status = 'active';
    }
  }

  deleteVehicle() {
    if (confirm('Bạn có chắc chắn muốn xóa phương tiện này không?')) {
      this.phuongTienService.deleteVehicle(this.currentVehicle.id!);
      this.filterVehicles();
      this.closeModal();
    }
  }

  hasAmenity(id: string): boolean {
    return this.currentVehicle.amenities?.includes(id) || false;
  }

  toggleAmenity(id: string) {
    if (!this.currentVehicle.amenities) this.currentVehicle.amenities = [];
    const index = this.currentVehicle.amenities.indexOf(id);
    if (index === -1) {
      this.currentVehicle.amenities.push(id);
    } else {
      this.currentVehicle.amenities.splice(index, 1);
    }
  }

  isSeatSelected(seat: string): boolean {
    return this.currentVehicle.selectedSeats?.includes(seat) || false;
  }

  toggleSeat(seat: string) {
    if (!this.currentVehicle.selectedSeats) this.currentVehicle.selectedSeats = [];
    const index = this.currentVehicle.selectedSeats.indexOf(seat);
    if (index === -1) {
      this.currentVehicle.selectedSeats.push(seat);
    } else {
      this.currentVehicle.selectedSeats.splice(index, 1);
    }
  }

  // Custom Date Picker Logic
  toggleDatePicker(field: 'reg' | 'ins') {
    if (field === 'reg') {
      this.isRegPickerOpen = !this.isRegPickerOpen;
      this.isInsPickerOpen = false;
    } else {
      this.isInsPickerOpen = !this.isInsPickerOpen;
      this.isRegPickerOpen = false;
    }
    if (this.isRegPickerOpen || this.isInsPickerOpen) {
      this.viewDate = new Date();
      this.viewDate.setDate(1);
      this.pickerViewMode = 'day';
      this.generateCalendar();
    }
  }

  setPickerView(mode: 'day' | 'month' | 'year') {
    this.pickerViewMode = mode;
    if (mode === 'year') {
      this.yearRangeStart = this.viewDate.getFullYear() - (this.viewDate.getFullYear() % 12);
    }
  }

  selectMonth(monthIndex: number) {
    this.viewDate.setMonth(monthIndex);
    this.pickerViewMode = 'day';
    this.generateCalendar();
  }

  selectYear(year: number) {
    this.viewDate.setFullYear(year);
    this.pickerViewMode = 'month';
  }

  generateCalendar() {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust firstDay to start from Monday (0 is Mon, 6 is Sun)
    let startDay = firstDay === 0 ? 6 : firstDay - 1;

    this.calendarDays = [];
    for (let i = 0; i < startDay; i++) {
      this.calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push(i);
    }
  }

  prev() {
    if (this.pickerViewMode === 'day') {
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
      this.generateCalendar();
    } else if (this.pickerViewMode === 'month') {
      this.viewDate = new Date(this.viewDate.getFullYear() - 1, this.viewDate.getMonth(), 1);
    } else if (this.pickerViewMode === 'year') {
      this.yearRangeStart -= 12;
    }
  }

  next() {
    if (this.pickerViewMode === 'day') {
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
      this.generateCalendar();
    } else if (this.pickerViewMode === 'month') {
      this.viewDate = new Date(this.viewDate.getFullYear() + 1, this.viewDate.getMonth(), 1);
    } else if (this.pickerViewMode === 'year') {
      this.yearRangeStart += 12;
    }
  }

  selectDate(day: number | null, field: 'reg' | 'ins') {
    if (!day) return;
    const date = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
    const formattedDate = this.formatDate(date);

    if (field === 'reg') {
      this.currentVehicle.registrationExpiry = formattedDate;
      this.isRegPickerOpen = false;
    } else {
      this.currentVehicle.insuranceExpiry = formattedDate;
      this.isInsPickerOpen = false;
    }
  }

  formatDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  onImageUpload(event: any, field: 'registrationImage' | 'insuranceImage' | 'vehicleImage') {
    const file = event.target.files[0];
    if (!file) return;

    if (field === 'registrationImage') this.isUploadingReg = true;
    if (field === 'insuranceImage') this.isUploadingIns = true;
    if (field === 'vehicleImage') this.isUploadingVeh = true;

    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        (this.currentVehicle as any)[field] = e.target.result;
        if (field === 'registrationImage') this.isUploadingReg = false;
        if (field === 'insuranceImage') this.isUploadingIns = false;
        if (field === 'vehicleImage') this.isUploadingVeh = false;
      };
      reader.readAsDataURL(file);
    }, 1500);
  }

  removeImage(field: 'registrationImage' | 'insuranceImage' | 'vehicleImage') {
    (this.currentVehicle as any)[field] = undefined;
  }

  getAmenityIcon(id: string): string {
    const amenity = this.amenitiesList.find(a => a.id === id);
    return amenity ? amenity.icon : 'help';
  }
}
