import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PrintService } from '../../../core/services/print.service';
import { TraCuuVeApiService } from '../../../core/services/tra-cuu-ve-api.service';
import { TimKiemApiService } from '../../../core/services/tim-kiem-api.service';

interface Ticket {
  maVe: string;
  soGhe: string;
  bienSoXe: string;
  diemDon: string;
  diemDonThoiGian: string;
  diemTra: string;
  diemTraThoiGian: string;
  giaVe: number;
  trangThaiVe: 'Chờ thanh toán' | 'Chờ khởi hành' | 'Đã hoàn thành' | 'Đã hủy' | 'Đã đánh giá';
  maQRVe: string;
}

interface Order {
  maDonHang: string;
  maKhachHang: string;
  hoTenNguoiDi: string;
  soDienThoai: string;
  email: string;
  thoiGianDat: string;
  soLuongVeDaDat: number;
  tenTuyen: string;
  gioKhoiHanh: string;
  gioTra: string;
  departureDate: string;
  diemDon: string;
  diemTra: string;
  thoiGianCoMatTruoc: string;
  gioCanCoMat: string;
  tongGiaVe: number;
  phuongThucThanhToan: string;
  trangThaiDonHang: 'Chờ thanh toán' | 'Chờ khởi hành' | 'Đã hoàn thành' | 'Đã hủy' | 'Đã đánh giá';
  bienSoXe: string;
  maDiemDon: string;
  maDiemTra: string;
  soLanDaSua: number;
  gioiHanChinhSua: number;
  maLichTrinh?: string;
  gioGoiYCoMat?: string;
  tickets: Ticket[];
}

interface LocationOption {
  maDiem: string;
  tenDiem: string;
  thoiGian?: string;
  diaChi?: string;
}

interface RatingCriteriaItem {
  label: string;
  score: number;
}

const LOCATION_OPTIONS: LocationOption[] = [
  { maDiem: 'MD01', tenDiem: 'Bến xe Miền Đông Cũ', thoiGian: '18:15', diaChi: '292 Đinh Bộ Lĩnh, P.26, Q.Bình Thạnh, TP HCM' },
  { maDiem: 'MD02', tenDiem: 'Bến xe Giáp Bát', thoiGian: '07:30', diaChi: 'Km 4, Đường Giải Phóng, Hà Nội' },
  { maDiem: 'MD03', tenDiem: 'Bến xe Gia Lâm', thoiGian: '08:00', diaChi: 'Số 1, Ngõ 278, Đường Nguyễn Văn Cừ, Gia Lâm' },
  { maDiem: 'MD04', tenDiem: 'Bến xe Miền Tây', thoiGian: '17:30', diaChi: '395 Kinh Dương Vương, P.An Lạc, Q.Bình Tân, TP.HCM' },
  { maDiem: 'MT01', tenDiem: 'Bến xe Hải Phòng', thoiGian: '13:00', diaChi: 'Đường Lê Hồng Phong, Hải Phòng' },
  { maDiem: 'MT02', tenDiem: 'Bến xe Sài Gòn', thoiGian: '18:30', diaChi: 'Số 1, Phạm Hùng, Bình Chánh, TP.HCM' },
  { maDiem: 'MT03', tenDiem: 'Bến xe Quy Nhơn', thoiGian: '05:00', diaChi: '71 Tây Sơn, Phường Ghềnh Ráng, Quy Nhơn, Bình Định' },
  { maDiem: 'MT04', tenDiem: 'Bến xe Vũng Tàu', thoiGian: '05:00', diaChi: '192 Nam Kỳ Khởi Nghĩa, P.Thắng Tam, TP.Vũng Tàu' }
];

@Component({
  selector: 'app-tim-kiem-chuyen-xe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tra-cuu-ve.html',
  styleUrl: './tra-cuu-ve.css'
})
export class TraCuuVeComponent implements OnInit {
    // Đóng dropdown khi click ra ngoài
    onEditDiemDonBlur(event: FocusEvent) {
      setTimeout(() => { this.showDiemDonDropdown = false; }, 120);
    }
    onEditDiemTraBlur(event: FocusEvent) {
      setTimeout(() => { this.showDiemTraDropdown = false; }, 120);
    }

    // Vé đã hoàn thành hoặc đã đánh giá thì không cho hủy
    isCancelDisabled(): boolean {
      if (!this.currentOrder) return true;
      return ['Đã hoàn thành', 'Đã đánh giá', 'Đã hủy'].includes(this.currentOrder.trangThaiDonHang);
    }

    // Số lần chỉnh sửa tối đa là 2/2
    getEditTimesLabel(): string {
      if (!this.currentOrder) return '';
      const max = this.currentOrder.gioiHanChinhSua || 2;
      const used = this.currentOrder.soLanDaSua || 0;
      return `${max - used}/2 lần chỉnh`;
    }
  phoneNumber = '';
  bookingCode = '';
  isLoading = false;
  currentOrder: Order | null = null;
  searchError = '';
  currentStep: 'search' | 'results' = 'search';

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  showEditModal = false;
  showCancelModal = false;
  showCancelConfirmModal = false;
  showReviewModal = false;
  showDiemDonDropdown = false;
  showDiemTraDropdown = false;
  showEditConfirmationSummary = false;
  showEditConfirmationDialog = false;

  editFullName = '';
  editPhone = '';
  editEmail = '';
  editDiemDonSearchText = '';
  editDiemTraSearchText = '';
  editMaDiemDon = '';
  editMaDiemTra = '';
  editFieldErrors: Record<string, string> = {};
  editChangeSummary: Array<{field: string; oldValue: string; newValue: string}> = [];
  selectedCancelReason = 'Tôi đổi kế hoạch';
  cancelPolicies: any[] = [];

  filterDiemDonOptions: LocationOption[] = [];
  filterDiemTraOptions: LocationOption[] = [];

