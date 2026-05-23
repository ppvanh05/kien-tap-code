import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuyenXeService } from '../tuyen-xe.service';
import { TaiXeService } from '../tai-xe.service';
import { PhuongTienService } from '../phuong-tien.service';

import { CustomSelectComponent } from '../custom-select.component';
import { DiemDonTraService } from '../diem-don-tra.service';

export interface SeatGroup {
  name: string;
  color: string;
  seats: string[];
  price?: number;
}

interface Schedule {
  id: number;
  routeName: string;
  vehiclePlate: string;
  vehicleName: string;
  vehicleSeats?: number;
  driverName: string;
  assistantName: string;
  departureDate: string;
  departureTime: string;
  status: 'active' | 'locked' | 'scheduled';
  createdAt: Date;

  // New Fields Requested
  autoRun: boolean;
  allowSeatSelection: boolean;
  totalTime: string;
  arrivalTime: string;
  arrivalDate?: string;
  frequency: string;
  openValue: number;
  openUnit: 'day' | 'hour' | 'minute';
  closeValue: number;
  closeUnit: 'day' | 'hour' | 'minute';
  holdValue: number;
  holdUnit: 'day' | 'hour' | 'minute';
  pickupType: string;
  pickupPoint: string;
  dropoffType: string;
  dropoffPoint: string;

  basePrice?: number;

  // Selected Seats List
  selectedSeats?: string[];
  seatGroups?: SeatGroup[];
}

@Component({
  selector: 'app-quan-ly-lich-trinh',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './quan-ly-lich-trinh.component.html',
  styleUrls: ['./quan-ly-lich-trinh.component.css']
})
export class QuanLyLichTrinhComponent implements OnInit {
  activeTab: 'all' | 'active' | 'locked' = 'all';
  selectedRoute: string = '';
  mousedownTarget: HTMLElement | null = null;

  get routeFilterOptions() {
    return this.routesList.map(r => ({
      value: r.name,
      label: r.name + (r.status === 'locked' ? ' (Đã khóa)' : ''),
      disabled: r.status === 'locked'
    }));
  }

  get routeFormOptions() {
    return this.routesList.map(r => ({
      value: r.name,
      label: r.name + (r.status === 'locked' ? ' (Đã khóa)' : ''),
      disabled: r.status === 'locked'
    }));
  }

  get driverFormOptions() {
    return this.driversList.map(d => ({
      value: d.name,
      label: d.name + (d.status === 'locked' ? ' (Đã khóa)' : ''),
      disabled: d.status === 'locked'
    }));
  }

  get assistantFormOptions() {
    // Non-mandatory, so let's allow selecting empty/none
    const options = this.assistantsList.map(a => ({
      value: a.name,
      label: a.name + (a.status === 'locked' ? ' (Đã khóa)' : ''),
      disabled: a.status === 'locked'
    }));
    return [{ value: '', label: 'Chọn phụ xe (Không bắt buộc)' }, ...options];
  }

  get vehicleNameFormOptions() {
    const names = Array.from(new Set(this.vehiclesList.map(v => v.name)));
    return names.map(name => {
      const v = this.vehiclesList.find(vh => vh.name === name);
      const isLocked = v ? v.status === 'locked' : false;
      return {
        value: name,
        label: name + (isLocked ? ' (Đã khóa)' : ''),
        disabled: isLocked
      };
    });
  }

  get vehiclePlateFormOptions() {
    return this.vehiclesList.map(v => ({
      value: v.plate,
      label: v.plate + (v.status === 'locked' ? ' (Đã khóa)' : ''),
      disabled: v.status === 'locked'
    }));
  }

  get pickupTypeOptions() {
    return [
      { value: 'Không trung chuyển đón', label: 'Không trung chuyển đón' },
      { value: 'Trung chuyển đón tại bến', label: 'Trung chuyển đón tại bến' },
      { value: 'Trung chuyển đón tận nơi', label: 'Trung chuyển đón tận nơi' }
    ];
  }

