import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaiXeService } from '../tai-xe.service';
import { CustomSelectComponent } from '../custom-select.component';

export interface Driver {
  id: string | number;
  name: string;
  dob: string;
  phone: string;
  licenseClass: string;
  licenseExpiry: string;
  avatar: string | null;
  licenseFront: string | null;
  licenseBack: string | null;
  cccdFront: string | null;
  cccdBack: string | null;
  status: 'active' | 'locked';
  cccdNumber: string;
  role: 'driver' | 'assistant';
}

@Component({
  selector: 'app-quan-ly-tai-xe',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './quan-ly-tai-xe.component.html',
  styleUrls: ['./quan-ly-tai-xe.component.css']
})
export class QuanLyTaiXeComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef, private taiXeService: TaiXeService) {}

  activeTab: 'all' | 'active' | 'locked' = 'all';
  searchQuery: string = '';
  roleFilter: 'all' | 'driver' | 'assistant' = 'all';

  get roleFilterOptions() {
    return [
      { value: 'all', label: 'Tất cả' },
      { value: 'driver', label: 'Tài xế' },
      { value: 'assistant', label: 'Phụ xe' }
    ];
  }

  get roleFormOptions() {
    return [
      { value: 'driver', label: 'Tài xế' },
      { value: 'assistant', label: 'Phụ xe' }
    ];
  }

  drivers: Driver[] = [];

  filteredDrivers: Driver[] = [];
  isModalOpen = false;
  isEditMode = false;
  currentDriver: Partial<Driver> = {};

  // Custom Alert State
  isAlertOpen = false;
  alertMessage = '';

  // Uploading states
  isUploadingAvatar = false;
  isUploadingLicFront = false;
  isUploadingLicBack = false;
  isUploadingCccdFront = false;
  isUploadingCccdBack = false;

  phoneTouched = false;
  cccdTouched = false;

  // Custom Date Picker States
  isDobPickerOpen = false;
  isLicPickerOpen = false;
  pickerViewMode: 'day' | 'month' | 'year' = 'day';
  viewDate: Date = new Date();
  selectedDate: Date = new Date();
  
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  calendarDays: number[] = [];
  yearsList: number[] = [];
  yearRangeStart: number = 2026;

  ngOnInit() {
    this.drivers = this.taiXeService.getDrivers();
    this.filterDrivers();
    this.generateCalendar();
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isDobPickerOpen = false;
    this.isLicPickerOpen = false;
  }

  setTab(tab: 'all' | 'active' | 'locked') {
    this.activeTab = tab;
    this.filterDrivers();
  }

  filterDrivers() {
    this.filteredDrivers = this.drivers.filter(d => {
      const matchesTab = this.activeTab === 'all' || d.status === this.activeTab;
      const matchesRole = this.roleFilter === 'all' || d.role === this.roleFilter;
      const matchesSearch = !this.searchQuery || 
                           d.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesTab && matchesRole && matchesSearch;
    });
  }

  openAddModal(role: 'driver' | 'assistant' = 'driver') {
    this.isEditMode = false;
    this.currentDriver = {
      status: 'active',
      role: role,
      licenseClass: '',
      cccdNumber: ''
    };
    this.phoneTouched = false;
    this.cccdTouched = false;
    this.isUploadingAvatar = false;
    this.isUploadingLicFront = false;
    this.isUploadingLicBack = false;
    this.isUploadingCccdFront = false;
    this.isUploadingCccdBack = false;
    this.isModalOpen = true;
    this.isDobPickerOpen = false;
    this.isLicPickerOpen = false;
  }

  openEditModal(driver: Driver) {
    this.isEditMode = true;
    this.currentDriver = { ...driver };
    this.phoneTouched = false;
    this.cccdTouched = false;
    this.isUploadingAvatar = false;
    this.isUploadingLicFront = false;
    this.isUploadingLicBack = false;
    this.isUploadingCccdFront = false;
    this.isUploadingCccdBack = false;
    this.isModalOpen = true;
    this.isDobPickerOpen = false;
    this.isLicPickerOpen = false;
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

  getPhoneErrorMessage(): string | null {
    const phone = this.currentDriver.phone;
    if (!this.phoneTouched) return null;
    if (!phone) return null; // Do not show empty error inline
    if (phone.length !== 10) return 'Số điện thoại phải bao gồm đúng 10 chữ số!';
    if (!phone.startsWith('0')) return 'Số điện thoại phải bắt đầu bằng số 0!';
    if (phone.startsWith('00')) return 'Số điện thoại không được bắt đầu bằng 00!';
    if (/^(\d)\1+$/.test(phone)) {
      return 'Số điện thoại không hợp lệ (chuỗi số lặp vô nghĩa)!';
    }
    return null;
  }

  getCccdErrorMessage(): string | null {
    const cccd = this.currentDriver.cccdNumber;
    if (!this.cccdTouched) return null;
    if (!cccd) return null; // Do not show empty error inline
    if (cccd.length !== 12) return 'Số CCCD/CMND phải bao gồm đúng 12 chữ số!';
    if (/^(\d)\1+$/.test(cccd)) {
      return 'Số CCCD/CMND không hợp lệ (chuỗi số lặp vô nghĩa)!';
    }
    return null;
  }

  saveDriver() {
    this.phoneTouched = true;
    this.cccdTouched = true;
    
    // Validation
    if (!this.currentDriver.name) {
      this.showAlert('Hãy điền thông tin Họ và tên!');
      return;
    }
    if (!this.currentDriver.dob) {
      this.showAlert('Hãy điền thông tin Ngày sinh!');
      return;
    }
    
    if (!this.currentDriver.phone) {
      this.showAlert('Số điện thoại không được để trống!');
      return;
    }
    const phoneError = this.getPhoneErrorMessage();
    if (phoneError) {
      this.showAlert(phoneError);
      return;
    }

    if (!this.currentDriver.cccdNumber) {
      this.showAlert('Số CCCD/CMND không được để trống!');
      return;
    }
    const cccdError = this.getCccdErrorMessage();
    if (cccdError) {
      this.showAlert(cccdError);
      return;
    }

    if (this.currentDriver.role === 'driver') {
      if (!this.currentDriver.licenseClass) {
        this.showAlert('Hãy điền thông tin Hạng bằng lái!');
        return;
      }
      if (!this.currentDriver.licenseExpiry) {
        this.showAlert('Hãy điền thông tin Hạn bằng lái!');
        return;
      }
    }

    if (this.isEditMode) {
      this.taiXeService.updateDriver(this.currentDriver.id!, this.currentDriver);
    } else {
      this.taiXeService.addDriver(this.currentDriver as any);
    }
    
    this.filterDrivers();
    this.closeModal();
  }

  toggleStatus() {
    if (this.currentDriver.status === 'active') {
      this.currentDriver.status = 'locked';
    } else {
      this.currentDriver.status = 'active';
    }
  }

  deleteDriver() {
    if (confirm('Bạn có chắc chắn muốn xóa tài xế này không?')) {
      this.taiXeService.deleteDriver(this.currentDriver.id!);
      this.filterDrivers();
      this.closeModal();
    }
  }

  onPhoneInput(event: any) {
    const inputElement = event.target;
    const sanitized = inputElement.value.replace(/[^0-9]/g, '').slice(0, 10);
    inputElement.value = sanitized; // Force DOM refresh to remove invalid characters
    this.currentDriver.phone = sanitized;
  }

  onPhoneBlur() {
    this.phoneTouched = true;
  }

  onCccdInput(event: any) {
    const inputElement = event.target;
    const sanitized = inputElement.value.replace(/[^0-9]/g, '').slice(0, 12);
    inputElement.value = sanitized; // Force DOM refresh to remove invalid characters
    this.currentDriver.cccdNumber = sanitized;
  }

  onCccdBlur() {
    this.cccdTouched = true;
  }

  // IMAGE UPLOAD LOGIC
  onImageUpload(event: any, type: 'avatar' | 'licenseFront' | 'licenseBack' | 'cccdFront' | 'cccdBack') {
    const inputElement = event.target;
    const file = inputElement.files[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.showAlert('Vui lòng chỉ chọn các tệp định dạng ảnh (JPG, PNG, GIF,...)!');
        inputElement.value = ''; // Reset input
        return;
      }

      // Simulate loading state
      if (type === 'avatar') this.isUploadingAvatar = true;
      else if (type === 'licenseFront') this.isUploadingLicFront = true;
      else if (type === 'licenseBack') this.isUploadingLicBack = true;
      else if (type === 'cccdFront') this.isUploadingCccdFront = true;
      else if (type === 'cccdBack') this.isUploadingCccdBack = true;
      
      this.cdr.detectChanges(); // Render spinner immediately

      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        setTimeout(() => {
          this.currentDriver[type] = e.target.result;
          
          if (type === 'avatar') this.isUploadingAvatar = false;
          else if (type === 'licenseFront') this.isUploadingLicFront = false;
          else if (type === 'licenseBack') this.isUploadingLicBack = false;
          else if (type === 'cccdFront') this.isUploadingCccdFront = false;
          else if (type === 'cccdBack') this.isUploadingCccdBack = false;
          
          inputElement.value = ''; // Reset input to allow re-uploading the same file
          this.cdr.detectChanges(); // Render uploaded image and hide spinner immediately
        }, 800); // Fake delay
      };

      reader.onerror = () => {
        this.showAlert('Đã có lỗi xảy ra khi đọc file ảnh!');
        if (type === 'avatar') this.isUploadingAvatar = false;
        else if (type === 'licenseFront') this.isUploadingLicFront = false;
        else if (type === 'licenseBack') this.isUploadingLicBack = false;
        else if (type === 'cccdFront') this.isUploadingCccdFront = false;
        else if (type === 'cccdBack') this.isUploadingCccdBack = false;
        inputElement.value = '';
        this.cdr.detectChanges();
      };

      reader.readAsDataURL(file);
    }
  }

  removeImage(type: 'avatar' | 'licenseFront' | 'licenseBack' | 'cccdFront' | 'cccdBack') {
    this.currentDriver[type] = null;
    this.cdr.detectChanges(); // Update the UI immediately after deleting
  }

  // DATE PICKER LOGIC
  toggleDatePicker(type: 'dob' | 'license') {
    if (type === 'dob') {
      this.isDobPickerOpen = !this.isDobPickerOpen;
      this.isLicPickerOpen = false;
      this.initDateFromModel(this.currentDriver.dob);
    } else {
      this.isLicPickerOpen = !this.isLicPickerOpen;
      this.isDobPickerOpen = false;
      this.initDateFromModel(this.currentDriver.licenseExpiry);
    }
  }

  initDateFromModel(dateStr?: string) {
    if (dateStr) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        this.viewDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        this.selectedDate = new Date(this.viewDate);
      }
    } else {
      this.viewDate = new Date();
    }
    this.pickerViewMode = 'day';
    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Adjust for Monday start (0 = Sunday, 1 = Monday)
    let startDay = firstDay === 0 ? 6 : firstDay - 1;
    
    this.calendarDays = Array(startDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push(i);
    }
  }

  generateYearRange(startYear: number) {
    this.yearsList = [];
    for (let i = 0; i < 12; i++) {
      this.yearsList.push(startYear + i);
    }
  }

  setPickerView(mode: 'day' | 'month' | 'year') {
    this.pickerViewMode = mode;
    if (mode === 'year') {
      this.yearRangeStart = this.viewDate.getFullYear() - 4;
      this.generateYearRange(this.yearRangeStart);
    }
  }

  prev() {
    if (this.pickerViewMode === 'day') {
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
      this.generateCalendar();
    } else if (this.pickerViewMode === 'year') {
      this.yearRangeStart -= 12;
      this.generateYearRange(this.yearRangeStart);
    }
  }

  next() {
    if (this.pickerViewMode === 'day') {
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
      this.generateCalendar();
    } else if (this.pickerViewMode === 'year') {
      this.yearRangeStart += 12;
      this.generateYearRange(this.yearRangeStart);
    }
  }

  selectDate(day: number, type: 'dob' | 'license') {
    if (!day) return;
    
    const dateStr = `${day.toString().padStart(2, '0')}/${(this.viewDate.getMonth() + 1).toString().padStart(2, '0')}/${this.viewDate.getFullYear()}`;
    
    if (type === 'dob') {
      this.currentDriver.dob = dateStr;
      this.isDobPickerOpen = false;
    } else {
      this.currentDriver.licenseExpiry = dateStr;
      this.isLicPickerOpen = false;
    }
  }

  selectMonth(monthIndex: number) {
    this.viewDate = new Date(this.viewDate.getFullYear(), monthIndex, 1);
    this.pickerViewMode = 'day';
    this.generateCalendar();
  }

  selectYear(year: number) {
    this.viewDate = new Date(year, this.viewDate.getMonth(), 1);
    this.pickerViewMode = 'month';
  }
}
