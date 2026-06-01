import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuKhoaCamService } from '../../../core/services/tu-khoa-cam.service';
import { AdminAuthService } from '../../../core/services/admin-auth.service';

export interface RestrictedKeyword {
  id: string;             // Mã từ khóa
  keyword: string;        // Nội dung từ khóa
  violationLevel: 'Cao' | 'TrungBinh' | 'Thap'; // Mức độ vi phạm
  status: 'DangApDung' | 'NgungApDung';             // Trạng thái áp dụng
  updatedAt: string;      // Thời gian cập nhật danh sách
  updatedBy: string;      // Người cập nhật
}

@Component({
  selector: 'app-quan-ly-tu-khoa-cam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quan-ly-tu-khoa-cam.component.html',
  styleUrls: ['./quan-ly-tu-khoa-cam.component.css']
})
export class QuanLyTuKhoaCamComponent implements OnInit {
  isBrowser: boolean = false;

  constructor(
    private readonly tuKhoaCamService: TuKhoaCamService,
    private readonly cdr: ChangeDetectorRef,
    private readonly adminAuthService: AdminAuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  hasPermission(permission: string): boolean {
    const user = this.adminAuthService.currentUserValue;
    if (!user) return false;
    const basePermission = permission.split('.')[0];
    return !!user.Quyen?.includes(permission) || !!user.Quyen?.includes(basePermission);
  }

  protected readonly Math = Math;

  // Bộ lọc & Tìm kiếm
  searchQuery: string = '';
  filterLevel: 'all' | 'Cao' | 'TrungBinh' | 'Thap' = 'all';

  // Tab lọc trạng thái (Tất cả / Đang áp dụng / Ngưng áp dụng)
  activeTab: 'all' | 'active' | 'inactive' = 'all';

  // Danh sách từ khóa gốc và danh sách hiển thị
  keywords: RestrictedKeyword[] = [];
  filteredKeywords: RestrictedKeyword[] = [];
  displayKeywords: RestrictedKeyword[] = [];

  // Phân trang
  currentPage: number = 1;
  pageSize: number = 10;

  // Trạng thái Modal (Thêm/Sửa)
  showModal: boolean = false;
  isEditing: boolean = false;
  selectedKeyword: RestrictedKeyword | null = null;

  // Form Model
  formModel = {
    keyword: '',
    violationLevel: 'TrungBinh' as 'Cao' | 'TrungBinh' | 'Thap',
    status: 'DangApDung' as 'DangApDung' | 'NgungApDung'
  };

  // Thống kê (KPIs) - luôn tính từ toàn bộ keywords, không phụ thuộc tab
  stats = {
    total: 0,
    active: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  // Thông báo Toast
  notification = {
    show: false,
    type: 'success' as 'success' | 'warning' | 'error',
    title: '',
    message: ''
  };

  mapToFrontend(tk: any): RestrictedKeyword {
    let level: 'Cao' | 'TrungBinh' | 'Thap' = 'TrungBinh';
    if (tk.LoaiViPham === 'Cao' || tk.LoaiViPham === 'High') level = 'Cao';
    else if (tk.LoaiViPham === 'TrungBinh' || tk.LoaiViPham === 'Medium') level = 'TrungBinh';
    else if (tk.LoaiViPham === 'Thap' || tk.LoaiViPham === 'Low') level = 'Thap';

    return {
      id: tk.MaTuKhoa,
      keyword: tk.NoiDungTuKhoa,
      violationLevel: level,
      status: (tk.TrangThai === 'DangApDung' || tk.TrangThai === 'Active') ? 'DangApDung' : 'NgungApDung',
      updatedAt: tk.ThoiGianCapNhat ? this.formatDateTime(new Date(tk.ThoiGianCapNhat)) : '',
      updatedBy: tk.MaQuanTriVien || 'Hệ thống'
    };
  }

  mapToBackend(tk: any): any {
    return {
      MaTuKhoa: tk.id,
      NoiDungTuKhoa: tk.keyword,
      LoaiViPham: tk.violationLevel,
      TrangThai: tk.status,
      MaQuanTriVien: null
    };
  }

  formatDateTime(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }

  loadKeywords() {
    this.tuKhoaCamService.getAll().subscribe({
      next: (data) => {
        this.keywords = data.map(tk => this.mapToFrontend(tk));
        this.calculateStats();
        this.applyFilters();
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.showToast('error', 'Lỗi', 'Không thể tải danh sách từ khóa cấm từ backend!');
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      }
    });
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.loadKeywords();
    }
  }

  // Đặt tab lọc trạng thái
  setTab(tab: 'all' | 'active' | 'inactive') {
    this.activeTab = tab;
    this.applyFilters();
  }

  // Cập nhật các chỉ số thống kê (luôn từ toàn bộ keywords)
  calculateStats() {
    this.stats = {
      total: this.keywords.length,
      active: this.keywords.filter(k => k.status === 'DangApDung').length,
      high: this.keywords.filter(k => k.violationLevel === 'Cao').length,
      medium: this.keywords.filter(k => k.violationLevel === 'TrungBinh').length,
      low: this.keywords.filter(k => k.violationLevel === 'Thap').length
    };
  }

  // Áp dụng bộ lọc tìm kiếm
  applyFilters() {
    let result = [...this.keywords];

    // 1. Lọc theo tab trạng thái
    if (this.activeTab === 'active') {
      result = result.filter(k => k.status === 'DangApDung');
    } else if (this.activeTab === 'inactive') {
      result = result.filter(k => k.status === 'NgungApDung');
    }

    // 2. Tìm kiếm theo từ khóa hoặc mã từ khóa
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(k =>
        k.keyword.toLowerCase().includes(q) ||
        k.id.toLowerCase().includes(q)
      );
    }

    // 3. Lọc theo mức độ vi phạm
    if (this.filterLevel !== 'all') {
      result = result.filter(k => k.violationLevel === this.filterLevel);
    }

    // Sắp xếp theo mã mới nhất
    result.sort((a, b) => b.id.localeCompare(a.id));

    this.filteredKeywords = result;
    this.currentPage = 1;
    this.calculateStats();
    this.updateDisplayList();
  }