  get pickupPointOptions() {
    return this.diemDonTraService.getPoints()
      .filter(p => p.type === 'don-tra')
      .map(p => ({
        value: p.name,
        label: p.name + (p.status === 'locked' ? ' (Đã khóa)' : ''),
        disabled: p.status === 'locked'
      }));
  }

  get dropoffTypeOptions() {
    return [
      { value: 'Không trung chuyển trả', label: 'Không trung chuyển trả' },
      { value: 'Trung chuyển trả tại bến', label: 'Trung chuyển trả tại bến' },
      { value: 'Trung chuyển trả tận nơi', label: 'Trung chuyển trả tận nơi' }
    ];
  }

  get dropoffPointOptions() {
    return this.diemDonTraService.getPoints()
      .filter(p => p.type === 'dung')
      .map(p => ({
        value: p.name,
        label: p.name + (p.status === 'locked' ? ' (Đã khóa)' : ''),
        disabled: p.status === 'locked'
      }));
  }

  getPointAddress(pointName: string | undefined): string {
    if (!pointName) return '';
    const pt = this.diemDonTraService.getPoints().find(p => p.name === pointName);
    return pt ? pt.address : '';
  }

  routesList: { name: string, status: 'active' | 'locked' }[] = [];

  routeDetailsMap: { [key: string]: { time: string, distance: string } } = {};

  vehiclesList: { name: string, plate: string, seats: number, status: 'active' | 'locked', floors?: number, rows?: number }[] = [];

  driversList: { name: string, status: 'active' | 'locked' }[] = [];

  assistantsList: { name: string, status: 'active' | 'locked' }[] = [];

  // Seat Groups State Variables
  activeSeatGroupIndex: number | null = null;
  openedColorMenuIndex: number | null = null;

  // Custom Unit Dropdown States
  showOpenUnitDropdown = false;
  showCloseUnitDropdown = false;
  showHoldUnitDropdown = false;

