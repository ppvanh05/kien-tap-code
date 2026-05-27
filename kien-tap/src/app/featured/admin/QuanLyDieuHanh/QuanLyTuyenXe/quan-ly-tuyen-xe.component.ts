import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuyenXeService, Route } from '../tuyen-xe.service';
import { CustomSelectComponent } from '../custom-select.component';

@Component({
  selector: 'app-quan-ly-tuyen-xe',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './quan-ly-tuyen-xe.component.html',
  styleUrls: ['./quan-ly-tuyen-xe.component.css']
})
export class QuanLyTuyenXeComponent implements OnInit {
  activeTab: 'all' | 'active' | 'locked' = 'all';
  searchStartPoint: string = '';
  searchEndPoint: string = '';

  routes: Route[] = [];
  filteredRoutes: Route[] = [];
  isModalOpen = false;
  isEditMode = false;
  currentRoute: Partial<Route> = {};

  // Alert State
  isAlertOpen = false;
  alertMessage = '';

  provinces = [
    'An Giang', 'Bà Rịa – Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định',
    'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cần Thơ', 'Cao Bằng', 'Đà Nẵng', 'Đắk Lắk',
    'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội',
    'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'TP. Hồ Chí Minh', 'Hòa Bình', 'Hưng Yên',
    'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An',
    'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam',
    'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình',
    'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên – Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
    'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
  ];

  sortBy: 'distance' | 'time' | 'newest' = 'newest';
  sortOrder: 'asc' | 'desc' = 'desc';

  get provinceOptions() {
    return this.provinces.map(p => ({ value: p, label: p }));
  }

  activeDropdown: 'start' | 'end' | null = null;

  toggleDropdown(type: 'start' | 'end', event: MouseEvent) {
    event.stopPropagation();
    if (this.activeDropdown === type) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = type;
    }
  }

  selectPoint(type: 'start' | 'end', value: string) {
    if (type === 'start') {
      this.searchStartPoint = value;
    } else {
      this.searchEndPoint = value;
    }
    this.activeDropdown = null;
  }

  @HostListener('document:click')
  closeDropdowns() {
    this.activeDropdown = null;
  }

  constructor(private tuyenXeService: TuyenXeService) { }

  ngOnInit() {
    this.routes = this.tuyenXeService.getRoutes();
    this.filterRoutes();
  }

  setTab(tab: 'all' | 'active' | 'locked') {
    this.activeTab = tab;
    this.filterRoutes();
  }

  filterRoutes() {
    let result = this.routes.filter(route => {
      const matchesTab = this.activeTab === 'all' ||
        (this.activeTab === 'active' && route.status === 'active') ||
        (this.activeTab === 'locked' && route.status === 'locked');

      const matchesStart = !this.searchStartPoint || route.startProvince === this.searchStartPoint;
      const matchesEnd = !this.searchEndPoint || route.endProvince === this.searchEndPoint;

      return matchesTab && matchesStart && matchesEnd;
    });

    // Sorting logic
    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (this.sortBy === 'distance') {
        valA = a.distance || 0;
        valB = b.distance || 0;
      } else if (this.sortBy === 'time') {
        valA = (a.estimatedHours || 0) * 60 + (a.estimatedMinutes || 0);
        valB = (b.estimatedHours || 0) * 60 + (b.estimatedMinutes || 0);
      } else if (this.sortBy === 'newest') {
        valA = a.createdAt.getTime();
        valB = b.createdAt.getTime();
        return this.sortOrder === 'desc' ? valB - valA : valA - valB;
      }

      return this.sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    this.filteredRoutes = result;
  }

  clearFilters() {
    this.searchStartPoint = '';
    this.searchEndPoint = '';
    this.sortBy = 'newest';
    this.sortOrder = 'desc';
    this.filterRoutes();
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentRoute = {
      status: 'active',
      startProvince: '',
      endProvince: '',
      distance: 0,
      estimatedHours: 0,
      estimatedMinutes: 0,
      createdAt: new Date()
    };
    this.isModalOpen = true;
  }

  openEditModal(route: Route) {
    this.isEditMode = true;
    this.currentRoute = { ...route };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
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

  saveRoute() {
    // Validation
    if (!this.currentRoute.startPoint) {
      this.showAlert('Hãy điền thông tin Điểm đầu!');
      return;
    }
    if (!this.currentRoute.startProvince) {
      this.showAlert('Hãy chọn Tỉnh/Thành phố cho Điểm đầu!');
      return;
    }
    if (!this.currentRoute.endPoint) {
      this.showAlert('Hãy điền thông tin Điểm cuối!');
      return;
    }
    if (!this.currentRoute.endProvince) {
      this.showAlert('Hãy chọn Tỉnh/Thành phố cho Điểm cuối!');
      return;
    }
    if (!this.currentRoute.distance || this.currentRoute.distance <= 0) {
      this.showAlert('Hãy điền thông tin Khoảng cách và phải lớn hơn 0!');
      return;
    }
    if ((this.currentRoute.estimatedHours === undefined || this.currentRoute.estimatedHours === null) && 
        (this.currentRoute.estimatedMinutes === undefined || this.currentRoute.estimatedMinutes === null)) {
      this.showAlert('Hãy điền thông tin Thời gian di chuyển dự kiến!');
      return;
    }
    if (this.currentRoute.estimatedHours === 0 && this.currentRoute.estimatedMinutes === 0) {
      this.showAlert('Thời gian di chuyển dự kiến phải lớn hơn 0!');
      return;
    }

    if (this.isEditMode) {
      this.tuyenXeService.updateRoute(this.currentRoute.id!, this.currentRoute);
    } else {
      this.tuyenXeService.addRoute({
        ...this.currentRoute,
        name: `${this.currentRoute.startPoint} - ${this.currentRoute.endPoint}`
      } as Omit<Route, 'id'>);
    }
    this.routes = this.tuyenXeService.getRoutes();
    this.filterRoutes();
    this.closeModal();
  }

  toggleStatus() {
    if (this.currentRoute.status === 'active') {
      this.currentRoute.status = 'locked';
    } else {
      this.currentRoute.status = 'active';
    }
  }

  deleteRoute() {
    if (confirm('Bạn có chắc chắn muốn xóa tuyến xe này không?')) {
      this.tuyenXeService.deleteRoute(this.currentRoute.id!);
      this.routes = this.tuyenXeService.getRoutes();
      this.filterRoutes();
      this.closeModal();
    }
  }
}