  updateDisplayList() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayKeywords = this.filteredKeywords.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredKeywords.length / this.pageSize) || 1;
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayList();
    }
  }

  getPageNumbers() {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePageSize(event: any) {
    this.pageSize = parseInt(event.target.value, 10) || 10;
    this.currentPage = 1;
    this.updateDisplayList();
  }

  // Mở modal Thêm mới
  openAddModal() {
    this.isEditing = false;
    this.selectedKeyword = null;
    this.formModel = {
      keyword: '',
      violationLevel: 'TrungBinh',
      status: 'DangApDung'
    };
    this.showModal = true;
  }

  // Mở modal Sửa
  openEditModal(keyword: RestrictedKeyword) {
    this.isEditing = true;
    this.selectedKeyword = keyword;
    this.formModel = {
      keyword: keyword.keyword,
      violationLevel: keyword.violationLevel,
      status: keyword.status
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedKeyword = null;
  }

  // Chuyển đổi trạng thái trong modal (nút Khóa / Kích hoạt)
  toggleStatusInModal() {
    if (this.formModel.status === 'DangApDung') {
      this.formModel.status = 'NgungApDung';
    } else {
      this.formModel.status = 'DangApDung';
    }
  }

  // Lưu thông tin (Thêm hoặc Cập nhật)
  saveKeyword() {
    const keywordText = this.formModel.keyword.trim().toLowerCase();

    if (!keywordText) {
      this.showToast('warning', 'Cảnh báo', 'Vui lòng nhập nội dung từ khóa hạn chế.');
      return;
    }

    // Kiểm tra trùng lặp
    const isDuplicate = this.keywords.some(k =>
      k.keyword.toLowerCase() === keywordText &&
      (!this.isEditing || k.id !== this.selectedKeyword?.id)
    );

    if (isDuplicate) {
      this.showToast('error', 'Lỗi trùng lặp', `Từ khóa "${keywordText}" đã tồn tại trong danh sách.`);
      return;
    }

    if (this.isEditing && this.selectedKeyword) {
      // Cập nhật từ khóa
      const backendData = this.mapToBackend({
        id: this.selectedKeyword.id,
        keyword: keywordText,
        violationLevel: this.formModel.violationLevel,
        status: this.formModel.status
      });

      this.tuKhoaCamService.update(this.selectedKeyword.id, backendData).subscribe({
        next: (res) => {
          const index = this.keywords.findIndex(k => k.id === this.selectedKeyword!.id);
          if (index !== -1) {
            this.keywords[index] = this.mapToFrontend(res);
          }
          this.showToast('success', 'Cập nhật thành công', `Đã sửa từ khóa thành "${keywordText}"`);
          this.applyFilters();
          this.closeModal();
          setTimeout(() => {
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.showToast('error', 'Lỗi cập nhật', err.error?.message || 'Không thể cập nhật từ khóa!');
          setTimeout(() => {
            this.cdr.detectChanges();
          });
        }
      });
    } else {
      // Thêm mới từ khóa
      const backendData = this.mapToBackend({
        id: '',
        keyword: keywordText,
        violationLevel: this.formModel.violationLevel,
        status: this.formModel.status
      });

      this.tuKhoaCamService.create(backendData).subscribe({
        next: (res) => {
          const newKeyword = this.mapToFrontend(res);
          this.keywords.unshift(newKeyword);
          this.showToast('success', 'Thêm thành công', `Đã thêm từ khóa mới "${keywordText}" vào danh sách.`);
          this.applyFilters();
          this.closeModal();
          setTimeout(() => {
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.showToast('error', 'Lỗi thêm mới', err.error?.message || 'Không thể thêm từ khóa mới!');
          setTimeout(() => {
            this.cdr.detectChanges();
          });
        }
      });
    }
  }

  // Tiện ích lấy thời gian hiện tại định dạng YYYY-MM-DD HH:MM
  getCurrentDateTimeString(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }

  // Quản lý Toast thông báo
  showToast(type: 'success' | 'warning' | 'error', title: string, message: string) {
    this.notification = {
      show: true,
      type,
      title,
      message
    };
    // Tự động đóng toast sau 3.5s
    setTimeout(() => {
      this.closeToast();
    }, 3500);
  }

  closeToast() {
    this.notification.show = false;
  }
}