  cancelReasons = [
    'Tôi đổi kế hoạch',
    'Tôi không thể tham gia',
    'Tôi gặp sự cố',
    'Lý do khác'
  ];

  reviewComment = '';
  reviewFieldError = '';
  reviewFiles: File[] = [];
  ratingCriteria: RatingCriteriaItem[] = [
    { label: 'An toàn', score: 0 },
    { label: 'Sạch sẽ', score: 0 },
    { label: 'Thái độ Nhân viên', score: 0 },
    { label: 'Đúng giờ', score: 0 },
    { label: 'Thông tin đầy đủ', score: 0 },
    { label: 'Tiện nghi', score: 0 }
  ];
  quickReviewTags = ['An toàn', 'Sạch sẽ', 'Đúng giờ', 'Thông tin đầy đủ', 'Tiện nghi'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private printService: PrintService,
    private traCuuVeApiService: TraCuuVeApiService,
    private timKiemApiService: TimKiemApiService
  ) {}

  restoreVietnameseAccents(str: string): string {
    if (!str) return '';
    const map: Record<string, string> = {
      'Ben xe Mien Tay': 'Bến xe Miền Tây',
      'Ben xe Mien Dong Cu': 'Bến xe Miền Đông Cũ',
      'Ben xe Giap Bat': 'Bến xe Giáp Bát',
      'Ben xe Gia Lam': 'Bến xe Gia Lâm',
      'Ben xe Hai Phong': 'Bến xe Hải Phòng',
      'Ben xe Sai Gon': 'Bến xe Sài Gòn',
      'Ben xe Quy Nhon': 'Bến xe Quy Nhơn',
      'Ben xe Vung Tau': 'Bến xe Vũng Tàu',
      'Ho Chi Minh - Ha Noi': 'Hồ Chí Minh - Hà Nội',
      'Ho Chi Minh - Hai Phong': 'Hồ Chí Minh - Hải Phòng',
      'Ho Chi Minh - Binh Dinh': 'Hồ Chí Minh - Bình Định',
      'Ho Chi Minh - Vung Tau': 'Hồ Chí Minh - Vũng Tàu'
    };
    return map[str] || str;
  }