  presetColors: string[] = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
    '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16'
  ];

  schedules: Schedule[] = [
    {
      id: 1,
      routeName: 'Bến xe Miền Đông – Bến xe Quy Nhơn',
      vehiclePlate: '59B-01234',
      vehicleName: 'Limousine 22 phòng Premium',
      vehicleSeats: 22,
      driverName: 'Hoàng Anh Tú',
      assistantName: 'Phạm Thành Đạt',
      departureDate: '20/05/2026',
      departureTime: '08:30',
      status: 'active',
      createdAt: new Date('2026-05-10'),
      autoRun: false,
      allowSeatSelection: true,
      totalTime: '13h 30p',
      arrivalTime: '22:00',
      frequency: 'Hàng ngày',
      openValue: 10,
      openUnit: 'day',
      closeValue: 30,
      closeUnit: 'minute',
      holdValue: 15,
      holdUnit: 'minute',
      pickupType: 'Không trung chuyển đón',
      pickupPoint: 'Bến xe Miền Đông',
      dropoffType: 'Không trung chuyển trả',
      dropoffPoint: 'Bến xe Quy Nhơn',
      basePrice: 300000
    },
    {
      id: 2,
      routeName: 'Bến xe Miền Đông – Bến xe Hà Nội',
      vehiclePlate: '77B-00987',
      vehicleName: 'Limousine 22 phòng Luxury',
      vehicleSeats: 22,
      driverName: 'Nguyễn Văn Long',
      assistantName: 'Võ Minh Khang',
      departureDate: '21/05/2026',
      departureTime: '13:00',
      status: 'active',
      createdAt: new Date('2026-05-11'),
      autoRun: true,
      allowSeatSelection: true,
      totalTime: '32h 0p',
      arrivalTime: '21:00 (+1 ngày)',
      frequency: 'Hàng ngày',
      openValue: 15,
      openUnit: 'day',
      closeValue: 60,
      closeUnit: 'minute',
      holdValue: 20,
      holdUnit: 'minute',
      pickupType: 'Có trung chuyển đón',
      pickupPoint: 'Văn phòng Q.1',
      dropoffType: 'Không trung chuyển trả',
      dropoffPoint: 'Bến xe Hà Nội',
      basePrice: 850000
    },
    {
      id: 3,
      routeName: 'Bến xe Quy Nhơn – Bến xe Đà Lạt',
      vehiclePlate: '59B-05566',
      vehicleName: 'Limousine 22 phòng Deluxe',
      vehicleSeats: 22,
      driverName: 'Trần Minh Quân',
      assistantName: 'Nguyễn Quốc Huy',
      departureDate: '22/05/2026',
      departureTime: '19:45',
      status: 'active',
      createdAt: new Date('2026-05-12'),
      autoRun: false,
      allowSeatSelection: true,
      totalTime: '9h 0p',
      arrivalTime: '04:45 (+1 ngày)',
      frequency: 'Hàng ngày',
      openValue: 7,
      openUnit: 'day',
      closeValue: 45,
      closeUnit: 'minute',
      holdValue: 15,
      holdUnit: 'minute',
      pickupType: 'Không trung chuyển đón',
      pickupPoint: 'Bến xe Quy Nhơn',
      dropoffType: 'Có trung chuyển trả',
      dropoffPoint: 'Bến xe Đà Lạt',
      basePrice: 350000
    },
    {
      id: 4,
      routeName: 'Bến xe An Sương – Bến xe Vũng Tàu',
      vehiclePlate: '77B-01122',
      vehicleName: 'Limousine 22 phòng Gold',
      vehicleSeats: 22,
      driverName: 'Lê Quốc Bảo',
      assistantName: 'Phạm Thành Đạt',
      departureDate: '20/05/2026',
      departureTime: '06:00',
      status: 'active',
      createdAt: new Date('2026-05-13'),
      autoRun: false,
      allowSeatSelection: true,
      totalTime: '3h 0p',
      arrivalTime: '09:00',
      frequency: 'Cuối tuần (Thứ 7, Chủ nhật)',
      openValue: 5,
      openUnit: 'day',
      closeValue: 15,
      closeUnit: 'minute',
      holdValue: 10,
      holdUnit: 'minute',
      pickupType: 'Không trung chuyển đón',
      pickupPoint: 'Bến xe An Sương',
      dropoffType: 'Không trung chuyển trả',
      dropoffPoint: 'Bến xe Vũng Tàu',
      basePrice: 180000
    },
    {
      id: 5,
      routeName: 'Bến xe Quy Nhơn – Bến xe Nha Trang',
      vehiclePlate: '59B-09988',
      vehicleName: 'Limousine 22 phòng Silver',
      vehicleSeats: 22,
      driverName: 'Đặng Hải Nam',
      assistantName: 'Võ Minh Khang',
      departureDate: '23/05/2026',
      departureTime: '10:15',
      status: 'scheduled',
      createdAt: new Date('2026-05-14'),
      autoRun: true,
      allowSeatSelection: true,
      totalTime: '5h 0p',
      arrivalTime: '15:15',
      frequency: 'Hàng ngày',
      openValue: 10,
      openUnit: 'day',
      closeValue: 30,
      closeUnit: 'minute',
      holdValue: 15,
      holdUnit: 'minute',
      pickupType: 'Có trung chuyển đón',
      pickupPoint: 'Văn phòng Bình Thạnh',
      dropoffType: 'Không trung chuyển trả',
      dropoffPoint: 'Bến xe Nha Trang',
      basePrice: 220000
    },
    {
      id: 6,
      routeName: 'Bến xe Miền Tây – Bến xe Phan Thiết',
      vehiclePlate: '77B-05577',
      vehicleName: 'Limousine 22 phòng Diamond',
      vehicleSeats: 22,
      driverName: 'Trần Gia Bảo',
      assistantName: 'Nguyễn Quốc Huy',
      departureDate: '24/05/2026',
      departureTime: '15:30',
      status: 'locked',
      createdAt: new Date('2026-05-15'),
      autoRun: false,
      allowSeatSelection: true,
      totalTime: '4h 30p',
      arrivalTime: '20:00',
      frequency: 'Hàng ngày',
      openValue: 10,
      openUnit: 'day',
      closeValue: 30,
      closeUnit: 'minute',
      holdValue: 15,
      holdUnit: 'minute',
      pickupType: 'Không trung chuyển đón',
      pickupPoint: 'Bến xe Miền Tây',
      dropoffType: 'Không trung chuyển trả',
      dropoffPoint: 'Bến xe Phan Thiết',
      basePrice: 250000
    }
  ];

  filteredSchedules: Schedule[] = [];
  isModalOpen = false;
  isEditMode = false;
  currentSchedule: Partial<Schedule> = {};

  // 2-Tab Modal Selection State
  activeModalTab: 'setup' | 'time' = 'setup';

  departureHour: number = 8;
  departureMinute: number = 0;

  // Custom Alert State
  isAlertOpen = false;
  alertMessage = '';

  // Date Picker State
  isDatePickerOpen = false;
  viewDate: Date = new Date();
  calendarDays: (number | null)[] = [];
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  pickerViewMode: 'day' | 'month' | 'year' = 'day';
  yearRangeStart: number = 2020;

  floorLayouts: any[] = [];

  get yearsList(): number[] {
    return Array.from({ length: 12 }, (_, i) => this.yearRangeStart + i);
  }

  constructor(
    private tuyenXeService: TuyenXeService,
    private taiXeService: TaiXeService,
    private phuongTienService: PhuongTienService,
    private diemDonTraService: DiemDonTraService
  ) { }

  ngOnInit() {
    this.loadRoutes();
    this.vehiclesList = this.phuongTienService.getVehicles().map(v => ({
      name: v.name,
      plate: v.licensePlate,
      seats: v.seats,
      status: v.status,
      floors: v.floors,
      rows: v.rows
    }));
    this.driversList = this.taiXeService.getDriversList();
    this.assistantsList = this.taiXeService.getAssistantsList();
    this.filterSchedules();
  }

  loadRoutes() {
    const activeRoutes = this.tuyenXeService.getRoutes();
    this.routesList = activeRoutes.map(r => ({ name: r.name, status: r.status }));
    activeRoutes.forEach(r => {
      this.routeDetailsMap[r.name] = {
        time: `${r.estimatedHours}h ${r.estimatedMinutes}p`,
        distance: r.distance.toString()
      };
    });
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isDatePickerOpen = false;
    this.openedColorMenuIndex = null;
    this.showOpenUnitDropdown = false;
    this.showCloseUnitDropdown = false;
    this.showHoldUnitDropdown = false;
  }

  setTab(tab: 'all' | 'active' | 'locked') {
    this.activeTab = tab;
    this.filterSchedules();
  }

  filterSchedules() {
    let result = this.schedules.filter(s => {
      const matchesTab = this.activeTab === 'all' ||
        (this.activeTab === 'active' && (s.status === 'active' || s.status === 'scheduled')) ||
        (this.activeTab === 'locked' && s.status === 'locked');

      const matchesRoute = !this.selectedRoute || s.routeName === this.selectedRoute;

      return matchesTab && matchesRoute;
    });

    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    this.filteredSchedules = result;
  }

  clearFilters() {
    this.selectedRoute = '';
    this.filterSchedules();
  }

  openAddModal() {
    this.isEditMode = false;
    this.activeModalTab = 'setup';
    this.currentSchedule = {
      status: 'active',
      routeName: '',
      vehiclePlate: '',
      vehicleName: '',
      vehicleSeats: undefined,
      driverName: '',
      assistantName: '',
      departureDate: this.formatDate(new Date()),
      departureTime: '08:00',
      createdAt: new Date(),
      autoRun: false,
      allowSeatSelection: true,
      totalTime: '00:00',
      arrivalTime: '00:00',
      frequency: 'Hàng ngày',
      openValue: 10,
      openUnit: 'day',
      closeValue: 30,
      closeUnit: 'minute',
      holdValue: 15,
      holdUnit: 'minute',
      pickupType: 'Không trung chuyển đón',
      pickupPoint: '',
      dropoffType: 'Không trung chuyển trả',
      dropoffPoint: '',
      basePrice: undefined,
      selectedSeats: [],
      seatGroups: []
    };
    this.departureHour = 8;
    this.departureMinute = 0;
    this.floorLayouts = [];
    this.activeSeatGroupIndex = null;
    this.openedColorMenuIndex = null;
    this.calculateArrivalTime();
    this.isModalOpen = true;
  }

  openEditModal(schedule: Schedule) {
    this.isEditMode = true;
    this.activeModalTab = 'setup';
    this.currentSchedule = {
      ...schedule,
      selectedSeats: schedule.selectedSeats ? [...schedule.selectedSeats] : [],
      seatGroups: schedule.seatGroups ? JSON.parse(JSON.stringify(schedule.seatGroups)) : []
    };
    this.generateSeatLayout();
    this.activeSeatGroupIndex = this.currentSchedule.seatGroups && this.currentSchedule.seatGroups.length > 0 ? 0 : null;
    this.openedColorMenuIndex = null;

    // Parse departureTime
    const timeParts = (this.currentSchedule.departureTime || '08:00').split(':');
    this.departureHour = parseInt(timeParts[0], 10) || 0;
    this.departureMinute = parseInt(timeParts[1], 10) || 0;

    this.calculateArrivalTime();
    this.isModalOpen = true;
  }

  getCurrentVehicleRows(): number {
    const selectedVeh = this.vehiclesList.find(v => v.plate === this.currentSchedule.vehiclePlate);
    return selectedVeh ? (selectedVeh.rows || 2) : 2;
  }

  toggleSeatInActiveGroup(seat: string) {
    if (!this.currentSchedule.seatGroups) {
      this.currentSchedule.seatGroups = [];
    }

    if (this.activeSeatGroupIndex !== null && this.currentSchedule.seatGroups[this.activeSeatGroupIndex]) {
      const activeGroup = this.currentSchedule.seatGroups[this.activeSeatGroupIndex];
      const idx = activeGroup.seats.indexOf(seat);

      if (idx !== -1) {
        // Remove from active group
        activeGroup.seats.splice(idx, 1);
      } else {
        // Remove from all other groups first to avoid a seat in multiple groups
        this.currentSchedule.seatGroups.forEach(g => {
          const sIdx = g.seats.indexOf(seat);
          if (sIdx !== -1) {
            g.seats.splice(sIdx, 1);
          }
        });
        // Add to active group
        activeGroup.seats.push(seat);
      }
    }
  }

  isSeatInAnyGroup(seat: string): boolean {
    if (this.currentSchedule.seatGroups && this.currentSchedule.seatGroups.length > 0) {
      return this.currentSchedule.seatGroups.some(g => g.seats.includes(seat));
    }
    return false;
  }

  // Seat Grouping Helper Actions
  addSeatGroup() {
    if (!this.currentSchedule.seatGroups) {
      this.currentSchedule.seatGroups = [];
    }
    const colorIndex = this.currentSchedule.seatGroups.length % this.presetColors.length;
    const defaultColor = this.presetColors[colorIndex];

    this.currentSchedule.seatGroups.push({
      name: '',
      color: defaultColor,
      seats: [],
      price: undefined
    });

    this.activeSeatGroupIndex = this.currentSchedule.seatGroups.length - 1;
  }

  removeSeatGroup(index: number) {
    if (this.currentSchedule.seatGroups) {
      this.currentSchedule.seatGroups.splice(index, 1);
      if (this.activeSeatGroupIndex === index) {
        this.activeSeatGroupIndex = this.currentSchedule.seatGroups.length > 0 ? 0 : null;
      } else if (this.activeSeatGroupIndex !== null && this.activeSeatGroupIndex > index) {
        this.activeSeatGroupIndex--;
      }
    }
  }

  removeActiveSeatGroup() {
    if (this.activeSeatGroupIndex !== null) {
      this.removeSeatGroup(this.activeSeatGroupIndex);
    }
  }

  toggleColorMenu(index: number, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.openedColorMenuIndex = this.openedColorMenuIndex === index ? null : index;
  }

  selectGroupColor(index: number, color: string) {
    if (this.currentSchedule.seatGroups && this.currentSchedule.seatGroups[index]) {
      this.currentSchedule.seatGroups[index].color = color;
    }
    this.openedColorMenuIndex = null;
  }

  setActiveGroup(index: number) {
    this.activeSeatGroupIndex = index;
  }

  toggleSelectionMode(index: number) {
    if (this.activeSeatGroupIndex === index) {
      this.activeSeatGroupIndex = null;
    } else {
      this.activeSeatGroupIndex = index;
    }
  }

  onSeatsStringChange(index: number, value: string) {
    if (this.currentSchedule.seatGroups && this.currentSchedule.seatGroups[index]) {
      const seatList = value
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(s => s.length > 0);
      this.currentSchedule.seatGroups[index].seats = seatList;
    }
  }

  getSeatGroupColor(seat: string): string {
    if (!this.currentSchedule.seatGroups || this.currentSchedule.seatGroups.length === 0) {
      return '';
    }
    const foundGroup = this.currentSchedule.seatGroups.find(g => g.seats.includes(seat));
    return foundGroup ? foundGroup.color : '';
  }

  closeModal() {
    this.isModalOpen = false;
    this.isDatePickerOpen = false;
  }

  onOverlayMouseDown(event: MouseEvent) {
    this.mousedownTarget = event.target as HTMLElement;
  }

  onOverlayMouseUp(event: MouseEvent, modalType: 'main' | 'alert') {
    const mouseupTarget = event.target as HTMLElement;
    if (this.mousedownTarget === mouseupTarget && mouseupTarget.classList.contains('modal-overlay')) {
      if (modalType === 'main') {
        this.closeModal();
      } else {
        this.closeAlert();
      }
    }
  }

  showAlert(message: string) {
    this.alertMessage = message;
    this.isAlertOpen = true;
  }

  closeAlert() {
    this.isAlertOpen = false;
  }

  setModalTab(tab: 'setup' | 'time') {
    this.activeModalTab = tab;
  }

  isLimousine22(): boolean {
    return this.currentSchedule.vehicleName === 'Limousine 22 phòng' ||
      (this.currentSchedule.vehicleName?.startsWith('Limousine 22 phòng') ?? false);
  }

  onVehicleSelect() {
    this.onVehicleNameSelect();
  }

  onVehicleNameSelect() {
    const selectedVeh = this.vehiclesList.find(v => v.name === this.currentSchedule.vehicleName);
    if (selectedVeh) {
      this.currentSchedule.vehiclePlate = selectedVeh.plate;
      this.currentSchedule.vehicleSeats = selectedVeh.seats;
      this.generateSeatLayout();
    } else {
      this.currentSchedule.vehiclePlate = '';
      this.currentSchedule.vehicleSeats = undefined;
      this.floorLayouts = [];
    }
  }

  onVehiclePlateSelect() {
    const selectedVeh = this.vehiclesList.find(v => v.plate === this.currentSchedule.vehiclePlate);
    if (selectedVeh) {
      this.currentSchedule.vehicleName = selectedVeh.name;
      this.currentSchedule.vehicleSeats = selectedVeh.seats;
      this.generateSeatLayout();
    } else {
      this.currentSchedule.vehicleName = '';
      this.currentSchedule.vehicleSeats = undefined;
      this.floorLayouts = [];
    }
  }

  onRouteSelect() {
    const details = this.routeDetailsMap[this.currentSchedule.routeName || ''];
    if (details) {
      this.currentSchedule.totalTime = details.time;
      this.calculateArrivalTime();
    }
  }

  updateDepartureTime() {
    let hour = Math.floor(Number(this.departureHour || 0));
    let minute = Math.floor(Number(this.departureMinute || 0));

    if (hour < 0) hour = 0;
    if (hour > 23) hour = 23;
    if (minute < 0) minute = 0;
    if (minute > 59) minute = 59;

    this.departureHour = hour;
    this.departureMinute = minute;

    const hh = hour.toString().padStart(2, '0');
    const mm = minute.toString().padStart(2, '0');
    this.currentSchedule.departureTime = `${hh}:${mm}`;
    this.calculateArrivalTime();
  }

  parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month, day);
  }

  calculateArrivalTime() {
    if (!this.currentSchedule.departureTime || !this.currentSchedule.totalTime) {
      return;
    }

    const depMatch = this.currentSchedule.departureTime.match(/^(\d{1,2})[:h](\d{1,2})p?$/) || this.currentSchedule.departureTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!depMatch) return;
    const depHours = parseInt(depMatch[1], 10);
    const depMins = parseInt(depMatch[2], 10);

    let durHours = 0;
    let durMins = 0;

    const hrMatch = this.currentSchedule.totalTime.match(/(\d+)\s*h/i);
    const minMatch = this.currentSchedule.totalTime.match(/(\d+)\s*p/i);
    const colonMatch = this.currentSchedule.totalTime.match(/^(\d{1,2}):(\d{2})$/);

    if (colonMatch) {
      durHours = parseInt(colonMatch[1], 10);
      durMins = parseInt(colonMatch[2], 10);
    } else {
      if (hrMatch) durHours = parseInt(hrMatch[1], 10);
      if (minMatch) durMins = parseInt(minMatch[1], 10);
    }

    let totalMins = depMins + durMins;
    let extraHours = Math.floor(totalMins / 60);
    let finalMins = totalMins % 60;

    let totalHours = depHours + durHours + extraHours;
    let extraDays = Math.floor(totalHours / 24);
    let finalHours = totalHours % 24;

    const formattedTime = `${finalHours.toString().padStart(2, '0')}:${finalMins.toString().padStart(2, '0')}`;
    this.currentSchedule.arrivalTime = formattedTime;

    if (this.currentSchedule.departureDate) {
      const depDate = this.parseDate(this.currentSchedule.departureDate);
      if (depDate) {
        const arrDate = new Date(depDate.getTime() + extraDays * 24 * 60 * 60 * 1000);
        this.currentSchedule.arrivalDate = this.formatDate(arrDate);
      } else {
        this.currentSchedule.arrivalDate = '';
      }
    } else {
      this.currentSchedule.arrivalDate = '';
    }
  }

  generateSeatLayout() {
    const selectedVeh = this.vehiclesList.find(v => v.plate === this.currentSchedule.vehiclePlate);
    if (!selectedVeh) {
      this.floorLayouts = [];
      return;
    }

    if (this.isLimousine22()) {
      this.generateLimousine22Layout();
      return;
    }

    const floors = selectedVeh.floors || 2;
    const rows = selectedVeh.rows || 2;
    const seats = selectedVeh.seats || 22;

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

  getDummyArray(count: number): number[] {
    return Array(Math.max(0, count)).fill(0);
  }

  saveSchedule() {
    if (!this.currentSchedule.routeName) {
      this.showAlert('Hãy chọn Tuyến đường!');
      return;
    }
    if (!this.currentSchedule.vehiclePlate) {
      this.showAlert('Hãy chọn Tên xe!');
      return;
    }
    if (!this.currentSchedule.driverName) {
      this.showAlert('Hãy chọn Tài xế!');
      return;
    }
    if (!this.currentSchedule.departureDate) {
      this.showAlert('Hãy chọn Ngày khởi hành!');
      return;
    }
    if (!this.currentSchedule.departureTime) {
      this.showAlert('Hãy nhập Giờ khởi hành!');
      return;
    }
    if (this.currentSchedule.basePrice === undefined || this.currentSchedule.basePrice === null) {
      this.showAlert('Hãy nhập Giá vé chung!');
      return;
    }

    if (this.isEditMode) {
      const index = this.schedules.findIndex(s => s.id === this.currentSchedule.id);
      if (index !== -1) {
        this.schedules[index] = { ...this.currentSchedule as Schedule };
      }
    } else {
      const newId = Math.max(...this.schedules.map(s => s.id), 0) + 1;
      const newSchedule = {
        ...this.currentSchedule,
        id: newId
      } as Schedule;
      this.schedules.unshift(newSchedule);
    }
    this.filterSchedules();
    this.closeModal();
  }

  toggleStatus() {
    if (this.currentSchedule.status === 'active' || this.currentSchedule.status === 'scheduled') {
      this.currentSchedule.status = 'locked';
    } else {
      this.currentSchedule.status = 'active';
    }
  }

  deleteSchedule() {
    if (confirm('Bạn có chắc chắn muốn xóa lịch trình này không?')) {
      const index = this.schedules.findIndex(s => s.id === this.currentSchedule.id);
      if (index !== -1) {
        this.schedules.splice(index, 1);
        this.filterSchedules();
        this.closeModal();
      }
    }
  }

  // Custom Date Picker Logic
  toggleDatePicker() {
    this.isDatePickerOpen = !this.isDatePickerOpen;
    if (this.isDatePickerOpen) {
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
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

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

  selectDate(day: number | null) {
    if (!day) return;
    const date = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
    this.currentSchedule.departureDate = this.formatDate(date);
    this.isDatePickerOpen = false;
    this.calculateArrivalTime();
  }

  formatDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  toggleOpenUnitDropdown(event: Event) {
    event.stopPropagation();
    this.showOpenUnitDropdown = !this.showOpenUnitDropdown;
    this.showCloseUnitDropdown = false;
    this.showHoldUnitDropdown = false;
  }

  toggleCloseUnitDropdown(event: Event) {
    event.stopPropagation();
    this.showCloseUnitDropdown = !this.showCloseUnitDropdown;
    this.showOpenUnitDropdown = false;
    this.showHoldUnitDropdown = false;
  }

  toggleHoldUnitDropdown(event: Event) {
    event.stopPropagation();
    this.showHoldUnitDropdown = !this.showHoldUnitDropdown;
    this.showOpenUnitDropdown = false;
    this.showCloseUnitDropdown = false;
  }

  selectOpenUnit(unit: 'day' | 'hour' | 'minute') {
    this.currentSchedule.openUnit = unit;
    this.showOpenUnitDropdown = false;
  }

  selectCloseUnit(unit: 'day' | 'hour' | 'minute') {
    this.currentSchedule.closeUnit = unit;
    this.showCloseUnitDropdown = false;
  }

  selectHoldUnit(unit: 'day' | 'hour' | 'minute') {
    this.currentSchedule.holdUnit = unit;
    this.showHoldUnitDropdown = false;
  }

  getUnitLabel(unit: 'day' | 'hour' | 'minute' | undefined): string {
    if (unit === 'day') return 'Ngày';
    if (unit === 'hour') return 'Giờ';
    if (unit === 'minute') return 'Phút';
    return 'Phút';
  }
}
