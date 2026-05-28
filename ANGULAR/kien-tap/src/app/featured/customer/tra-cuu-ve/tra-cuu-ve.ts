import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
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
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
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
  showReviewModal = false;
  showDiemDonDropdown = false;
  showDiemTraDropdown = false;

  editFullName = '';
  editPhone = '';
  editEmail = '';
  editDiemDonSearchText = '';
  editDiemTraSearchText = '';
  editMaDiemDon = '';
  editMaDiemTra = '';
  selectedCancelReason = 'Tôi đổi kế hoạch';

  filterDiemDonOptions: LocationOption[] = [];
  filterDiemTraOptions: LocationOption[] = [];

  cancelReasons = [
    'Tôi đổi kế hoạch',
    'Khách hàng không thể tham gia',
    'Tôi gặp sự cố',
    'Lý do khác'
  ];

  reviewComment = '';
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
      trangThaiDonHang: orderSource.TrangThaiDonHang || orderSource.trangThaiDonHang || orderSource.status || 'Chờ thanh toán',
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
        trangThaiVe: ticket.TrangThaiVe || ticket.trangThaiVe || ticket.status || 'Chờ thanh toán',
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
  
  canShowEditButton(): boolean {
    if (!this.currentOrder) return false;
    const isOrderChoKhoiHanh = this.currentOrder.trangThaiDonHang === 'Chờ khởi hành';
    const areAllTicketsChoKhoiHanh = this.currentOrder.tickets.every(
      ticket => ticket.trangThaiVe === 'Chờ khởi hành'
    );
    return isOrderChoKhoiHanh && areAllTicketsChoKhoiHanh && this.canEditOrder();
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

    if (!this.canEditOrder()) {
      this.showToast('Bạn đã hết lượt chỉnh sửa thông tin cho vé này.', 'error');
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

    const hasFullNameChanged = this.editFullName.trim() !== this.currentOrder.hoTenNguoiDi;
    const hasPhoneChanged = this.editPhone.trim() !== this.currentOrder.soDienThoai;
    const hasEmailChanged = this.editEmail.trim() !== this.currentOrder.email;
    const hasPickupChanged = this.editMaDiemDon !== this.currentOrder.maDiemDon;
    const hasDropoffChanged = this.editMaDiemTra !== this.currentOrder.maDiemTra;

    return !(hasFullNameChanged || hasPhoneChanged || hasEmailChanged || hasPickupChanged || hasDropoffChanged);
  }

  saveEditChanges(): void {
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

    this.isLoading = true;
    this.traCuuVeApiService.updateInfo(this.currentOrder.maDonHang, payload).subscribe({
      next: (response: any) => {
        const data = response?.data || response;
        if (data) {
          this.currentOrder = data;
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
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  confirmCancelTicket(): void {
    if (!this.currentOrder) {
      return;
    }

    if (!this.selectedCancelReason.trim()) {
      this.showToast('Vui lòng chọn lý do hủy vé.', 'error');
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
                this.currentOrder = data;
                this.syncTicketFieldsFromOrder();
              }
              this.showCancelModal = false;
              this.isLoading = false;
              this.showToast('Yêu cầu hủy vé thành công.', 'success');
              this.cdr.detectChanges();
            },
            error: (err: any) => {
              this.showCancelModal = false;
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
            this.showToast(err.error?.message || 'Gửi đánh giá thất bại.', 'error');
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
    const pickupTimeLabel = this.getPresenceTimeLabel();

    const printData = {
      maDonHang: this.currentOrder.maDonHang,
      maVe: ticket.maVe,
      maQRVe: ticket.maQRVe,
      qrUrl: this.getQrCodeUrl(ticket),
      tenTuyen: this.currentOrder.tenTuyen,
      thoiGianKhoiHanh: departureTimeLabel,
      soGhe: ticket.soGhe,
      diemDon: this.currentOrder.diemDon,
      thoiGianToiDiemLenXe: pickupTimeLabel,
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
