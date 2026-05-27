import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { PrintService } from '../../../core/services/print.service';

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

const MOCK_ORDERS: Order[] = [
  {
    maDonHang: 'P5CDWE67',
    hoTenNguoiDi: 'Đỗ Thị Phương',
    soDienThoai: '0908123456',
    email: 'phuong@example.com',
    thoiGianDat: '2026-05-15 09:30',
    soLuongVeDaDat: 1,
    tenTuyen: 'TP.HCM - Quy Nhơn',
    gioKhoiHanh: '18:00',
    gioTra: '05:00',
    departureDate: '2026-05-25',
    diemDon: 'Bến xe Miền Tây',
    diemTra: 'Bến xe Quy Nhơn',
    thoiGianCoMatTruoc: '17:30',
    gioCanCoMat: '17:30',
    tongGiaVe: 400000,
    phuongThucThanhToan: 'Momo',
    trangThaiDonHang: 'Đã hoàn thành',
    bienSoXe: '51B-299.64',
    maDiemDon: 'MD04',
    maDiemTra: 'MT03',
    soLanDaSua: 1,
    gioiHanChinhSua: 3,
    tickets: [
      {
        maVe: 'VE-001',
        soGhe: 'A01',
        bienSoXe: '51B-299.64',
        diemDon: 'Bến xe Miền Tây',
        diemDonThoiGian: '17:30 ngày 25-05-2026',
        diemTra: 'Bến xe Quy Nhơn',
        diemTraThoiGian: '05:00 ngày 26-05-2026',
        giaVe: 400000,
        trangThaiVe: 'Đã hoàn thành',
        maQRVe: 'QR-VE-001'
      }
    ]
  },
  {
    maDonHang: 'P5CDWE88',
    hoTenNguoiDi: 'Trần Ngọc Bảo Nghi',
    soDienThoai: '0912345678',
    email: 'bao.nghi@example.com',
    thoiGianDat: '2026-05-16 10:15',
    soLuongVeDaDat: 2,
    tenTuyen: 'Hà Nội - Sài Gòn',
    gioKhoiHanh: '08:00',
    gioTra: '18:30',
    departureDate: '2026-06-02',
    diemDon: 'Bến xe Giáp Bát',
    diemTra: 'Bến xe Sài Gòn',
    thoiGianCoMatTruoc: '07:30',
    gioCanCoMat: '07:30',
    tongGiaVe: 980000,
    phuongThucThanhToan: 'Thẻ ngân hàng',
    trangThaiDonHang: 'Chờ khởi hành',
    bienSoXe: '29B-67890',
    maDiemDon: 'MD02',
    maDiemTra: 'MT02',
    soLanDaSua: 0,
    gioiHanChinhSua: 2,
    tickets: [
      {
        maVe: 'VE-002',
        soGhe: 'B01',
        bienSoXe: '29B-67890',
        diemDon: 'Bến xe Giáp Bát',
        diemDonThoiGian: '07:30 ngày 02-06-2026',
        diemTra: 'Bến xe Sài Gòn',
        diemTraThoiGian: '18:30 ngày 02-06-2026',
        giaVe: 490000,
        trangThaiVe: 'Chờ khởi hành',
        maQRVe: 'QR-VE-002'
      },
      {
        maVe: 'VE-003',
        soGhe: 'B02',
        bienSoXe: '29B-67890',
        diemDon: 'Bến xe Giáp Bát',
        diemDonThoiGian: '07:30 ngày 02-06-2026',
        diemTra: 'Bến xe Sài Gòn',
        diemTraThoiGian: '18:30 ngày 02-06-2026',
        giaVe: 490000,
        trangThaiVe: 'Chờ khởi hành',
        maQRVe: 'QR-VE-003'
      }
    ]
  }
];

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
export class TraCuuVeComponent {
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
    private cdr: ChangeDetectorRef,
    private printService: PrintService
  ) {}

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

    setTimeout(() => {
      const found = MOCK_ORDERS.find(
        (order) =>
          order.maDonHang.toLowerCase() === this.bookingCode.trim().toLowerCase() &&
          order.soDienThoai.includes(this.phoneNumber.trim())
      );

      if (!found) {
        this.searchError = 'Không tìm thấy đơn hàng nào với thông tin đã cung cấp.';
        this.currentStep = 'search';
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.currentOrder = { ...found, tickets: found.tickets.map((ticket) => ({ ...ticket })) };
      this.syncTicketFieldsFromOrder();
      this.currentStep = 'results';
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 800);
  }

  fillMockData(id: number): void {
    if (id === 1) {
      this.phoneNumber = '0908123456';
      this.bookingCode = 'P5CDWE67';
    } else {
      this.phoneNumber = '0912345678';
      this.bookingCode = 'P5CDWE88';
    }

    this.searchTickets();
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
    if (!phone || phone.length < 8) {
      return phone;
    }

    return `${phone.slice(0, 3)}****${phone.slice(-2)}`;
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

    return `${this.currentOrder.gioCanCoMat} ngày ${this.formatDisplayDate(this.currentOrder.departureDate)}`;
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
    this.filterDiemDonOptions = [...LOCATION_OPTIONS];
    this.filterDiemTraOptions = [...LOCATION_OPTIONS];
    this.showDiemDonDropdown = false;
    this.showDiemTraDropdown = false;
    this.showEditModal = true;
  }

  closeEditOrderModal(): void {
    this.showEditModal = false;
  }

  onEditDiemDonInput(): void {
    const search = this.editDiemDonSearchText.toLowerCase().trim();
    this.filterDiemDonOptions = search
      ? LOCATION_OPTIONS.filter((item) =>
          item.tenDiem.toLowerCase().includes(search) ||
          (item.diaChi || '').toLowerCase().includes(search)
        )
      : [...LOCATION_OPTIONS];
    this.showDiemDonDropdown = true;
  }

  onEditDiemTraInput(): void {
    const search = this.editDiemTraSearchText.toLowerCase().trim();
    this.filterDiemTraOptions = search
      ? LOCATION_OPTIONS.filter((item) =>
          item.tenDiem.toLowerCase().includes(search) ||
          (item.diaChi || '').toLowerCase().includes(search)
        )
      : [...LOCATION_OPTIONS];
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

    this.currentOrder.hoTenNguoiDi = this.editFullName.trim() || this.currentOrder.hoTenNguoiDi;
    this.currentOrder.soDienThoai = this.editPhone.trim() || this.currentOrder.soDienThoai;
    this.currentOrder.email = this.editEmail.trim() || this.currentOrder.email;

    const selectedDon = LOCATION_OPTIONS.find((item) => item.maDiem === this.editMaDiemDon);
    const selectedTra = LOCATION_OPTIONS.find((item) => item.maDiem === this.editMaDiemTra);

    if (selectedDon) {
      this.currentOrder.diemDon = selectedDon.tenDiem;
      this.currentOrder.maDiemDon = selectedDon.maDiem;
      this.currentOrder.gioCanCoMat = selectedDon.thoiGian || this.currentOrder.gioCanCoMat;
    }

    if (selectedTra) {
      this.currentOrder.diemTra = selectedTra.tenDiem;
      this.currentOrder.maDiemTra = selectedTra.maDiem;
      this.currentOrder.gioTra = selectedTra.thoiGian || this.currentOrder.gioTra;
    }

    this.currentOrder.soLanDaSua = (this.currentOrder.soLanDaSua || 0) + 1;
    this.syncTicketFieldsFromOrder();
    this.showEditModal = false;
    this.showToast('Cập nhật thông tin vé thành công.', 'success');
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

    if (this.getRefundPercentage() === 0) {
      this.showToast('Hủy vé không được hỗ trợ trong khoảng thời gian dưới 12 giờ so với giờ khởi hành.', 'error');
      return;
    }

    this.currentOrder.trangThaiDonHang = 'Đã hủy';
    this.currentOrder.tickets = this.currentOrder.tickets.map((ticket) => ({
      ...ticket,
      trangThaiVe: 'Đã hủy'
    }));
    this.showCancelModal = false;
    this.showToast(
      `Hủy vé thành công, tiền sẽ được hoàn trong 48h. Số tiền thực nhận: ${this.formatPrice(this.getRefundAmount())}.`,
      'success'
    );
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

    this.currentOrder.trangThaiDonHang = 'Đã đánh giá';
    this.currentOrder.tickets = this.currentOrder.tickets.map((ticket) => ({
      ...ticket,
      trangThaiVe: 'Đã đánh giá'
    }));
    this.showReviewModal = false;
    this.reviewComment = '';
    this.reviewFiles = [];
    this.showToast('Đánh giá đã được gửi thành công.', 'success');
  }

  printTicket(ticket: Ticket): void {
    if (!this.currentOrder) {
      return;
    }

    const departureDateLabel = this.formatDisplayDate(this.currentOrder.departureDate);
    const departureTimeLabel = `${this.currentOrder.gioKhoiHanh} ${departureDateLabel}`;
    const pickupTimeLabel = this.getPickupTimeLabel();

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
      diemDon: this.currentOrder!.diemDon,
      diemDonThoiGian: `${this.currentOrder!.gioCanCoMat} ngày ${this.formatDisplayDate(this.currentOrder!.departureDate)}`,
      diemTra: this.currentOrder!.diemTra,
      diemTraThoiGian: `${this.currentOrder!.gioTra || this.currentOrder!.gioKhoiHanh} ngày ${this.formatDisplayDate(this.currentOrder!.departureDate)}`,
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

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;

    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 2500);
  }
}