  formatTimeStr(timeStr: string): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return timeStr;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const maDonHang = params['maDonHang'];
      const soDienThoai = params['soDienThoai'];
      if (maDonHang && soDienThoai) {
        this.bookingCode = maDonHang;
        this.phoneNumber = soDienThoai;
        this.searchTickets();
      }
    });
  }

  get canReview(): boolean {
    if (!this.currentOrder) return false;
    return this.currentOrder.trangThaiDonHang === 'Đã hoàn thành'
      && this.currentOrder.tickets.length > 0
      && this.currentOrder.tickets.every((ticket) => ticket.trangThaiVe === 'Đã hoàn thành');
  }

  get isReviewSubmitDisabled(): boolean {
    // Chỉ cần có ít nhất 1 tiêu chí được đánh giá (score > 0)
    const hasAnyScore = this.ratingCriteria.some(c => c.score > 0);
    return !hasAnyScore;
  }

  searchTickets(): void {
    this.isLoading = true;
    this.currentOrder = null;
    this.searchError = '';

    this.traCuuVeApiService.lookup(this.bookingCode, this.phoneNumber).subscribe({
      next: (response: any) => {
        const order = this.mapLookupResponse(response);
        if (order) {
          this.currentOrder = order;
          this.syncTicketFieldsFromOrder();
          this.currentStep = 'results';
        } else {
          this.searchError = 'Không tìm thấy đơn hàng nào với thông tin đã cung cấp.';
          this.currentStep = 'search';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Lookup error:', err);
        let errorMessage = 'Không tìm thấy đơn đặt vé nào khớp với thông tin cung cấp!';

        if (err.status === 0) {
          errorMessage = 'Không thể kết nối tới máy chủ tra cứu vé. Vui lòng kiểm tra backend hoặc kết nối mạng.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.searchError = errorMessage;
        this.currentStep = 'search';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapStatus(rawStatus: any): 'Chờ thanh toán' | 'Chờ khởi hành' | 'Đã hoàn thành' | 'Đã hủy' | 'Đã đánh giá' {
    if (!rawStatus) return 'Chờ thanh toán';
    const s = rawStatus.toString().toLowerCase();
    if (s.includes('chothanhtoan') || s.includes('cho_thanh_toan') || s.includes('cho thanh toan') || s === 'chờ thanh toán') {
      return 'Chờ thanh toán';
    }
    if (s.includes('chokhoihanh') || s.includes('cho_khoi_hanh') || s.includes('cho khoi hanh') || s === 'chờ khởi hành') {
      return 'Chờ khởi hành';
    }
    if (s.includes('dahoanthanh') || s.includes('da_hoan_thanh') || s.includes('da hoan thanh') || s === 'đã hoàn thành') {
      return 'Đã hoàn thành';
    }
    if (s.includes('dahuy') || s.includes('da_huy') || s.includes('da huy') || s === 'đã hủy') {
      return 'Đã hủy';
    }
    if (s.includes('dadanhgia') || s.includes('da_danh_gia') || s.includes('da danh gia') || s === 'đã đánh giá') {
      return 'Đã đánh giá';
    }
    return 'Chờ thanh toán';
  }

  private mapLookupResponse(response: any): Order | null {
    const data = response?.data || response;
    if (!data) {
      return null;
    }

    const orderSource = data.order || data;
    const tickets = orderSource.tickets || orderSource.ticketList || orderSource.danhSachVe || [];

    return {
      maDonHang: orderSource.MaDonHang || orderSource.maDonHang || orderSource.maDonHangHienThi || this.bookingCode,
      maKhachHang: orderSource.MaKhachHang || orderSource.maKhachHang || '',
      hoTenNguoiDi: orderSource.HoTenNguoiDi || orderSource.hoTenNguoiDi || orderSource.hoTen || '',
      soDienThoai: orderSource.SdtNguoiDi || orderSource.soDienThoai || orderSource.phone || this.phoneNumber,
      email: orderSource.EmailNguoiDi || orderSource.email || orderSource.Email || '',
      thoiGianDat: orderSource.ThoiGianDat || orderSource.thoiGianDat || orderSource.createdAt || '',
      soLuongVeDaDat: orderSource.SoLuongVeDaDat || orderSource.soLuongVeDaDat || tickets.length || 0,
      tenTuyen: orderSource.TenTuyen || orderSource.tenTuyen || orderSource.tuyenXe || '',
      gioKhoiHanh: orderSource.GioKhoiHanh || orderSource.gioKhoiHanh || orderSource.thoiGianKhoiHanh || '',
      gioTra: orderSource.GioTra || orderSource.gioTra || orderSource.thoiGianDen || '',
      departureDate: orderSource.NgayDi || orderSource.departureDate || orderSource.NgayXuatBen || '',
      diemDon: orderSource.DiemDon || orderSource.diemDon || orderSource.diemDonKhach || '',
      diemTra: orderSource.DiemTra || orderSource.diemTra || orderSource.diemTraKhach || '',
      thoiGianCoMatTruoc: orderSource.ThoiGianCoMatTruoc || orderSource.thoiGianCoMatTruoc || '',
      gioCanCoMat: orderSource.GioCanCoMat || orderSource.gioCanCoMat || '',
      tongGiaVe: orderSource.TongGiaVe || orderSource.tongGiaVe || orderSource.TongTien || 0,
      phuongThucThanhToan: orderSource.PhuongThucThanhToan || orderSource.phuongThucThanhToan || orderSource.paymentMethod || '',
      trangThaiDonHang: this.mapStatus(orderSource.TrangThaiDonHang || orderSource.trangThaiDonHang || orderSource.status),
      bienSoXe: orderSource.BienSoXe || orderSource.bienSoXe || orderSource.bienSo || '',
      maDiemDon: orderSource.MaDiemDon || orderSource.maDiemDon || '',
      maDiemTra: orderSource.MaDiemTra || orderSource.maDiemTra || '',
      soLanDaSua: orderSource.SoLanDaSua || orderSource.soLanDaSua || 0,
      gioiHanChinhSua: orderSource.GioiHanChinhSua || orderSource.gioiHanChinhSua || 2,
      maLichTrinh: orderSource.MaLichTrinh || orderSource.maLichTrinh || '',
      gioGoiYCoMat: orderSource.GioGoiYCoMat || orderSource.gioGoiYCoMat || '',
      tickets: Array.isArray(tickets) ? tickets.map((ticket: any) => ({
        maVe: ticket.MaVe || ticket.maVe || ticket.MaPhieu || '',
        soGhe: ticket.SoGhe || ticket.soGhe || ticket.SoGheXe || '',
        bienSoXe: ticket.BienSoXe || ticket.bienSoXe || orderSource.BienSoXe || '',
        diemDon: this.restoreVietnameseAccents(ticket.DiemDon || ticket.diemDon || ticket.diemDonKhach || orderSource.DiemDon || ''),
        diemDonThoiGian: ticket.DiemDonThoiGian || ticket.diemDonThoiGian || ticket.ThoiGianDon || orderSource.GioCanCoMat || '',
        diemTra: this.restoreVietnameseAccents(ticket.DiemTra || ticket.diemTra || ticket.diemTraKhach || orderSource.DiemTra || ''),
        diemTraThoiGian: ticket.DiemTraThoiGian || ticket.diemTraThoiGian || ticket.ThoiGianTra || orderSource.GioTra || '',
        giaVe: Number(ticket.GiaVe || ticket.giaVe || ticket.GiaTien || orderSource.TongGiaVe || 0),
        trangThaiVe: this.mapStatus(ticket.TrangThaiVe || ticket.trangThaiVe || ticket.status),
        maQRVe: ticket.MaQRVe || ticket.maQRVe || ticket.qrCode || ''
      })) : []
    };
  }

  backToSearch(): void {
    this.currentStep = 'search';
    this.currentOrder = null;
    this.searchError = '';
    this.showEditModal = false;
    this.showCancelModal = false;
    this.showReviewModal = false;
  }

  maskPhone(phone: string): string {
    return phone;
  }

  maskEmail(email: string): string {
    if (!email || !email.includes('@')) {
      return email;
    }

    const [name, domain] = email.split('@');
    const maskedName = name.length <= 2 ? `${name[0]}*` : `${name.slice(0, 2)}***`;
    return `${maskedName}@${domain}`;
  }

  getStatusClasses(status: string): { [key: string]: boolean } {
    return {
      'bg-success-light': status === 'Đã hoàn thành' || status === 'Đã đánh giá',
      'text-success-text': status === 'Đã hoàn thành' || status === 'Đã đánh giá',
      'bg-danger-light': status === 'Đã hủy',
      'text-danger-text': status === 'Đã hủy',
      'bg-info-light': status === 'Chờ thanh toán',
      'text-info-text': status === 'Chờ thanh toán',
      'bg-warning-light': status === 'Chờ khởi hành',
      'text-warning-text': status === 'Chờ khởi hành'
    };
  }

  getTicketStatusClasses(status: string): { [key: string]: boolean } {
    return {
      'bg-success-light': status === 'Đã hoàn thành' || status === 'Đã đánh giá',
      'text-success-text': status === 'Đã hoàn thành' || status === 'Đã đánh giá',
      'bg-danger-light': status === 'Đã hủy',
      'text-danger-text': status === 'Đã hủy',
      'bg-info-light': status === 'Chờ thanh toán',
      'text-info-text': status === 'Chờ thanh toán',
      'bg-warning-light': status === 'Chờ khởi hành',
      'text-warning-text': status === 'Chờ khởi hành'
    };
  }

  getPresenceTimeLabel(): string {
    if (!this.currentOrder) {
      return '';
    }
    const gio = this.formatTimeStr(this.currentOrder.gioGoiYCoMat || this.currentOrder.gioCanCoMat);
    return `${gio} ${this.formatDisplayDate(this.currentOrder.departureDate)}`;
  }

  getPickupTimeLabel(): string {
    if (!this.currentOrder) {
      return '';
    }

    const departure = this.buildDepartureDate(this.currentOrder.departureDate, this.currentOrder.gioKhoiHanh);
    if (!departure) {
      return '';
    }

    departure.setMinutes(departure.getMinutes() - 30);

    const time = `${String(departure.getHours()).padStart(2, '0')}:${String(departure.getMinutes()).padStart(2, '0')}`;
    return `Trước ${time} ${this.formatDisplayDate(this.currentOrder.departureDate)}`;
  }

  getEditLimit(): number {
    return 2;
  }

  getEditRemaining(): number {
    if (!this.currentOrder) {
      return 0;
    }

    return Math.max(this.getEditLimit() - (this.currentOrder.soLanDaSua || 0), 0);
  }

  canEditOrder(): boolean {
    return this.getEditRemaining() > 0;
  }

  // Helper to calculate hours remaining until departure
  getHoursUntilDeparture(): number | null {
    if (!this.currentOrder || !this.currentOrder.departureDate || !this.currentOrder.gioKhoiHanh) {
      return null;
    }
    const departureDateTime = this.buildDepartureDate(this.currentOrder.departureDate, this.currentOrder.gioKhoiHanh);
    if (!departureDateTime) {
      return null;
    }
    const now = new Date();
    const diffMs = departureDateTime.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
  }

  // New getter for "Sửa thông tin" button enabled state
  get isEditButtonEnabled(): boolean {
    if (!this.currentOrder) return false;

    const orderStatus = this.currentOrder.trangThaiDonHang;
    const ticketsStatusValid = this.currentOrder.tickets.every(
      ticket => ticket.trangThaiVe === 'Chờ thanh toán' || ticket.trangThaiVe === 'Chờ khởi hành'
    );

    const canEditCount = this.getEditRemaining() > 0;
    const hoursRemaining = this.getHoursUntilDeparture();
    const hasEnoughTime = hoursRemaining !== null && hoursRemaining >= 2;

    return (orderStatus === 'Chờ thanh toán' || orderStatus === 'Chờ khởi hành') &&
           ticketsStatusValid &&
           canEditCount &&
           hasEnoughTime;
  }

  // New getter for "Sửa thông tin" button disabled state (for visual dimming)
  get isEditButtonDisabled(): boolean {
    if (!this.currentOrder) return true; // Always disabled if no order

    const orderStatus = this.currentOrder.trangThaiDonHang;
    const ticketsStatusValid = this.currentOrder.tickets.every(
      ticket => ticket.trangThaiVe === 'Chờ thanh toán' || ticket.trangThaiVe === 'Chờ khởi hành'
    );

    const canEditCount = this.getEditRemaining() > 0;
    const hoursRemaining = this.getHoursUntilDeparture();
    const hasEnoughTime = hoursRemaining !== null && hoursRemaining >= 2;

    // Disabled if status is not 'ChoThanhToan' or 'ChoKhoiHanh'
    // OR if not enough edit count
    // OR if not enough time remaining
    // OR if any ticket status is not 'ChoThanhToan' or 'ChoKhoiHanh'
    return !((orderStatus === 'Chờ thanh toán' || orderStatus === 'Chờ khởi hành') &&
             ticketsStatusValid &&
             canEditCount &&
             hasEnoughTime);
  }

  // New getter for "Hủy vé" button enabled state - only enable when already paid (ChoKhoiHanh)
  get isCancelButtonEnabled(): boolean {
    if (!this.currentOrder) return false;
    const orderStatus = this.currentOrder.trangThaiDonHang;
    const ticketsStatusValid = this.currentOrder.tickets.every(
      ticket => ticket.trangThaiVe === 'Chờ khởi hành'
    );
    return orderStatus === 'Chờ khởi hành' && ticketsStatusValid;
  }

  // New getter for "Yêu cầu hủy vé" button disabled state (for visual dimming)
  get isCancelButtonDisabled(): boolean {
    return !this.isCancelButtonEnabled;
  }

  // New getter for "Đánh giá dịch vụ" button enabled state
  get isReviewButtonEnabled(): boolean {
    if (!this.currentOrder) return false;
    const orderStatus = this.currentOrder.trangThaiDonHang;
    const ticketsStatusValid = this.currentOrder.tickets.every(
      ticket => ticket.trangThaiVe === 'Đã hoàn thành'
    );
    return orderStatus === 'Đã hoàn thành' && ticketsStatusValid;
  }

  // New getter for "Đánh giá dịch vụ" button disabled state (for visual dimming)
  get isReviewButtonDisabled(): boolean {
    return !this.isReviewButtonEnabled;
  }
  
  canShowEditButton(): boolean {
    return this.getEditRemaining() > 0;
  }

  formatPrice(price: number): string {
    return (price || 0).toLocaleString('vi-VN') + 'đ';
  }

  formatDisplayDate(dateString: string): string {
    if (!dateString) {
      return '';
    }

    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) {
      return dateString;
    }

    return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
  }

  getRefundPercentage(): number {
    if (!this.currentOrder) {
      return 0;
    }

    const departure = this.buildDepartureDate(this.currentOrder.departureDate, this.currentOrder.gioKhoiHanh);
    if (!departure) {
      return 0;
    }

    const diffHours = (departure.getTime() - new Date().getTime()) / (1000 * 60 * 60);

    if (diffHours <= 0) {
      return 0;
    }
    if (diffHours >= 24) {
      return 100;
    }
    if (diffHours >= 12) {
      return 50;
    }
    return 0;
  }

  getRefundFee(): number {
    if (!this.currentOrder) {
      return 0;
    }

    return this.currentOrder.tongGiaVe * (1 - this.getRefundPercentage() / 100);
  }

  getRefundAmount(): number {
    if (!this.currentOrder) {
      return 0;
    }

    return this.currentOrder.tongGiaVe * (this.getRefundPercentage() / 100);
  }

  getQrCodeUrl(ticket: Ticket): string {
    const orderCode = this.currentOrder?.maDonHang || 'unknown';
    const data = `${orderCode}|${ticket.maVe}|${ticket.maQRVe}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(data)}`;
  }

  openEditOrderModal(): void {
    if (!this.currentOrder) {
      return;
    }

    if (this.isEditButtonDisabled) {
      const hoursRemaining = this.getHoursUntilDeparture();
      if (hoursRemaining !== null && hoursRemaining < 2) {
        this.showToast('Bạn chỉ có thể chỉnh sửa vé khi còn ít nhất 2 tiếng trước giờ khởi hành.', 'error');
      } else {
        this.showToast('Bạn không thể chỉnh sửa vé ở trạng thái hiện tại.', 'error');
      }
      return;
    }

    this.editFullName = this.currentOrder.hoTenNguoiDi;
    this.editPhone = this.currentOrder.soDienThoai;
    this.editEmail = this.currentOrder.email;
    this.editDiemDonSearchText = this.currentOrder.diemDon;
    this.editDiemTraSearchText = this.currentOrder.diemTra;
    this.editMaDiemDon = this.currentOrder.maDiemDon;
    this.editMaDiemTra = this.currentOrder.maDiemTra;

    const maLichTrinh = this.currentOrder.maLichTrinh || '';
    if (maLichTrinh) {
      this.isLoading = true;
      this.timKiemApiService.getTripDetail(maLichTrinh).subscribe({
        next: (res: any) => {
          if (res?.data) {
            const trip = res.data;
            // Use dynamically fetched options from getTripDetail response (diemDungLichTrinh)
            const pickupPoints = trip.diemDungLichTrinh || trip.pickupPoints || trip.diemDon || [];
            const dropoffPoints = trip.diemDungLichTrinh || trip.dropoffPoints || trip.diemTra || [];
            
            this.filterDiemDonOptions = (Array.isArray(pickupPoints) ? pickupPoints : []).map((p: any) => ({
              maDiem: p.maDiem || p.MaDiem || p.id,
              tenDiem: p.tenDiem || p.TenDiem || p.name,
              thoiGian: p.thoiGian || p.ThoiGian || p.time || '',
              diaChi: p.diaChi || p.DiaChi || p.address || ''
            }));
            this.filterDiemTraOptions = (Array.isArray(dropoffPoints) ? dropoffPoints : []).map((p: any) => ({
              maDiem: p.maDiem || p.MaDiem || p.id,
              tenDiem: p.tenDiem || p.TenDiem || p.name,
              thoiGian: p.thoiGian || p.ThoiGian || p.time || '',
              diaChi: p.diaChi || p.DiaChi || p.address || ''
            }));
          } else {
            this.filterDiemDonOptions = [...LOCATION_OPTIONS];
            this.filterDiemTraOptions = [...LOCATION_OPTIONS];
          }
          this.showDiemDonDropdown = false;
          this.showDiemTraDropdown = false;
          this.showEditModal = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.filterDiemDonOptions = [...LOCATION_OPTIONS];
          this.filterDiemTraOptions = [...LOCATION_OPTIONS];
          this.showDiemDonDropdown = false;
          this.showDiemTraDropdown = false;
          this.showEditModal = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.filterDiemDonOptions = [...LOCATION_OPTIONS];
      this.filterDiemTraOptions = [...LOCATION_OPTIONS];
      this.showDiemDonDropdown = false;
      this.showDiemTraDropdown = false;
      this.showEditModal = true;
    }
  }

  closeEditOrderModal(): void {
    this.showEditModal = false;
    this.showEditConfirmationSummary = false;
    this.showEditConfirmationDialog = false;
    this.editFieldErrors = {};
    this.editChangeSummary = [];
  }

  onEditDiemDonInput(): void {
    const search = this.editDiemDonSearchText.toLowerCase().trim();
    // Filter using dynamically fetched options if available, otherwise fallback to LOCATION_OPTIONS
    const optionsToFilter = this.filterDiemDonOptions.length > 0 ? this.filterDiemDonOptions : LOCATION_OPTIONS;
    this.filterDiemDonOptions = search
      ? optionsToFilter.filter((item) =>
          item.tenDiem.toLowerCase().includes(search) ||
          (item.diaChi || '').toLowerCase().includes(search)
        )
      : [...optionsToFilter];
    this.showDiemDonDropdown = true;
  }

  onEditDiemTraInput(): void {
    const search = this.editDiemTraSearchText.toLowerCase().trim();
    // Filter using dynamically fetched options if available, otherwise fallback to LOCATION_OPTIONS
    const optionsToFilter = this.filterDiemTraOptions.length > 0 ? this.filterDiemTraOptions : LOCATION_OPTIONS;
    this.filterDiemTraOptions = search
      ? optionsToFilter.filter((item) =>
          item.tenDiem.toLowerCase().includes(search) ||
          (item.diaChi || '').toLowerCase().includes(search)
        )
      : [...optionsToFilter];
    this.showDiemTraDropdown = true;
  }

  isEditSaveDisabled(): boolean {
    if (!this.currentOrder || !this.canEditOrder()) {
      return true;
    }

    const hoursRemaining = this.getHoursUntilDeparture();
    if (hoursRemaining === null || hoursRemaining < 2) {
      return true;
    }

    const hasFullNameChanged = this.editFullName.trim() !== this.currentOrder.hoTenNguoiDi;
    const hasPhoneChanged = this.editPhone.trim() !== this.currentOrder.soDienThoai;
    const hasEmailChanged = this.editEmail.trim() !== this.currentOrder.email;
    const hasPickupChanged = this.editMaDiemDon !== this.currentOrder.maDiemDon;
    const hasDropoffChanged = this.editMaDiemTra !== this.currentOrder.maDiemTra;

    return !(hasFullNameChanged || hasPhoneChanged || hasEmailChanged || hasPickupChanged || hasDropoffChanged);
  }

  private validateEditForm(): boolean {
    this.editFieldErrors = {};
    const fullName = this.editFullName.trim();
    const phone = this.editPhone.trim();
    const maDiemDon = this.editMaDiemDon.trim();
    const maDiemTra = this.editMaDiemTra.trim();

    // Validate full name
    if (!fullName) {
      this.editFieldErrors['hoTenNguoiDi'] = 'Họ tên người đi không được bỏ trống.';
    } else if (fullName.length < 3) {
      this.editFieldErrors['hoTenNguoiDi'] = 'Họ tên phải có ít nhất 3 ký tự.';
    } else if (fullName.length > 100) {
      this.editFieldErrors['hoTenNguoiDi'] = 'Họ tên không được vượt quá 100 ký tự.';
    }

    // Validate phone (Vietnamese phone format)
    if (!phone) {
      this.editFieldErrors['soDienThoai'] = 'Số điện thoại không được bỏ trống.';
    } else if (!/^0\d{9,10}$/.test(phone.replace(/\s/g, ''))) {
      this.editFieldErrors['soDienThoai'] = 'Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số bắt đầu từ 0.';
    }

    // Validate pickup point
    if (!maDiemDon) {
      this.editFieldErrors['maDiemDon'] = 'Vui lòng chọn điểm đón.';
    }

    // Validate dropoff point
    if (!maDiemTra) {
      this.editFieldErrors['maDiemTra'] = 'Vui lòng chọn điểm trả.';
    }

    // If there are errors, display them and return false
    if (Object.keys(this.editFieldErrors).length > 0) {
      this.cdr.detectChanges();
      return false;
    }

    return true;
  }

  private buildEditChangeSummary(): boolean {
    if (!this.currentOrder) return false;
    this.editChangeSummary = [];

    if (this.editFullName.trim() !== this.currentOrder.hoTenNguoiDi) {
      this.editChangeSummary.push({
        field: 'Họ tên người đi',
        oldValue: this.currentOrder.hoTenNguoiDi,
        newValue: this.editFullName.trim()
      });
    }

    if (this.editPhone.trim() !== this.currentOrder.soDienThoai) {
      this.editChangeSummary.push({
        field: 'Số điện thoại',
        oldValue: this.currentOrder.soDienThoai,
        newValue: this.editPhone.trim()
      });
    }

    if (this.editEmail.trim() !== this.currentOrder.email) {
      this.editChangeSummary.push({
        field: 'Email',
        oldValue: this.currentOrder.email,
        newValue: this.editEmail.trim()
      });
    }

    const oldDiemDon = this.filterDiemDonOptions.find(d => d.maDiem === this.currentOrder?.maDiemDon)?.tenDiem || this.currentOrder?.diemDon || 'N/A';
    const newDiemDon = this.filterDiemDonOptions.find(d => d.maDiem === this.editMaDiemDon)?.tenDiem || '';
    if (this.editMaDiemDon !== this.currentOrder.maDiemDon) {
      this.editChangeSummary.push({
        field: 'Điểm đón',
        oldValue: oldDiemDon,
        newValue: newDiemDon
      });
    }

    const oldDiemTra = this.filterDiemTraOptions.find(d => d.maDiem === this.currentOrder?.maDiemTra)?.tenDiem || this.currentOrder?.diemTra || 'N/A';
    const newDiemTra = this.filterDiemTraOptions.find(d => d.maDiem === this.editMaDiemTra)?.tenDiem || '';
    if (this.editMaDiemTra !== this.currentOrder.maDiemTra) {
      this.editChangeSummary.push({
        field: 'Điểm trả',
        oldValue: oldDiemTra,
        newValue: newDiemTra
      });
    }

    return this.editChangeSummary.length > 0;
  }

  openEditConfirmationDialog(): void {
    this.showEditConfirmationSummary = false;
    this.showEditConfirmationDialog = true;
  }

  closeEditConfirmationDialog(): void {
    this.showEditConfirmationDialog = false;
    this.showEditConfirmationSummary = false;
    this.showEditModal = false;
    this.editFieldErrors = {};
    this.editChangeSummary = [];
  }

  closeEditConfirmationSummary(): void {
    this.showEditConfirmationSummary = false;
    this.showEditConfirmationDialog = false;
  }

  confirmAndSaveEdit(): void {
    this.showEditConfirmationDialog = false;
    this.showEditConfirmationSummary = false;
    this.proceedWithSaveAfterValidation();
  }

  saveEditChanges(): void {
    if (!this.currentOrder) {
      return;
    }

    // Step 3: Validate form
    if (!this.validateEditForm()) {
      return;
    }

    // Step 4: Build change summary - if there are changes, show confirmation summary
    if (!this.buildEditChangeSummary()) {
      this.showToast('Không có thay đổi nào để lưu.', 'error');
      return;
    }

    // Show confirmation summary
    this.showEditConfirmationDialog = false;
    this.showEditConfirmationSummary = true;
    this.cdr.detectChanges();
    return;
  }

  proceedWithSaveAfterValidation(): void {
    if (!this.currentOrder || this.isEditSaveDisabled()) {
      if (this.currentOrder) {
        this.showToast('Không có thay đổi nào để lưu hoặc bạn đã hết lượt chỉnh sửa.', 'error');
      }
      return;
    }

    const payload = {
      HoTenNguoiDi: this.editFullName.trim(),
      SdtNguoiDi: this.editPhone.trim(),
      EmailNguoiDi: this.editEmail.trim() || undefined,
      MaDiemDon: this.editMaDiemDon,
      MaDiemTra: this.editMaDiemTra
    };

    const existingOrder = this.currentOrder;
    this.isLoading = true;
    const previousEditCount = existingOrder.soLanDaSua || 0;
    this.traCuuVeApiService.updateInfo(existingOrder.maDonHang, payload).subscribe({
      next: (response: any) => {
        const data = response?.data || response;
        if (data) {
          const updatedOrder = this.mapLookupResponse(response) || existingOrder!;
          updatedOrder.soLanDaSua = Math.max(updatedOrder.soLanDaSua || 0, previousEditCount + 1);
          this.currentOrder = updatedOrder;
          this.syncTicketFieldsFromOrder();
          this.showToast('Cập nhật thông tin vé thành công.', 'success');
        } else {
          this.showToast('Không thể cập nhật thông tin vé.', 'error');
        }
        this.showEditModal = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Update info error:', err);
        this.showToast(err.error?.message || 'Cập nhật thông tin thất bại.', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCancelModal(): void {
    if (!this.currentOrder) return;
    this.isLoading = true;
    this.traCuuVeApiService.getCancelPolicies().subscribe({
      next: (response: any) => {
        const data = response?.data || response;
        if (Array.isArray(data)) {
          this.cancelPolicies = data;
        } else if (data && typeof data === 'object') {
          this.cancelPolicies = [data];
        } else {
          this.cancelPolicies = [];
        }
        this.showCancelModal = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading cancel policies:', err);
        this.cancelPolicies = [];
        this.showCancelModal = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.showCancelConfirmModal = false;
  }

  openCancelConfirmModal(): void {
    this.showCancelConfirmModal = true;
  }

  closeCancelConfirmModal(): void {
    this.showCancelConfirmModal = false;
  }

  confirmCancelTicket(): void {
    if (!this.currentOrder) {
      return;
    }

    if (!this.selectedCancelReason.trim()) {
      this.showToast('Vui lòng chọn lý do hủy vé.', 'error');
      return;
    }

    // Không cho hủy nếu không có khoản hoàn tiền (dưới 12 giờ)
    if (this.getRefundPercentage() === 0) {
      this.showToast('Không thể hủy vé khi chỉ còn dưới 12 giờ trước khởi hành.', 'error');
      return;
    }

    const activeTickets = this.currentOrder.tickets.filter(t => t.trangThaiVe !== 'Đã hủy');
    if (activeTickets.length === 0) {
      this.showToast('Không có vé nào khả dụng để hủy.', 'error');
      return;
    }

    this.isLoading = true;

    const cancelRequests = activeTickets.map(ticket => 
      this.traCuuVeApiService.cancelTicket(ticket.maVe, this.selectedCancelReason)
    );

    import('rxjs').then(({ forkJoin }) => {
      forkJoin(cancelRequests).subscribe({
        next: (results: any[]) => {
          this.traCuuVeApiService.lookup(this.currentOrder!.maDonHang, this.phoneNumber).subscribe({
            next: (response: any) => {
              const data = response?.data || response;
              if (data) {
                this.currentOrder = this.mapLookupResponse(response);
                this.syncTicketFieldsFromOrder();
              }
              this.showCancelModal = false;
              this.showCancelConfirmModal = false;
              this.isLoading = false;
              this.showToast('Hủy vé thành công.', 'success');
              this.cdr.detectChanges();
            },
            error: (err: any) => {
              this.showCancelModal = false;
              this.showCancelConfirmModal = false;
              this.isLoading = false;
              this.showToast('Hủy vé thành công nhưng không thể tải lại thông tin.', 'success');
              this.cdr.detectChanges();
            }
          });
        },
        error: (err: any) => {
          console.error('Cancel ticket error:', err);
          this.showToast(err.error?.message || 'Hủy vé thất bại.', 'error');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  openReviewModal(): void {
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.reviewComment = '';
    this.reviewFiles = [];
    this.reviewFieldError = '';
  }

  setRating(index: number, score: number): void {
    this.ratingCriteria[index].score = score;
  }

  addReviewTag(tag: string): void {
    if (this.reviewComment.includes(tag)) {
      this.reviewComment = this.reviewComment.replace(tag, '').replace(/\s{2,}/g, ' ').trim();
      return;
    }

    this.reviewComment = this.reviewComment ? `${this.reviewComment}, ${tag}` : tag;
  }

  onReviewFilesSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files ? Array.from(target.files) : [];

    this.reviewFiles = [...this.reviewFiles, ...files].slice(0, 3);
    target.value = '';
  }

  removeReviewFile(index: number): void {
    this.reviewFiles = this.reviewFiles.filter((_, itemIndex) => itemIndex !== index);
  }

  submitReview(): void {
    if (!this.currentOrder || this.isReviewSubmitDisabled) {
      return;
    }

    if (this.reviewFieldError) {
      this.showToast('Vui lòng sửa lỗi ở ô nhận xét trước khi gửi.', 'error');
      return;
    }

    const avgScore = Math.round(this.ratingCriteria.reduce((sum, c) => sum + c.score, 0) / this.ratingCriteria.length) || 5;
    
    // Convert files to Base64 and prepare mediaUrls
    const fileConversionPromises = this.reviewFiles.map(file => this.fileToBase64(file));
    
    Promise.all(fileConversionPromises).then((mediaUrls) => {
      const reviewRequests = this.currentOrder!.tickets.map(ticket => 
        this.traCuuVeApiService.submitReview({
          MaVe: ticket.maVe,
          MaKhachHang: this.currentOrder!.maKhachHang,
          SoSao: avgScore,
          NoiDungDanhGia: this.reviewComment || 'Dịch vụ tốt',
          mediaUrls: mediaUrls // Pass Base64 file data
        })
      );

      this.isLoading = true;
      import('rxjs').then(({ forkJoin }) => {
        forkJoin(reviewRequests).subscribe({
          next: (results: any[]) => {
            this.showReviewModal = false;
            this.reviewComment = '';
            this.reviewFiles = [];
            this.showToast('Đánh giá đã được gửi thành công.', 'success');

            this.traCuuVeApiService.lookup(this.currentOrder!.maDonHang, this.phoneNumber).subscribe({
              next: (response: any) => {
                const data = response?.data || response;
                if (data) {
                  this.currentOrder = data;
                  this.syncTicketFieldsFromOrder();
                }
                this.isLoading = false;
                this.cdr.detectChanges();
              },
              error: () => {
                this.isLoading = false;
                this.cdr.detectChanges();
              }
            });
          },
          error: (err: any) => {
            console.error('Submit review error:', err);
            const fieldErrors = err.error?.fieldErrors || null;
            if (fieldErrors && fieldErrors.NoiDungDanhGia) {
              this.reviewFieldError = fieldErrors.NoiDungDanhGia;
              this.showToast('Nội dung đánh giá không hợp lệ. Vui lòng sửa.', 'error');
            } else {
              this.showToast(err.error?.message || 'Gửi đánh giá thất bại.', 'error');
            }
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      });
    }).catch((err) => {
      console.error('Error converting files to Base64:', err);
      this.showToast('Lỗi xử lý file. Vui lòng thử lại.', 'error');
    });
  }

  printTicket(ticket: Ticket): void {
    if (!this.currentOrder) {
      return;
    }

    const departureDateLabel = this.formatDisplayDate(this.currentOrder.departureDate);
    const departureTimeLabel = `${this.currentOrder.gioKhoiHanh} ${departureDateLabel}`;
    const printData = {
      maDonHang: this.currentOrder.maDonHang,
      maVe: ticket.maVe,
      maQRVe: ticket.maQRVe,
      qrUrl: this.getQrCodeUrl(ticket),
      tenTuyen: this.currentOrder.tenTuyen,
      thoiGianKhoiHanh: departureTimeLabel,
      soGhe: ticket.soGhe,
      diemDon: this.currentOrder.diemDon,
      diemTra: this.currentOrder.diemTra,
      bienSoXe: ticket.bienSoXe,
      giaVe: ticket.giaVe
    };

    this.printService.printTicket(printData);
  }

  selectDiemDon(option: LocationOption): void {
    this.editMaDiemDon = option.maDiem;
    this.editDiemDonSearchText = option.tenDiem;
    this.showDiemDonDropdown = false;
    this.filterDiemDonOptions = [option];
  }

  selectDiemTra(option: LocationOption): void {
    this.editMaDiemTra = option.maDiem;
    this.editDiemTraSearchText = option.tenDiem;
    this.showDiemTraDropdown = false;
    this.filterDiemTraOptions = [option];
  }

  private syncTicketFieldsFromOrder(): void {
    if (!this.currentOrder) {
      return;
    }

    const ticketPrice = this.currentOrder.soLuongVeDaDat > 0
      ? Math.round(this.currentOrder.tongGiaVe / this.currentOrder.soLuongVeDaDat)
      : this.currentOrder.tongGiaVe;

    this.currentOrder.tickets = this.currentOrder.tickets.map((ticket) => ({
      ...ticket,
      bienSoXe: this.currentOrder!.bienSoXe,
      diemDon: this.restoreVietnameseAccents(this.currentOrder!.diemDon),
      // Preserve ticket's own pickup time if it exists, otherwise use order's departure info
      diemDonThoiGian: ticket.diemDonThoiGian || `${this.formatTimeStr(this.currentOrder!.gioKhoiHanh)} ngày ${this.formatDisplayDate(this.currentOrder!.departureDate)}`,
      diemTra: this.restoreVietnameseAccents(this.currentOrder!.diemTra),
      // Preserve ticket's own dropoff time if it exists, otherwise use order's arrival info
      diemTraThoiGian: ticket.diemTraThoiGian || `${this.formatTimeStr(this.currentOrder!.gioTra || this.currentOrder!.gioKhoiHanh)} ngày ${this.formatDisplayDate(this.currentOrder!.departureDate)}`,
      giaVe: ticket.giaVe || ticketPrice,
      maQRVe: ticket.maQRVe || `QR-${ticket.maVe}`
    }));
    // Ensure UI ticket statuses match order status; if mismatch, persist to backend to cascade updates
    this.ensureStatusesSynced();
  }

  private ensureStatusesSynced(): void {
    if (!this.currentOrder) return;
    const orderStatus = this.currentOrder.trangThaiDonHang;
    const mismatched = this.currentOrder.tickets.some(t => t.trangThaiVe !== orderStatus);
    if (!mismatched) return;

    // Call backend to update order status and cascade to tickets
    this.traCuuVeApiService.updateOrderStatus(this.currentOrder.maDonHang, orderStatus).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        if (data) {
          this.currentOrder = data;
          this.syncTicketFieldsFromOrder();
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error syncing statuses:', err);
      }
    });
  }

  private buildDepartureDate(dateString: string, timeString: string): Date | null {
    if (!dateString || !timeString) {
      return null;
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const [hour, minute] = timeString.split(':').map(Number);

    if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
      return null;
    }

    return new Date(year, month - 1, day, hour, minute, 0, 0);
  }

  // Helper to convert file to Base64 string
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;

    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 2500);
  }
}
