import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../custom-select.component';
import { DiemDonTraService, DiemDonTra } from '../diem-don-tra.service';

@Component({
  selector: 'app-quan-ly-diem-don-tra-dung',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './quan-ly-diem-don-tra-dung.component.html',
  styleUrls: ['./quan-ly-diem-don-tra-dung.component.css']
})
export class QuanLyDiemDonTraDungComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef, private diemDonTraService: DiemDonTraService) {}

  activeTab: 'don-tra' | 'dung' | 'locked' = 'don-tra';
  searchQueries: { [key in 'don-tra' | 'dung' | 'locked']: string } = {
    'don-tra': '',
    'dung': '',
    'locked': ''
  };

  get cityFilterOptions() {
    const options = this.citiesList.map(c => ({ value: c, label: c }));
    return [{ value: 'all', label: 'Tỉnh / thành phố' }, ...options];
  }

  get typeFilterOptions() {
    return [
      { value: 'all', label: 'Loại địa điểm' },
      { value: 'don-tra', label: 'Điểm đón trả' },
      { value: 'dung', label: 'Điểm dừng chân' }
    ];
  }

  get cityFormOptions() {
    return this.citiesList.map(c => ({ value: c, label: c }));
  }
  cityFilters: { [key in 'don-tra' | 'dung' | 'locked']: string } = {
    'don-tra': 'all',
    'dung': 'all',
    'locked': 'all'
  };

  typeFilters: { [key in 'don-tra' | 'dung' | 'locked']: string } = {
    'don-tra': 'all',
    'dung': 'all',
    'locked': 'all'
  };

  appliedSearchQueries: { [key in 'don-tra' | 'dung' | 'locked']: string } = {
    'don-tra': '',
    'dung': '',
    'locked': ''
  };
  appliedCityFilters: { [key in 'don-tra' | 'dung' | 'locked']: string } = {
    'don-tra': 'all',
    'dung': 'all',
    'locked': 'all'
  };
  appliedTypeFilters: { [key in 'don-tra' | 'dung' | 'locked']: string } = {
    'don-tra': 'all',
    'dung': 'all',
    'locked': 'all'
  };

  get points() {
    return this.diemDonTraService.getPoints();
  }

  filteredPoints: DiemDonTra[] = [];
  isModalOpen = false;
  isEditMode = false;
  currentPoint: Partial<DiemDonTra> = {};

  // Custom Alert State
  isAlertOpen = false;
  alertMessage = '';

  // Uploading state
  isUploadingImage = false;

  citiesList = [
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

  ngOnInit() {
    this.filterPoints();
  }

  setTab(tab: 'don-tra' | 'dung' | 'locked') {
    this.activeTab = tab;
    this.filterPoints();
  }

  filterPoints() {
    const currentQuery = this.appliedSearchQueries[this.activeTab];
    const currentCity = this.appliedCityFilters[this.activeTab];
    const currentType = this.appliedTypeFilters[this.activeTab];

    this.filteredPoints = this.points.filter(p => {
      let matchesTab = false;
      if (this.activeTab === 'don-tra') {
        matchesTab = p.status === 'active' && p.type === 'don-tra';
      } else if (this.activeTab === 'dung') {
        matchesTab = p.status === 'active' && p.type === 'dung';
      } else if (this.activeTab === 'locked') {
        matchesTab = p.status === 'locked';
        if (matchesTab && currentType !== 'all') {
          matchesTab = p.type === currentType;
        }
      }

      const matchesCity = currentCity === 'all' || p.city === currentCity;
      const matchesSearch = !currentQuery ||
                           p.name.toLowerCase().includes(currentQuery.toLowerCase());
      return matchesTab && matchesCity && matchesSearch;
    });
  }

  applyFilter() {
    this.appliedSearchQueries[this.activeTab] = this.searchQueries[this.activeTab];
    this.appliedCityFilters[this.activeTab] = this.cityFilters[this.activeTab];
    this.appliedTypeFilters[this.activeTab] = this.typeFilters[this.activeTab];
    this.filterPoints();
  }

  clearFilter() {
    this.searchQueries[this.activeTab] = '';
    this.cityFilters[this.activeTab] = 'all';
    this.typeFilters[this.activeTab] = 'all';
    this.appliedSearchQueries[this.activeTab] = '';
    this.appliedCityFilters[this.activeTab] = 'all';
    this.appliedTypeFilters[this.activeTab] = 'all';
    this.filterPoints();
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentPoint = {
      status: 'active',
      type: this.activeTab === 'dung' ? 'dung' : 'don-tra',
      city: '',
      image: null,
      mapLink: ''
    };
    this.isUploadingImage = false;
    this.isModalOpen = true;
  }

  openEditModal(point: DiemDonTra) {
    this.isEditMode = true;
    this.currentPoint = { ...point };
    this.isUploadingImage = false;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  mousedownTarget: HTMLElement | null = null;

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

  savePoint() {
    // Validation
    if (!this.currentPoint.name) {
      this.showAlert('Hãy điền thông tin Tên điểm đón trả!');
      return;
    }
    if (!this.currentPoint.type) {
      this.showAlert('Hãy chọn loại địa điểm!');
      return;
    }
    if (!this.currentPoint.city) {
      this.showAlert('Hãy chọn Tỉnh / thành phố!');
      return;
    }
    if (!this.currentPoint.address) {
      this.showAlert('Hãy điền thông tin Địa chỉ!');
      return;
    }

    if (this.isEditMode) {
      this.diemDonTraService.savePoint(this.currentPoint as DiemDonTra);
    } else {
      this.diemDonTraService.addPoint(this.currentPoint as Omit<DiemDonTra, 'id'>);
    }

    this.filterPoints();
    this.closeModal();
  }

  toggleStatus() {
    if (this.currentPoint.status === 'active') {
      this.currentPoint.status = 'locked';
    } else {
      this.currentPoint.status = 'active';
    }
  }

  deletePoint() {
    if (confirm('Bạn có chắc chắn muốn xóa điểm đón trả này không?')) {
      this.diemDonTraService.deletePoint(this.currentPoint.id!);
      this.filterPoints();
      this.closeModal();
    }
  }


  onImageUpload(event: any) {
    const inputElement = event.target;
    const file = inputElement.files[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        this.showAlert('Vui lòng chỉ chọn các tệp định dạng ảnh (JPG, PNG, GIF,...)!');
        inputElement.value = '';
        return;
      }

      this.isUploadingImage = true;
      this.cdr.detectChanges();

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentPoint.image = e.target.result;
        this.isUploadingImage = false;
        inputElement.value = '';
        this.cdr.detectChanges();
      };

      reader.onerror = () => {
        this.showAlert('Đã có lỗi xảy ra khi đọc file ảnh!');
        this.isUploadingImage = false;
        inputElement.value = '';
        this.cdr.detectChanges();
      };

      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.currentPoint.image = null;
    this.cdr.detectChanges();
  }
}
