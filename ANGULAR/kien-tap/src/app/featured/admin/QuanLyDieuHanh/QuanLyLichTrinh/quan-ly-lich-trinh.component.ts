import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuyenXeService } from '../tuyen-xe.service';
import { TaiXeService } from '../tai-xe.service';
import { PhuongTienService } from '../phuong-tien.service';
import { environment } from '../../../../../environments/environment';

import { CustomSelectComponent } from '../custom-select.component';
import { DiemDonTraService } from '../diem-don-tra.service';
import { HttpClient } from '@angular/common/http';

export interface SeatGroup {
  name: string;
  color: string;
  seats: string[];
  price?: number;
}

interface Schedule {
  id: string | number;
  routeName: string;
  vehiclePlate: string;
  vehicleName: string;
  vehicleSeats?: number;
  driverName: string;
  assistantName: string;
  departureDate: string;
  departureTime: string;
  status: 'DangChay' | 'ChoKhoiHanh' | 'DaKhoa' | 'HoanThanh' | '';
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
  pickupHour?: number;
  pickupMinute?: number;
  pickupDate?: string;
  pickupPoints?: { point: string; hour?: number; minute?: number; date?: string; }[];
  dropoffType: string;
  dropoffPoint: string;
  dropoffHour?: number;
  dropoffMinute?: number;
  dropoffDate?: string;
  dropoffPoints?: { point: string; hour?: number; minute?: number; date?: string; }[];

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
  activeTab: 'all' | 'DangChay' | 'ChoKhoiHanh' | 'HoanThanh' | 'DaKhoa' = 'all';
  selectedRoute: string = '';
  mousedownTarget: HTMLElement | null = null;

  get statusFormOptions() {
    return [
      { value: 'ChoKhoiHanh', label: 'Chờ khởi hành' },
      { value: 'DangChay', label: 'Đang chạy' },
      { value: 'HoanThanh', label: 'Hoàn thành' }
    ];
  }

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

  get routesList(): { name: string, status: 'active' | 'locked' }[] {
    return this.tuyenXeService.getRoutes().map(r => ({ name: r.name, status: r.status }));
  }

  get routeDetailsMap(): { [key: string]: { time: string, distance: string } } {
    const map: { [key: string]: { time: string, distance: string } } = {};
    this.tuyenXeService.getRoutes().forEach(r => {
      map[r.name] = {
        time: `${r.estimatedHours}h ${r.estimatedMinutes}p`,
        distance: r.distance.toString()
      };
    });
    return map;
  }

  get vehiclesList(): { name: string, plate: string, seats: number, status: 'active' | 'locked', floors?: number, rows?: number, type: string }[] {
    return this.phuongTienService.getVehicles().map(v => ({
      name: v.name,
      plate: v.licensePlate,
      seats: v.seats,
      status: v.status,
      floors: v.floors,
      rows: v.rows,
      type: v.type
    }));
  }

  get driversList(): { name: string, status: 'active' | 'locked' }[] {
    return this.taiXeService.getDriversList();
  }

  get assistantsList(): { name: string, status: 'active' | 'locked' }[] {
    return this.taiXeService.getAssistantsList();
  }

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

  schedules: Schedule[] = [];

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
  isLoading = false;
  isBrowser = false;

  // Transit Date Pickers State
  activePickupDatePickerIndex: number | null = null;
  activeDropoffDatePickerIndex: number | null = null;
  transitViewDate: Date = new Date();
  transitCalendarDays: (number | null)[] = [];
  transitPickerViewMode: 'day' | 'month' | 'year' = 'day';
  transitYearRangeStart: number = 2026;

  floorLayouts: any[] = [];

  get yearsList(): number[] {
    return Array.from({ length: 12 }, (_, i) => this.yearRangeStart + i);
  }

  get transitYearsList(): number[] {
    return Array.from({ length: 12 }, (_, i) => this.transitYearRangeStart + i);
  }

  constructor(
    private tuyenXeService: TuyenXeService,
    private taiXeService: TaiXeService,
    private phuongTienService: PhuongTienService,
    private diemDonTraService: DiemDonTraService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isBrowser = typeof window !== 'undefined';
    this.filterSchedules();

    if (this.isBrowser) {
      this.refreshSchedules();
      setTimeout(() => {
        this.filterSchedules();
        this.cdr.detectChanges();
      }, 100);
    }
  }

