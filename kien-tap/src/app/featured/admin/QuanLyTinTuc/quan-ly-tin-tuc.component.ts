import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TinTucService } from '../../../core/services/tin-tuc.service';
import { NhatKyService } from '../../../core/services/nhat-ky.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface TinTuc {
  maTinTuc: string;
  tieuDe: string;
  anhBia: string;
  loaiTinTuc: string;
  moTaNgan: string;
  noiDungChiTiet: string;
  ngayDang: string;
  trangThai: 'BanNhap' | 'DaDang' | 'NgungHienThi' | 'HenGio';
  nguoiDang: string;
  ngayTao: string;
  ngayCapNhat: string;
  henGioDang?: boolean;
  ngayGioHenGio?: string;
}

export interface NhatKyTinTuc {
  maNhatKy: string;
  loaiThaoTac: string;
  thoiGian: string;
  nguoiThaoTac: string;
  diaChiIP: string;
  noiDungChiTiet: string;
}

@Component({
  selector: 'app-quan-ly-tin-tuc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quan-ly-tin-tuc.component.html',
  styleUrls: ['./quan-ly-tin-tuc.component.css']
})
export class QuanLyTinTucComponent implements OnInit {
  @ViewChild('editor') editorElement!: ElementRef;
  @ViewChild('imageInput') imageInputElement!: ElementRef;

  isBrowser: boolean = false;

  constructor(
    private readonly tinTucService: TinTucService,
    private readonly nhatKyService: NhatKyService,
    private sanitizer: DomSanitizer,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }

  // Expose Math for HTML templates
  protected readonly Math = Math;

  // Tabs: 'all' | 'published' | 'draft' | 'hidden' | 'scheduled'
  activeTab: 'all' | 'published' | 'draft' | 'hidden' | 'scheduled' = 'all';

  // Search & advanced filter query
  searchQuery: string = '';
  sortOrder: 'newest' | 'oldest' | 'alphabetical' = 'newest';

  // Core Arrays
  newsList: TinTuc[] = [];
  filteredNews: TinTuc[] = [];
  displayNews: TinTuc[] = [];
  activityLogs: NhatKyTinTuc[] = [];

  // Modal control & form data
  showModal: boolean = false;
  isEditing: boolean = false;
  selectedNews: TinTuc | null = null;
  formModel: any = {
    maTinTuc: '',
    tieuDe: '',
    anhBia: '',
    loaiTinTuc: 'TinTuc',
    moTaNgan: '',
    noiDungChiTiet: '',
    trangThai: 'BanNhap',
    henGioDang: false,
    ngayHenGio: '',
    gioHenGio: ''
  };

  // Danh sách loại tin tức
  loaiTinTucList = [
    { value: 'TinTuc', label: 'Tin tức chung' },
    { value: 'ThongBao', label: 'Thông báo' },
    { value: 'KhuyenMai', label: 'Khuyến mãi' },
    { value: 'SuKien', label: 'Sự kiện' },
    { value: 'HuongDan', label: 'Hướng dẫn' },
    { value: 'TuyenDung', label: 'Tuyển dụng' }
  ];