  refreshSchedules() {
    if (typeof window === 'undefined') return;
    const todayStr = this.formatDate(new Date());
    const getMockSchedules = (): Schedule[] => [
      {
        id: 1,
        routeName: 'Hà Nội - SaPa',
        vehiclePlate: '15B-888.99',
        vehicleName: 'Limousine 22 phòng',
        vehicleSeats: 22,
        driverName: 'Nguyễn Văn Hùng',
        assistantName: 'Lê Văn Nam',
        departureDate: todayStr,
        departureTime: '08:00',
        status: 'ChoKhoiHanh',
        createdAt: new Date(),
        autoRun: false,
        allowSeatSelection: true,
        totalTime: '5h 30p',
        arrivalTime: '13:30',
        frequency: 'Hàng ngày',
        openValue: 10,
        openUnit: 'day',
        closeValue: 30,
        closeUnit: 'minute',
        holdValue: 15,
        holdUnit: 'minute',
        pickupType: 'Không trung chuyển đón',
        pickupPoint: '',
        pickupHour: 8,
        pickupMinute: 0,
        pickupDate: todayStr,
        pickupPoints: [
          {
            point: 'Bến xe Mỹ Đình',
            hour: 8,
            minute: 0,
            date: todayStr
          }
        ],
        dropoffType: 'Không trung chuyển trả',
        dropoffPoint: '',
        dropoffHour: 13,
        dropoffMinute: 30,
        dropoffDate: todayStr,
        dropoffPoints: [
          {
            point: 'Bến xe SaPa',
            hour: 13,
            minute: 30,
            date: todayStr
          }
        ],
        basePrice: 250000,
        selectedSeats: [],
        seatGroups: []
      },
      {
        id: 2,
        routeName: 'Hà Nội - Hải Phòng',
        vehiclePlate: '29B-123.45',
        vehicleName: 'Xe giường nằm 36 chỗ',
        vehicleSeats: 36,
        driverName: 'Trần Thanh Sơn',
        assistantName: '',
        departureDate: todayStr,
        departureTime: '10:00',
        status: 'DangChay',
        createdAt: new Date(),
        autoRun: false,
        allowSeatSelection: true,
        totalTime: '2h 0p',
        arrivalTime: '12:00',
        frequency: 'Hàng ngày',
        openValue: 10,
        openUnit: 'day',
        closeValue: 30,
        closeUnit: 'minute',
        holdValue: 15,
        holdUnit: 'minute',
        pickupType: 'Không trung chuyển đón',
        pickupPoint: '',
        pickupHour: 10,
        pickupMinute: 0,
        pickupDate: todayStr,
        pickupPoints: [
          {
            point: 'Bến xe Mỹ Đình',
            hour: 10,
            minute: 0,
            date: todayStr
          }
        ],
        dropoffType: 'Không trung chuyển trả',
        dropoffPoint: '',
        dropoffHour: 12,
        dropoffMinute: 0,
        dropoffDate: todayStr,
        dropoffPoints: [
          {
            point: 'Bến xe Vĩnh Niệm',
            hour: 12,
            minute: 0,
            date: todayStr
          }
        ],
        basePrice: 150000,
        selectedSeats: [],
        seatGroups: []
      }
    ];

    this.http.get<any[]>(environment.apiBase + '/dieu-hanh/lich-trinh').subscribe({
      next: (data) => {
        setTimeout(() => {
          console.log('LỊCH TRÌNH DATA RECEIVED:', data ? data.length : null, data);
          this.isLoading = false;
          if (!data || data.length === 0) {
            this.schedules = getMockSchedules();
          } else {
            this.schedules = data.map(s => {
              const depDate = s.NgayKhoiHanh ? new Date(s.NgayKhoiHanh) : new Date();
              const depTime = s.GioKhoiHanh ? new Date(s.GioKhoiHanh) : new Date();
              const arrTime = s.GioDenDuKien ? new Date(s.GioDenDuKien) : new Date();
              const durationHours = s.TUYEN_XE?.ThoiGianDiChuyenDuKien ? new Date(s.TUYEN_XE.ThoiGianDiChuyenDuKien).getHours() : 0;
              const durationMins = s.TUYEN_XE?.ThoiGianDiChuyenDuKien ? new Date(s.TUYEN_XE.ThoiGianDiChuyenDuKien).getMinutes() : 0;

              const pickupPoints = s.LICH_TRINH_DIEM_DUNG
                ? s.LICH_TRINH_DIEM_DUNG.filter((pt: any) => pt.DIEM_DON_TRA_DUNG?.LoaiDiem === 'DiemDonTra').map((pt: any) => {
                    const hasNgay = !!pt.Ngay;
                    const ptDate = pt.GioDenDuKien ? new Date(pt.GioDenDuKien) : depDate;
                    const actualDate = pt.Ngay ? new Date(pt.Ngay) : ((ptDate.getFullYear() > 1970) ? ptDate : depDate);
                    return {
                      point: pt.DIEM_DON_TRA_DUNG?.TenDiem || '',
                      hour: pt.GioDenDuKien ? new Date(pt.GioDenDuKien).getUTCHours() : 8,
                      minute: pt.GioDenDuKien ? new Date(pt.GioDenDuKien).getUTCMinutes() : 0,
                      date: hasNgay ? this.formatDateUTC(actualDate) : this.formatDate(actualDate)
                    };
                  })
                : [];

              const dropoffPoints = s.LICH_TRINH_DIEM_DUNG
                ? s.LICH_TRINH_DIEM_DUNG.filter((pt: any) => pt.DIEM_DON_TRA_DUNG?.LoaiDiem === 'DiemDung').map((pt: any) => {
                    const hasNgay = !!pt.Ngay;
                    const ptDate = pt.GioDenDuKien ? new Date(pt.GioDenDuKien) : depDate;
                    const actualDate = pt.Ngay ? new Date(pt.Ngay) : ((ptDate.getFullYear() > 1970) ? ptDate : depDate);
                    return {
                      point: pt.DIEM_DON_TRA_DUNG?.TenDiem || '',
                      hour: pt.GioDenDuKien ? new Date(pt.GioDenDuKien).getUTCHours() : 17,
                      minute: pt.GioDenDuKien ? new Date(pt.GioDenDuKien).getUTCMinutes() : 0,
                      date: hasNgay ? this.formatDateUTC(actualDate) : this.formatDate(actualDate)
                    };
                  })
                : [];

              return {
                id: s.MaLichTrinh,
                routeName: s.TUYEN_XE?.TenTuyenXe || '',
                vehiclePlate: s.PHUONG_TIEN?.BienSoXe || '',
                vehicleName: s.PHUONG_TIEN?.TenXe || '',
                vehicleSeats: s.PHUONG_TIEN?.SoGhe || 22,
                driverName: s.PHAN_CONG_CHUYEN?.find((pc: any) => pc.VaiTro === 'Tài xế chính')?.TAI_XE_PHU_XE?.HoTen || '',
                assistantName: s.PHAN_CONG_CHUYEN?.find((pc: any) => pc.VaiTro === 'Phụ xe')?.TAI_XE_PHU_XE?.HoTen || '',
                departureDate: this.formatDate(depDate),
                departureTime: `${depTime.getUTCHours().toString().padStart(2, '0')}:${depTime.getUTCMinutes().toString().padStart(2, '0')}`,
                status: s.TrangThaiLichTrinh || 'ChoKhoiHanh',
                createdAt: depDate,
                autoRun: false,
                allowSeatSelection: true,
                totalTime: `${durationHours}h ${durationMins}p`,
                arrivalTime: `${arrTime.getUTCHours().toString().padStart(2, '0')}:${arrTime.getUTCMinutes().toString().padStart(2, '0')}`,
                frequency: 'Hàng ngày',
                openValue: 10,
                openUnit: 'day',
                closeValue: 30,
                closeUnit: 'minute',
                holdValue: 15,
                holdUnit: 'minute',
                pickupType: 'Không trung chuyển đón',
                pickupPoint: pickupPoints[0]?.point || '',
                pickupPoints: pickupPoints.length > 0 ? pickupPoints : [
                  {
                    point: (s.TUYEN_XE?.TenTuyenXe && s.TUYEN_XE.TenTuyenXe.includes('-')) ? s.TUYEN_XE.TenTuyenXe.split('-')[0].trim() : (s.TUYEN_XE?.TenTuyenXe || ''),
                    hour: 8,
                    minute: 0,
                    date: this.formatDate(depDate)
                  }
                ],
                dropoffType: 'Không trung chuyển trả',
                dropoffPoint: dropoffPoints[0]?.point || '',
                dropoffPoints: dropoffPoints.length > 0 ? dropoffPoints : [
                  {
                    point: (s.TUYEN_XE?.TenTuyenXe && s.TUYEN_XE.TenTuyenXe.includes('-')) ? s.TUYEN_XE.TenTuyenXe.split('-')[1].trim() : (s.TUYEN_XE?.TenTuyenXe || ''),
                    hour: 17,
                    minute: 0,
                    date: this.formatDate(depDate)
                  }
                ],
                basePrice: Number(s.GiaVeCoBan || 200000)
              };
            });
          }
          this.filterSchedules();
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        setTimeout(() => {
          console.error('Lỗi khi tải lịch trình:', err);
          this.isLoading = false;
          this.schedules = getMockSchedules();
          this.filterSchedules();
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isDatePickerOpen = false;
    this.activePickupDatePickerIndex = null;
    this.activeDropoffDatePickerIndex = null;
    this.openedColorMenuIndex = null;
    this.showOpenUnitDropdown = false;
    this.showCloseUnitDropdown = false;
    this.showHoldUnitDropdown = false;
  }

  setTab(tab: 'all' | 'DangChay' | 'ChoKhoiHanh' | 'HoanThanh' | 'DaKhoa') {
    this.activeTab = tab;
    this.filterSchedules();
  }

  filterSchedules() {
    let result = this.schedules.filter(s => {
      const matchesTab = this.activeTab === 'all' || s.status === this.activeTab;
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
    this.errors = {};
    this.currentSchedule = {
      status: '',
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
      pickupHour: 8,
      pickupMinute: 0,
      pickupDate: this.formatDate(new Date()),
      pickupPoints: [
        {
          point: '',
          hour: 8,
          minute: 0,
          date: this.formatDate(new Date())
        }
      ],
      dropoffType: 'Không trung chuyển trả',
      dropoffPoint: '',
      dropoffHour: 17,
      dropoffMinute: 0,
      dropoffDate: this.formatDate(new Date()),
      dropoffPoints: [
        {
          point: '',
          hour: 17,
          minute: 0,
          date: this.formatDate(new Date())
        }
      ],
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
    this.errors = {};
    this.currentSchedule = {
      ...schedule,
      selectedSeats: schedule.selectedSeats ? [...schedule.selectedSeats] : [],
      seatGroups: schedule.seatGroups ? JSON.parse(JSON.stringify(schedule.seatGroups)) : [],
      pickupHour: schedule.pickupHour || 8,
      pickupMinute: schedule.pickupMinute || 0,
      pickupDate: schedule.pickupDate || schedule.departureDate || this.formatDate(new Date()),
      pickupPoints: schedule.pickupPoints && schedule.pickupPoints.length > 0
        ? JSON.parse(JSON.stringify(schedule.pickupPoints))
        : [
            {
              point: schedule.pickupPoint || '',
              hour: schedule.pickupHour || 8,
              minute: schedule.pickupMinute || 0,
              date: schedule.pickupDate || schedule.departureDate || this.formatDate(new Date())
            }
          ],
      dropoffHour: schedule.dropoffHour || 17,
      dropoffMinute: schedule.dropoffMinute || 0,
      dropoffDate: schedule.dropoffDate || schedule.arrivalDate || schedule.departureDate || this.formatDate(new Date()),
      dropoffPoints: schedule.dropoffPoints && schedule.dropoffPoints.length > 0
        ? JSON.parse(JSON.stringify(schedule.dropoffPoints))
        : [
            {
              point: schedule.dropoffPoint || '',
              hour: schedule.dropoffHour || 17,
              minute: schedule.dropoffMinute || 0,
              date: schedule.dropoffDate || schedule.arrivalDate || schedule.departureDate || this.formatDate(new Date())
            }
          ]
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

  getCurrentVehicleFloors(): any[] {
    return this.floorLayouts;
  }

  errors: {
    routeName?: boolean;
    vehiclePlate?: boolean;
    driverName?: boolean;
    departureDate?: boolean;
    departureTime?: boolean;
    basePrice?: boolean;
    status?: boolean;
  } = {};

  closeModal() {
    this.isModalOpen = false;
    this.isDatePickerOpen = false;
    this.activePickupDatePickerIndex = null;
    this.activeDropoffDatePickerIndex = null;
    this.errors = {};
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
    const plate = this.currentSchedule.vehiclePlate;
    const name = this.currentSchedule.vehicleName;
    const veh = this.vehiclesList.find(v => (plate && v.plate === plate) || (name && v.name === name));
    if (veh) {
      return veh.seats === 22 || veh.type === 'Limousine 22 phòng' || veh.type?.includes('22');
    }
    return name === 'Limousine 22 phòng' || (name?.includes('22') ?? false);
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

  onPickupPointChange(index: number) {
    if (!this.currentSchedule.pickupPoints) return;
    const points = this.currentSchedule.pickupPoints;
    if (index === points.length - 1 && points[index].point) {
      points.push({
        point: '',
        hour: 8,
        minute: 0,
        date: this.formatDate(new Date())
      });
    }
  }

  onDropoffPointChange(index: number) {
    if (!this.currentSchedule.dropoffPoints) return;
    const points = this.currentSchedule.dropoffPoints;
    if (index === points.length - 1 && points[index].point) {
      points.push({
        point: '',
        hour: 17,
        minute: 0,
        date: this.formatDate(new Date())
      });
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
    this.errors = {
      routeName: !this.currentSchedule.routeName,
      vehiclePlate: !this.currentSchedule.vehiclePlate,
      driverName: !this.currentSchedule.driverName,
      status: !this.currentSchedule.status,
      departureDate: !this.currentSchedule.departureDate,
      departureTime: !this.currentSchedule.departureTime,
      basePrice: this.currentSchedule.basePrice === undefined || this.currentSchedule.basePrice === null || isNaN(Number(this.currentSchedule.basePrice))
    };

    if (Object.values(this.errors).some(Boolean)) {
      // Automatically switch to the tab that has the validation error
      if (this.errors.routeName || this.errors.vehiclePlate || this.errors.driverName || this.errors.status) {
        this.activeModalTab = 'setup';
      } else {
        this.activeModalTab = 'time';
      }
      return;
    }

    if (this.isEditMode) {
      const index = this.schedules.findIndex(s => s.id === this.currentSchedule.id);
      if (index !== -1) {
        this.schedules[index] = { ...this.currentSchedule as Schedule };
      }
      this.http.put(`${environment.apiBase}/dieu-hanh/lich-trinh/${this.currentSchedule.id}`, this.currentSchedule).subscribe({
        next: () => this.refreshSchedules(),
        error: (err) => console.error('Lỗi khi cập nhật lịch trình:', err)
      });
    } else {
      const tempId = 'TEMP_' + Math.random().toString(36).substr(2, 9);
      const newSchedule = {
        ...this.currentSchedule,
        id: tempId
      } as Schedule;
      this.schedules.unshift(newSchedule);

      this.http.post<any>(environment.apiBase + '/dieu-hanh/lich-trinh', this.currentSchedule).subscribe({
        next: (res) => {
          newSchedule.id = res.MaLichTrinh;
          this.refreshSchedules();
        },
        error: (err) => console.error('Lỗi khi thêm lịch trình:', err)
      });
    }
    this.filterSchedules();
    this.closeModal();
  }

  toggleStatus() {
    if (this.currentSchedule.status === 'DangChay' || this.currentSchedule.status === 'ChoKhoiHanh') {
      this.currentSchedule.status = 'DaKhoa';
    } else {
      this.currentSchedule.status = 'DangChay';
    }
  }

  deleteSchedule() {
    if (confirm('Bạn có chắc chắn muốn xóa lịch trình này không?')) {
      const index = this.schedules.findIndex(s => s.id === this.currentSchedule.id);
      if (index !== -1) {
        const id = this.schedules[index].id;
        this.schedules.splice(index, 1);
        this.http.delete(`${environment.apiBase}/dieu-hanh/lich-trinh/${id}`).subscribe({
          next: () => this.refreshSchedules(),
          error: (err) => console.error('Lỗi khi xóa lịch trình:', err)
        });
        this.filterSchedules();
        this.closeModal();
      }
    }
  }

  // Custom Date Picker Logic
  toggleDatePicker() {
    this.isDatePickerOpen = !this.isDatePickerOpen;
    if (this.isDatePickerOpen) {
      this.activePickupDatePickerIndex = null;
      this.activeDropoffDatePickerIndex = null;
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

  formatDateUTC(date: Date): string {
    const d = date.getUTCDate().toString().padStart(2, '0');
    const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const y = date.getUTCFullYear();
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

  // Transit Custom Date Picker Logic
  toggleTransitDatePicker(type: 'pickup' | 'dropoff', index: number, event: Event) {
    event.stopPropagation();
    this.isDatePickerOpen = false;
    if (type === 'pickup') {
      if (this.activePickupDatePickerIndex === index) {
        this.activePickupDatePickerIndex = null;
      } else {
        this.activePickupDatePickerIndex = index;
        this.activeDropoffDatePickerIndex = null;
        const currentDateStr = this.currentSchedule.pickupPoints?.[index]?.date;
        this.initTransitCalendar(currentDateStr);
      }
    } else {
      if (this.activeDropoffDatePickerIndex === index) {
        this.activeDropoffDatePickerIndex = null;
      } else {
        this.activeDropoffDatePickerIndex = index;
        this.activePickupDatePickerIndex = null;
        const currentDateStr = this.currentSchedule.dropoffPoints?.[index]?.date;
        this.initTransitCalendar(currentDateStr);
      }
    }
  }

  initTransitCalendar(dateStr: string | undefined) {
    if (dateStr) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          this.transitViewDate = new Date(y, m, 1);
        } else {
          this.transitViewDate = new Date();
          this.transitViewDate.setDate(1);
        }
      } else {
        this.transitViewDate = new Date();
        this.transitViewDate.setDate(1);
      }
    } else {
      this.transitViewDate = new Date();
      this.transitViewDate.setDate(1);
    }
    this.transitPickerViewMode = 'day';
    this.generateTransitCalendar();
  }

  setTransitPickerView(mode: 'day' | 'month' | 'year') {
    this.transitPickerViewMode = mode;
    if (mode === 'year') {
      this.transitYearRangeStart = this.transitViewDate.getFullYear() - (this.transitViewDate.getFullYear() % 12);
    }
  }

  selectTransitMonth(monthIndex: number) {
    this.transitViewDate.setMonth(monthIndex);
    this.transitPickerViewMode = 'day';
    this.generateTransitCalendar();
  }

  selectTransitYear(year: number) {
    this.transitViewDate.setFullYear(year);
    this.transitPickerViewMode = 'month';
  }

  generateTransitCalendar() {
    const year = this.transitViewDate.getFullYear();
    const month = this.transitViewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let startDay = firstDay === 0 ? 6 : firstDay - 1;

    this.transitCalendarDays = [];
    for (let i = 0; i < startDay; i++) {
      this.transitCalendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      this.transitCalendarDays.push(i);
    }
  }

  prevTransit() {
    if (this.transitPickerViewMode === 'day') {
      this.transitViewDate = new Date(this.transitViewDate.getFullYear(), this.transitViewDate.getMonth() - 1, 1);
      this.generateTransitCalendar();
    } else if (this.transitPickerViewMode === 'month') {
      this.transitViewDate = new Date(this.transitViewDate.getFullYear() - 1, this.transitViewDate.getMonth(), 1);
    } else if (this.transitPickerViewMode === 'year') {
      this.transitYearRangeStart -= 12;
    }
  }

  nextTransit() {
    if (this.transitPickerViewMode === 'day') {
      this.transitViewDate = new Date(this.transitViewDate.getFullYear(), this.transitViewDate.getMonth() + 1, 1);
      this.generateTransitCalendar();
    } else if (this.transitPickerViewMode === 'month') {
      this.transitViewDate = new Date(this.transitViewDate.getFullYear() + 1, this.transitViewDate.getMonth(), 1);
    } else if (this.transitPickerViewMode === 'year') {
      this.transitYearRangeStart += 12;
    }
  }

  selectTransitDate(day: number | null, type: 'pickup' | 'dropoff', index: number) {
    if (!day) return;
    const date = new Date(this.transitViewDate.getFullYear(), this.transitViewDate.getMonth(), day);
    const dateStr = this.formatDate(date);
    if (type === 'pickup') {
      if (this.currentSchedule.pickupPoints?.[index]) {
        this.currentSchedule.pickupPoints[index].date = dateStr;
      }
      this.activePickupDatePickerIndex = null;
    } else {
      if (this.currentSchedule.dropoffPoints?.[index]) {
        this.currentSchedule.dropoffPoints[index].date = dateStr;
      }
      this.activeDropoffDatePickerIndex = null;
    }
  }
}