  // Preset images for cover photo suggestions
  presetImages = [
    { url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800', label: 'Xe khách hiện đại' },
    { url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800', label: 'Hành trình xe buýt' },
    { url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800', label: 'Vô lăng & Buồng lái' },
    { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', label: 'Thắng cảnh thiên nhiên' },
    { url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800', label: 'Hoàng hôn rực rỡ' },
    { url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800', label: 'Voucher & Khuyến mại' }
  ];

  // Selected news preview modal instead of sliding drawer
  previewNews: TinTuc | null = null;
  showPreviewModal: boolean = false;
  previewTabActive: 'preview' | 'logs' = 'preview';

  // Status confirm overlay controls (Removed Delete from confirmations)
  showConfirmModal: boolean = false;
  showLivePreview: boolean = true; // Toggle live Web preview column (2-columns vs 1-column)
  confirmType: 'hide' | 'publish' | 'clear' | 'lock' = 'hide';
  targetNews: TinTuc | null = null;
  todayDate: Date = new Date();

  // Pagination fields
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  // Cover image local upload mockup state
  isUploadingCover: boolean = false;
  uploadCoverProgress: number = 0;
  uploadedCoverFile: string = '';

  // Inline editor image upload dialog
  showInsertImageModal: boolean = false;
  isUploadingInline: boolean = false;
  uploadInlineProgress: number = 0;
  inlineImageUrl: string = '';
  uploadedInlineFile: string = '';

  // Dropdown options
  selectedFont: string = 'Inter';
  selectedFontSize: string = '3'; // standard browser command font size (1-7)
  selectedParagraph: string = 'Normal';

  fonts: string[] = ['Inter', 'Roboto', 'Arial', 'Times New Roman', 'Georgia', 'Courier New', 'Tahoma', 'Verdana'];
  fontSizes = [
    { label: 'Rất nhỏ', value: '1' },
    { label: 'Nhỏ', value: '2' },
    { label: 'Bình thường', value: '3' },
    { label: 'Lớn', value: '4' },
    { label: 'Rất lớn', value: '5' },
    { label: 'Cực đại', value: '6' }
  ];

  // Link Sub-Modal States
  showLinkModal: boolean = false;
  linkForm = { text: '', url: '' };
  savedSelectionRange: Range | null = null;

  // Selected Image States for Word-like alignments and resizing
  selectedImage: HTMLImageElement | null = null;
  resizeBox = { top: 0, left: 0, width: 0, height: 0 };
  resizingData = {
    handle: '',
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    aspectRatio: 1
  };

  // Custom premium notifications
  notification = {
    show: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'warning' | 'error'
  };

  // Form field-specific validation errors
  formErrors: { [key: string]: string } = {};

  ngOnInit() {
    if (this.isBrowser) {
      this.loadNews();
      this.loadLogs();
    }
  }

  loadNews() {
    this.tinTucService.getAll().subscribe({
      next: (data) => {
        this.newsList = data.map(n => this.mapNewsToFrontend(n));
        this.filterNews();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading news from backend:', err);
        this.newsList = [];
        this.filterNews();
        this.cdr.detectChanges();
      }
    });
  }

  loadLogs() {
    this.nhatKyService.getAll().subscribe({
      next: (data) => {
        this.activityLogs = data.map(l => this.mapLogToFrontend(l));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading logs:', err);
        this.activityLogs = [];
        this.cdr.detectChanges();
      }
    });
  }

  formatDateTime(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
  }

  mapNewsToFrontend(n: any): TinTuc {
    const ngayDang = n.NgayDang ? n.NgayDang.split('T')[0] : '';
    const ngayGioHenGioStr = n.NgayGioHenGio ? this.formatDateTime(new Date(n.NgayGioHenGio)) : '';
    return {
      maTinTuc: n.MaTinTuc,
      tieuDe: n.TieuDe,
      anhBia: n.AnhBia || '',
      loaiTinTuc: n.LoaiTinTuc || 'TinTuc',
      moTaNgan: n.MoTaNgan || '',
      noiDungChiTiet: n.NoiDungChiTiet || '',
      trangThai: n.TrangThai || 'BanNhap',
      nguoiDang: 'Nguyễn Hoài Nam (Admin)',
      ngayDang: ngayDang,
      ngayTao: ngayDang || this.formatCurrentDate(),
      ngayCapNhat: ngayDang || this.formatCurrentDate(),
      henGioDang: n.TrangThai === 'HenGio',
      ngayGioHenGio: ngayGioHenGioStr
    };
  }

  mapNewsToBackend(n: TinTuc): any {
    return {
      MaTinTuc: n.maTinTuc,
      TieuDe: n.tieuDe,
      AnhBia: n.anhBia || null,
      LoaiTinTuc: n.loaiTinTuc,
      MoTaNgan: n.moTaNgan || null,
      NoiDungChiTiet: n.noiDungChiTiet || null,
      NgayDang: n.trangThai === 'DaDang' ? new Date() : (n.ngayDang ? new Date(n.ngayDang) : null),
      TrangThai: n.trangThai,
      MaQuanTriVien: 'NVDP001',
      NgayGioHenGio: n.trangThai === 'HenGio' && n.ngayGioHenGio ? new Date(n.ngayGioHenGio.replace(' ', 'T') + ':00') : null
    };
  }

  mapLogToFrontend(l: any): NhatKyTinTuc {
    const tenNhanVien = l.NHAN_VIEN?.TenHienThi || l.NHAN_VIEN?.Ten || 'Hệ thống';
    return {
      maNhatKy: l.MaNhatKy,
      loaiThaoTac: l.LoaiThaoTac || 'Khác',
      thoiGian: l.ThoiGian ? this.formatDateTime(new Date(l.ThoiGian)) : '',
      nguoiThaoTac: tenNhanVien,
      diaChiIP: l.DiaChiIP || '127.0.0.1',
      noiDungChiTiet: l.NoiDungChiTiet || ''
    };
  }

  // Set active filters tab
  setTab(tab: 'all' | 'published' | 'draft' | 'hidden' | 'scheduled') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.filterNews();
  }

  getCountByStatus(status: string): number {
    return this.newsList.filter(n => n.trangThai === status).length;
  }

  // Advanced Filtering
  filterNews() {
    let result = [...this.newsList];

    // 1. Filter by tabs status
    if (this.activeTab === 'published') {
      result = result.filter(n => n.trangThai === 'DaDang');
    } else if (this.activeTab === 'draft') {
      result = result.filter(n => n.trangThai === 'BanNhap');
    } else if (this.activeTab === 'hidden') {
      result = result.filter(n => n.trangThai === 'NgungHienThi');
    } else if (this.activeTab === 'scheduled') {
      result = result.filter(n => n.trangThai === 'HenGio');
    }

    // 2. Filter by search query (Title or Description)
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(n =>
        n.maTinTuc.toLowerCase().includes(q) ||
        n.tieuDe.toLowerCase().includes(q) ||
        n.moTaNgan.toLowerCase().includes(q)
      );
    }

    // 3. Sort Order
    if (this.sortOrder === 'newest') {
      result.sort((a, b) => b.ngayTao.localeCompare(a.ngayTao));
    } else if (this.sortOrder === 'oldest') {
      result.sort((a, b) => a.ngayTao.localeCompare(b.ngayTao));
    } else if (this.sortOrder === 'alphabetical') {
      result.sort((a, b) => a.tieuDe.localeCompare(b.tieuDe));
    }

    this.filteredNews = result;
    this.calculatePagination();
  }

  search() {
    this.currentPage = 1;
    this.filterNews();
  }

  onSortOrderChange() {
    this.currentPage = 1;
    this.filterNews();
  }

  // Pagination Logic
  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredNews.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.updateDisplayList();
  }

  updateDisplayList() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayNews = this.filteredNews.slice(startIndex, endIndex);
  }

  changePageSize(event: any) {
    this.pageSize = parseInt(event.target.value, 10);
    this.currentPage = 1;
    this.calculatePagination();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayList();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayList();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayList();
    }
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Quick cover selection helper
  selectPresetImage(url: string) {
    this.formModel.anhBia = url;
    if (this.formErrors['anhBia']) {
      this.formErrors['anhBia'] = '';
    }
  }

  // MOCK Local File Uploading simulation with real file reader!
  triggerLocalCoverUpload() {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = 'image/*';
    inputElement.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadedCoverFile = file.name;
        this.isUploadingCover = true;
        this.uploadCoverProgress = 0;

        const interval = setInterval(() => {
          this.uploadCoverProgress += 20;
          if (this.uploadCoverProgress >= 100) {
            clearInterval(interval);
            this.isUploadingCover = false;
            
            // Read actual file as base64 to show user's uploaded picture!
            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.formModel.anhBia = e.target.result;
              this.showNotification(
                'Tải ảnh thành công',
                `Đã tải lên tệp tin <strong>${file.name}</strong> và tối ưu hóa ảnh đại diện thành công.`,
                'success'
              );
            };
            reader.readAsDataURL(file);
          }
        }, 100);
      }
    };
    inputElement.click();
  }

  triggerLocalInlineUpload() {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = 'image/*';
    inputElement.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadedInlineFile = file.name;
        this.isUploadingInline = true;
        this.uploadInlineProgress = 0;

        const interval = setInterval(() => {
          this.uploadInlineProgress += 25;
          if (this.uploadInlineProgress >= 100) {
            clearInterval(interval);
            this.isUploadingInline = false;
            
            // Read actual file as base64 to insert/preview inline image!
            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.inlineImageUrl = e.target.result;
              this.showNotification(
                'Tải lên hoàn tất',
                `Ảnh chèn nội dung <strong>${file.name}</strong> đã tải lên thành công!`,
                'success'
              );
            };
            reader.readAsDataURL(file);
          }
        }, 100);
      }
    };
    inputElement.click();
  }

  openInsertImageModal() {
    this.inlineImageUrl = '';
    this.uploadedInlineFile = '';
    this.uploadInlineProgress = 0;
    this.isUploadingInline = false;
    this.showInsertImageModal = true;
  }

  closeInsertImageModal() {
    this.showInsertImageModal = false;
  }

  insertImageToContent() {
    if (!this.inlineImageUrl || !this.inlineImageUrl.trim()) {
      this.showNotification('Thiếu thông tin', 'Vui lòng dán liên kết hoặc tải ảnh lên trước!', 'error');
      return;
    }
    
    // Insert structured HTML image element to contenteditable
    const imgHtml = `<img src="${this.inlineImageUrl}" style="max-width: 100%; border-radius: 12px; margin: 16px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Hình ảnh bài viết" />`;
    if (this.editorElement) {
      this.editorElement.nativeElement.innerHTML += imgHtml;
      this.onEditorChange();
    }
    this.closeInsertImageModal();
  }

  // Open Form Modal (Add / Edit)
  openAddModal() {
    this.isEditing = false;
    this.selectedNews = null;
    this.formErrors = {};
    
    // Auto-generate code
    let newCode = '';
    if (this.newsList && this.newsList.length > 0) {
      const validNums = this.newsList
        .map(n => {
          const clean = n.maTinTuc.replace('TT', '').trim();
          const parsed = parseInt(clean, 10);
          return isNaN(parsed) ? 0 : parsed;
        });
      const nextNum = Math.max(...validNums, 0) + 1;
      newCode = 'TT' + String(nextNum).padStart(3, '0');
    } else {
      // Fallback to a random 3-digit number to avoid clashing with pre-existing records (e.g. TT001, TT002)
      newCode = 'TT' + String(Math.floor(Math.random() * 900) + 100);
    }

    this.formModel = {
      maTinTuc: newCode,
      tieuDe: '',
      anhBia: '',
      loaiTinTuc: 'TinTuc',
      moTaNgan: '',
      noiDungChiTiet: '', // Start completely clean without technical tag templates
      trangThai: 'BanNhap',
      henGioDang: false,
      ngayHenGio: '',
      gioHenGio: ''
    };
    this.showModal = true;

    // Clear editable canvas
    setTimeout(() => {
      if (this.editorElement) {
        this.editorElement.nativeElement.innerHTML = '';
      }
    }, 50);
  }

  openEditModal(news: TinTuc) {
    this.isEditing = true;
    this.selectedNews = news;
    this.formErrors = {};

    let ngayHenGio = '';
    let gioHenGio = '';
    if (news.henGioDang && news.ngayGioHenGio) {
      const parts = news.ngayGioHenGio.split(' ');
      ngayHenGio = parts[0];
      gioHenGio = parts[1];
    }

    this.formModel = { 
      ...news,
      henGioDang: news.henGioDang || false,
      ngayHenGio,
      gioHenGio
    };
    this.showModal = true;

    // Load content to editable canvas
    setTimeout(() => {
      if (this.editorElement) {
        this.editorElement.nativeElement.innerHTML = this.formModel.noiDungChiTiet;
      }
    }, 50);
  }

  closeModal() {
    this.showModal = false;
    this.selectedNews = null;
  }

  // Pure document.execCommand editor logic exactly like Policy screen
  execEditorCommand(command: string, value: string = '') {
    if (command === 'clear') {
      this.confirmType = 'clear' as any;
      this.showConfirmModal = true;
    }
  }

  // Rich Text Editor Command Executions exactly from Policy component
  formatDoc(cmd: string, val: string = '') {
    document.execCommand(cmd, false, val);
    if (this.editorElement) {
      this.formModel.noiDungChiTiet = this.editorElement.nativeElement.innerHTML;
    }
  }

  onEditorChange() {
    if (this.editorElement) {
      this.formModel.noiDungChiTiet = this.editorElement.nativeElement.innerHTML;
    }
  }

  changeFont(event: Event) {
    const font = (event.target as HTMLSelectElement).value;
    this.formatDoc('fontName', font);
  }

  changeFontSize(event: Event) {
    const size = (event.target as HTMLSelectElement).value;
    this.formatDoc('fontSize', size);
  }

  // Chèn liên kết tùy chỉnh (Mở Sub-Modal đẹp giống Word)
  insertLink() {
    try {
      const selection = window.getSelection();
      let selectedText = '';
      if (selection && selection.rangeCount > 0) {
        try {
          this.savedSelectionRange = selection.getRangeAt(0).cloneRange();
          selectedText = selection.toString();
        } catch (err) {
          console.warn('Could not clone range:', err);
          this.savedSelectionRange = null;
        }
      } else {
        this.savedSelectionRange = null;
      }
      this.linkForm = {
        text: selectedText || 'Liên kết',
        url: 'https://'
      };
    } catch (e) {
      console.error('Error in insertLink range clone:', e);
      this.savedSelectionRange = null;
      this.linkForm = {
        text: 'Liên kết',
        url: 'https://'
      };
    }
    this.showLinkModal = true;
  }

  closeLinkModal() {
    this.showLinkModal = false;
  }

  confirmInsertLink() {
    if (!this.linkForm.url.trim() || this.linkForm.url === 'https://') {
      this.showNotification('Cảnh báo', 'Vui lòng nhập địa chỉ URL liên kết!', 'warning');
      return;
    }

    // Khôi phục Selection để chèn link vào đúng vị trí con trỏ
    const selection = window.getSelection();
    if (selection && this.savedSelectionRange) {
      selection.removeAllRanges();
      selection.addRange(this.savedSelectionRange);
    }

    // Tạo mã HTML cho liên kết đẹp
    const linkHTML = `<a href="${this.linkForm.url}" target="_blank" style="color: #009ba1; font-weight: 600; text-decoration: underline; cursor: pointer;" title="${this.linkForm.url}">${this.linkForm.text}</a>`;

    this.formatDoc('insertHTML', linkHTML);
    this.closeLinkModal();
  }

  // Quản lý và xử lý nhấp chuột vào phần tử trong Editor
  onEditorClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'a') {
      event.preventDefault();
      const href = target.getAttribute('href');
      if (href) {
        window.open(href, '_blank');
      }
    } else if (target.tagName.toLowerCase() === 'img') {
      this.selectImage(target as HTMLImageElement);
      event.stopPropagation();
    } else {
      this.clearImageSelection();
    }
  }

  selectImage(img: HTMLImageElement) {
    this.selectedImage = img;
    this.clearImageOutlines();
    img.style.outline = '2px solid #009ba1';
    img.style.outlineOffset = '2px';
    this.updateResizeOverlay();
  }

  clearImageOutlines() {
    if (this.editorElement) {
      const imgs = this.editorElement.nativeElement.querySelectorAll('img');
      imgs.forEach((im: HTMLImageElement) => {
        im.style.outline = 'none';
      });
    }
  }

  clearImageSelection() {
    this.clearImageOutlines();
    this.selectedImage = null;
    this.updateResizeOverlay();
  }

  // Cập nhật vị trí khung resize đè lên ảnh
  updateResizeOverlay() {
    if (!this.selectedImage || !this.editorElement) {
      this.resizeBox = { top: 0, left: 0, width: 0, height: 0 };
      return;
    }
    const img = this.selectedImage;
    const canvas = this.editorElement.nativeElement;
    const wrapper = canvas.closest('.editor-wrapper');
    if (!wrapper) return;

    const imgRect = img.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    this.resizeBox = {
      top: imgRect.top - wrapperRect.top,
      left: imgRect.left - wrapperRect.left,
      width: imgRect.width,
      height: imgRect.height
    };
  }

  // Bắt đầu kéo thả thay đổi kích thước ảnh từ 4 góc
  startResize(event: MouseEvent, handle: string) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.selectedImage) return;

    this.resizingData = {
      handle: handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: this.selectedImage.clientWidth,
      startHeight: this.selectedImage.clientHeight,
      aspectRatio: this.selectedImage.clientWidth / this.selectedImage.clientHeight
    };

    const mouseMoveListener = (moveEvent: MouseEvent) => {
      this.handleResize(moveEvent);
    };

    const mouseUpListener = () => {
      window.removeEventListener('mousemove', mouseMoveListener);
      window.removeEventListener('mouseup', mouseUpListener);
      this.onEditorChange();
    };

    window.addEventListener('mousemove', mouseMoveListener);
    window.addEventListener('mouseup', mouseUpListener);
  }

  handleResize(event: MouseEvent) {
    if (!this.selectedImage || !this.editorElement) return;

    const dx = event.clientX - this.resizingData.startX;
    let newWidth = this.resizingData.startWidth;

    if (this.resizingData.handle === 'br' || this.resizingData.handle === 'tr') {
      newWidth = this.resizingData.startWidth + dx;
    } else if (this.resizingData.handle === 'bl' || this.resizingData.handle === 'tl') {
      newWidth = this.resizingData.startWidth - dx;
    }

    // Giới hạn chiều rộng nhỏ nhất là 40px
    if (newWidth < 40) newWidth = 40;

    // Tính phần trăm so với chiều rộng khung soạn thảo để duy trì hiển thị responsive
    const canvasWidth = this.editorElement.nativeElement.clientWidth;
    const padding = 32; // padding của canvas
    const usableWidth = canvasWidth - padding;
    const widthPercent = Math.min(100, Math.round((newWidth / usableWidth) * 100));

    this.selectedImage.style.width = `${widthPercent}%`;
    this.selectedImage.style.height = 'auto'; // Auto height to preserve aspect ratio

    this.updateResizeOverlay();
  }

  // Căn lề hình ảnh (float / margins)
  isImgAlign(align: 'left' | 'center' | 'right'): boolean {
    if (!this.selectedImage) return false;
    const style = this.selectedImage.style;
    if (align === 'left') {
      return style.float === 'left';
    }
    if (align === 'right') {
      return style.float === 'right';
    }
    if (align === 'center') {
      return style.display === 'block' && style.margin.includes('auto');
    }
    return false;
  }

  alignImage(align: 'left' | 'center' | 'right') {
    const img = this.selectedImage;
    if (!img) return;
    if (align === 'left') {
      img.style.display = 'inline';
      img.style.float = 'left';
      img.style.margin = '10px 15px 10px 0';
    } else if (align === 'right') {
      img.style.display = 'inline';
      img.style.float = 'right';
      img.style.margin = '10px 0 10px 15px';
    } else if (align === 'center') {
      img.style.display = 'block';
      img.style.float = 'none';
      img.style.margin = '15px auto';
    }
    this.onEditorChange();
    setTimeout(() => this.updateResizeOverlay(), 20);
  }

  // Lấy % độ rộng hiện tại của hình ảnh
  getImageWidth(): number {
    if (!this.selectedImage) return 100;
    const widthStr = this.selectedImage.style.width;
    if (widthStr && widthStr.endsWith('%')) {
      return parseInt(widthStr, 10);
    }
    return 100;
  }

  // Thay đổi độ rộng qua thanh trượt Slider
  changeImageWidth(event: Event) {
    if (!this.selectedImage) return;
    const width = (event.target as HTMLInputElement).value;
    this.selectedImage.style.width = `${width}%`;
    this.selectedImage.style.height = 'auto'; // Giữ nguyên tỉ lệ ảnh
    this.onEditorChange();
    setTimeout(() => this.updateResizeOverlay(), 10);
  }

  // Xóa ảnh đang chọn
  deleteSelectedImage() {
    if (!this.selectedImage) return;
    this.selectedImage.remove();
    this.selectedImage = null;
    this.updateResizeOverlay();
    this.onEditorChange();
  }

  // Kích hoạt hộp thoại chọn file ảnh từ máy tính
  triggerImageUpload() {
    if (this.imageInputElement) {
      this.imageInputElement.nativeElement.click();
    }
  }

  // Đọc file ảnh cục bộ chuyển đổi sang Base64 chèn vào Editor
  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Url = e.target.result;
        this.formatDoc('insertImage', base64Url);
        // Reset file input value
        (event.target as HTMLInputElement).value = '';
      };
      reader.readAsDataURL(file);
    }
  }

  // Chèn khối mã nguồn (pre/code block)
  insertCodeBlock() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || 'Nhập mã nguồn tại đây...';

      const preNode = document.createElement('pre');
      preNode.style.backgroundColor = '#f5f5f5';
      preNode.style.padding = '10px';
      preNode.style.borderRadius = '4px';
      preNode.style.fontFamily = 'Courier New, Courier, monospace';
      preNode.style.margin = '10px 0';
      preNode.style.borderLeft = '4px solid #009ba1';

      const codeNode = document.createElement('code');
      codeNode.innerText = selectedText;
      preNode.appendChild(codeNode);

      range.deleteContents();
      range.insertNode(preNode);

      // Di chuyển con trỏ sau khối mã nguồn vừa chèn
      range.setStartAfter(preNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

      this.onEditorChange();
    } else {
      this.formatDoc('insertHTML', '<pre style="background:#f5f5f5;padding:10px;border-radius:4px;font-family:Courier New;margin:10px 0;border-left:4px solid #009ba1"><code>Nhập mã nguồn tại đây...</code></pre>');
    }
  }

  // Real-time inline field validation
  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.formModel.tieuDe || !this.formModel.tieuDe.trim()) {
      this.formErrors['tieuDe'] = 'Tiêu đề bài viết không được để trống!';
      isValid = false;
    } else {
      // Check unique title exception
      const duplicate = this.newsList.find(n => 
        n.tieuDe.toLowerCase().trim() === this.formModel.tieuDe.toLowerCase().trim() && 
        n.maTinTuc !== this.formModel.maTinTuc
      );
      if (duplicate) {
        this.formErrors['tieuDe'] = 'Tiêu đề bài viết này đã bị trùng lặp trên hệ thống!';
        isValid = false;
      }
    }

    if (!this.formModel.anhBia || !this.formModel.anhBia.trim()) {
      this.formErrors['anhBia'] = 'Vui lòng chọn ảnh bìa hoặc dán liên kết ảnh hợp lệ!';
      isValid = false;
    }

    if (!this.formModel.moTaNgan || !this.formModel.moTaNgan.trim()) {
      this.formErrors['moTaNgan'] = 'Mô tả ngắn không được để trống!';
      isValid = false;
    } else if (this.formModel.moTaNgan.length > 200) {
      this.formErrors['moTaNgan'] = `Mô tả ngắn tối đa 200 ký tự (Hiện tại: ${this.formModel.moTaNgan.length} ký tự)!`;
      isValid = false;
    }

    // Professional check for empty or browser placeholder tags in editable div
    const emptyValue = this.formModel.noiDungChiTiet || '';
    const cleanText = emptyValue.replace(/<[^>]*>/g, '').trim();
    if (!emptyValue || emptyValue === '<br>' || emptyValue === '<div><br></div>' || !cleanText) {
      this.formErrors['noiDungChiTiet'] = 'Vui lòng soạn thảo nội dung chi tiết cho bài viết!';
      isValid = false;
    }

    // Facebook scheduled date validate
    if (this.formModel.henGioDang) {
      if (!this.formModel.ngayHenGio || !this.formModel.gioHenGio) {
        this.formErrors['ngayHenGio'] = 'Vui lòng chọn đầy đủ cả Ngày và Giờ để lên lịch hẹn giờ đăng!';
        isValid = false;
      } else {
        const scheduledTime = new Date(`${this.formModel.ngayHenGio}T${this.formModel.gioHenGio}:00`);
        const now = new Date();
        if (scheduledTime <= now) {
          this.formErrors['ngayHenGio'] = 'Thời gian hẹn giờ đăng phải nằm ở tương lai (Muộn hơn thời điểm hiện tại)!';
          isValid = false;
        }
      }
    }

    return isValid;
  }

  // Save News (Add or Update)
  saveNews() {
    this.onEditorChange();

    if (!this.validateForm()) {
      this.showNotification('Lỗi biểu mẫu', 'Vui lòng rà soát lại thông tin và sửa các lỗi màu đỏ trước khi lưu.', 'error');
      return;
    }

    let computedStatus = this.formModel.trangThai;
    let scheduledDateTimeStr = '';

    if (this.formModel.henGioDang) {
      computedStatus = 'HenGio';
      scheduledDateTimeStr = `${this.formModel.ngayHenGio} ${this.formModel.gioHenGio}`;
    }

    const newsData: TinTuc = {
      ...this.formModel,
      trangThai: computedStatus,
      henGioDang: this.formModel.henGioDang,
      ngayGioHenGio: scheduledDateTimeStr,
      nguoiDang: 'Nguyễn Hoài Nam (Admin)'
    };

    const backendData = this.mapNewsToBackend(newsData);

    if (this.isEditing && this.selectedNews) {
      this.tinTucService.update(this.formModel.maTinTuc, backendData).subscribe({
        next: (res) => {
          this.showNotification(
            'Cập nhật thành công',
            `Bài viết <strong>${res.TieuDe}</strong> đã được lưu trữ thành công.`,
            'success'
          );
          this.loadNews();
          this.loadLogs();
          this.closeModal();
        },
        error: (err) => {
          this.showNotification('Lỗi cập nhật', 'Không thể lưu bài viết lên backend.', 'error');
        }
      });
    } else {
      this.tinTucService.create(backendData).subscribe({
        next: (res) => {
          this.showNotification(
            'Đăng tin tức thành công',
            `Bài viết <strong>${res.TieuDe}</strong> đã được tạo thành công.`,
            'success'
          );
          this.loadNews();
          this.loadLogs();
          this.closeModal();
        },
        error: (err) => {
          this.showNotification('Lỗi tạo mới', err.error?.message || 'Không thể tạo bài viết trên backend.', 'error');
        }
      });
    }
  }

  // Confirmation Overlays (Hide, Publish, Clear)
  openConfirm(type: 'hide' | 'publish' | 'clear', news: TinTuc | null) {
    this.confirmType = type;
    this.targetNews = news;
    this.showConfirmModal = true;
  }

  closeConfirm() {
    this.showConfirmModal = false;
    this.targetNews = null;
  }

  executeConfirm() {
    if (this.confirmType === 'clear' as any) {
      if (this.editorElement) {
        this.editorElement.nativeElement.innerHTML = '';
        this.formModel.noiDungChiTiet = '';
      }
      this.closeConfirm();
      return;
    }

    if (!this.targetNews) return;
    const targetStatus = this.confirmType === 'hide' ? 'NgungHienThi' : 'DaDang';

    this.tinTucService.updateTrangThai(this.targetNews.maTinTuc, targetStatus).subscribe({
      next: (res) => {
        this.showNotification(
          this.confirmType === 'hide' ? 'Đã ẩn tin tức' : 'Đã đăng tin tức',
          `Bài viết <strong>${res.TieuDe}</strong> đã được cập nhật thành công sang trạng thái <strong>${this.getTrangThaiLabel(targetStatus)}</strong>.`,
          'success'
        );
        
        // Update formModel and selectedNews status if editing this news item
        if (this.showModal && this.formModel && this.formModel.maTinTuc === res.MaTinTuc) {
          this.formModel.trangThai = targetStatus;
          if (this.selectedNews) {
            this.selectedNews.trangThai = targetStatus;
          }
        }

        this.loadNews();
        this.loadLogs();
        this.closeConfirm();
        if (this.previewNews?.maTinTuc === res.MaTinTuc) {
          this.closePreviewModal();
        }
      },
      error: (err) => {
        this.showNotification('Lỗi cập nhật', 'Không thể cập nhật trạng thái bài viết.', 'error');
      }
    });
  }

  // News Details Popup Modal instead of sliding drawer
  openPreviewModal(news: TinTuc) {
    this.previewNews = news;
    this.previewTabActive = 'preview';
    this.showPreviewModal = true;
  }

  closePreviewModal() {
    this.showPreviewModal = false;
    this.previewNews = null;
  }

  editFromPreview(news: TinTuc) {
    this.closePreviewModal();
    // Allow the preview DOM modal to safely tear down before rendering the edit workspace
    setTimeout(() => {
      this.openEditModal(news);
    }, 150);
  }

  // Get active logs filtering just for the currently previewed news code
  getLogsForNews(newsCode: string): NhatKyTinTuc[] {
    return this.activityLogs.filter(log => log.noiDungChiTiet.includes(newsCode));
  }

  // Helpers & Utility formatters
  pushActivityLog(operation: string, details: string) {
    this.activityLogs.unshift({
      maNhatKy: 'NK' + String(this.activityLogs.length + 1).padStart(2, '0'),
      loaiThaoTac: operation,
      thoiGian: this.formatCurrentDateTime(),
      nguoiThaoTac: 'Nguyễn Hoài Nam (Admin)',
      diaChiIP: '192.168.1.12',
      noiDungChiTiet: details
    });
  }

  getTrangThaiLabel(status: string): string {
    if (status === 'DaDang') return 'Đang hiển thị';
    if (status === 'BanNhap') return 'Bản nháp';
    if (status === 'NgungHienThi') return 'Ngừng hiển thị';
    if (status === 'HenGio') return 'Lịch hẹn đăng';
    return status;
  }

  getLoaiTinTucLabel(value: string): string {
    const found = this.loaiTinTucList.find(l => l.value === value);
    return found ? found.label : (value || 'Tin tức chung');
  }

  getLoaiTinTucColor(value: string): string {
    const map: { [key: string]: string } = {
      'TinTuc': 'loai-tintuc',
      'ThongBao': 'loai-thongbao',
      'KhuyenMai': 'loai-khuyenmai',
      'SuKien': 'loai-sukien',
      'HuongDan': 'loai-huongdan',
      'TuyenDung': 'loai-tuyendung'
    };
    return map[value] || 'loai-tintuc';
  }

  showNotification(title: string, message: string, type: 'success' | 'warning' | 'error' = 'success') {
    this.notification = {
      show: true,
      title,
      message,
      type
    };
  }

  closeNotification() {
    this.notification.show = false;
  }

  formatCurrentDate(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  formatCurrentDateTime(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const sec = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
  }
}
