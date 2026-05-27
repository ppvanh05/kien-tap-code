import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';

interface Ticket {
  maVe: string;         // Mã vé, mã ghế, mã tra cứu hóa đơn
  soGhe: string;        // Số ghế
}

interface Order {
  maDonHang: string;            // Mã đặt vé (on UI)
  hoTenKhachHang: string;
  soDienThoai: string;
  email: string;
  tenTuyen: string;             // Tên tuyến đường
  gioKhoiHanh: string;          // Giờ khởi hành
  departureDate: string;        // Ngày khởi hành
  diemDon: string;              // Điểm đón hoặc điểm lên xe
  diemTra: string;              // Điểm trả
  thoiGianCoMatTruoc: string;   // Thời gian có mặt trước giờ chạy (ví dụ "15 phút")
  gioCanComat: string;          // Giờ cần có mặt
  tongGiaVe: number;            // Tổng giá vé
  phuongThucThanhToan: string;  // Phương thức thanh toán
  trangThaiDonHang: string;     // Trạng thái đơn hàng
  bienSoXe: string;             // Biển số xe
  tickets: Ticket[];
  maDiemDon?: string;           // Mã điểm đón dạng key
  maDiemTra?: string;           // Mã điểm trả dạng key
  soLanDaSua?: number;          // Số lần đã sửa thông tin
  gioiHanChinhSua?: number;     // Giới hạn số lần sửa
}

@Component({
  selector: 'app-tra-cuu-ve',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './tra-cuu-ve.html',
  styleUrl: './tra-cuu-ve.css',
})
export class TraCuuVe implements OnInit {
  // Search form input fields
  phoneNumber = '';
  bookingCode = ''; // MaDonHang
  searchError = '';

  // App UI State
  currentStep: 'search' | 'results' = 'search';
  currentOrder: Order | null = null;
  isLoading = false;

  // Station dropdown options
  diemDonOptions = [
    { maDiem: 'BX_MD', tenDiem: 'Bến xe Miền Đông mới (39448 Xa Lộ Hà Nội, TP Thủ Đức, TP.HCM)' },
    { maDiem: 'BX_MT', tenDiem: 'Bến xe Miền Tây (395 Kinh Dương Vương, P.An Lạc, Q.Bình Tân, TP.HCM)' },
    { maDiem: 'VP_DL', tenDiem: 'Văn phòng Đà Lạt (795 Q Lộ 20, TT Liên Nghĩa, H.Đức Trọng, Lâm Đồng)' },
    { maDiem: 'VP_BD', tenDiem: 'Văn phòng Bình Định (Bến xe Quy Nhơn, 71 Tây Sơn, Quy Nhơn)' }
  ];

  diemTraOptions = [
    { maDiem: 'BX_MD', tenDiem: 'Bến xe Miền Đông mới (39448 Xa Lộ Hà Nội, TP Thủ Đức, TP.HCM)' },
    { maDiem: 'BX_MT', tenDiem: 'Bến xe Miền Tây (395 Kinh Dương Vương, P.An Lạc, Q.Bình Tân, TP.HCM)' },
    { maDiem: 'VP_DL', tenDiem: 'Văn phòng Đà Lạt (795 Q Lộ 20, TT Liên Nghĩa, H.Đức Trọng, Lâm Đồng)' },
    { maDiem: 'VP_BD', tenDiem: 'Văn phòng Bình Định (Bến xe Quy Nhơn, 71 Tây Sơn, Quy Nhơn)' }
  ];

  // Edit ticket information modal state
  showEditModal = false;
  editFullName = '';
  editPhone = '';
  editEmail = '';
  editMaDiemDon = '';
  editMaDiemTra = '';

  // Other Modals state
  showCancelModal = false;
  showReviewModal = false;
  reviewStars = 5;
  reviewComment = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // Mock data matching the requested scenarios:
  mockOrders: Order[] = [
    {
      maDonHang: 'P5CDWE67',
      hoTenKhachHang: 'Đỗ Thị Phương',
      soDienThoai: '0333555412',
      email: 'dtp.phuong@gmail.com',
      tenTuyen: 'Mien Dong moi - Da Lat',
      gioKhoiHanh: '22:25',
      departureDate: '24-04-2026',
      diemDon: 'Bến xe Miền Đông mới (39448 Xa Lộ Hà Nội, TP Thủ Đức, TP.HCM)',
      diemTra: 'Văn phòng Đà Lạt (795 Q Lộ 20, TT Liên Nghĩa, H.Đức Trọng, Lâm Đồng)',
      thoiGianCoMatTruoc: '30 phút',
      gioCanComat: '', // Will be calculated dynamically
      tongGiaVe: 260000,
      phuongThucThanhToan: 'MoMo',
      trangThaiDonHang: 'Thành công',
      bienSoXe: '50H70313',
      maDiemDon: 'BX_MD',
      maDiemTra: 'VP_DL',
      soLanDaSua: 0,
      gioiHanChinhSua: 2,
      tickets: [
        {
          maVe: 'P5C0ZVVO1',
          soGhe: 'B05'
        }
      ]
    },
    {
      maDonHang: 'P5CDWE88',
      hoTenKhachHang: 'Trần Ngọc Bảo Nghi',
      soDienThoai: '0981939379',
      email: 'nghitnb23406@st.uel.edu.vn',
      tenTuyen: 'Bến xe Miền Tây - Bến xe Quy Nhơn',
      gioKhoiHanh: '18:00',
      departureDate: '22-05-2026',
      diemDon: 'Bến xe Miền Tây (395 Kinh Dương Vương, P.An Lạc, Q.Bình Tân, TP.HCM)',
      diemTra: 'Văn phòng Bình Định (Bến xe Quy Nhơn, 71 Tây Sơn, Quy Nhơn)',
      thoiGianCoMatTruoc: '30 phút',
      gioCanComat: '', // Will be calculated dynamically
      tongGiaVe: 800000,
      phuongThucThanhToan: 'VietQR / Napas',
      trangThaiDonHang: 'Thành công',
      bienSoXe: '77B-012.34',
      maDiemDon: 'BX_MT',
      maDiemTra: 'VP_BD',
      soLanDaSua: 0,
      gioiHanChinhSua: 2,
      tickets: [
        {
          maVe: 'P5C0ZVVO2',
          soGhe: 'A08'
        },
        {
          maVe: 'P5C0ZVVO3',
          soGhe: 'A09'
        }
      ]
    }
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Read route query parameters to trigger automatic search if present
    this.route.queryParams.subscribe(params => {
      const phone = params['phone'];
      const code = params['code'];
      if (phone && code) {
        this.phoneNumber = phone;
        this.bookingCode = code;
        this.searchTickets();
      }
    });
  }

  // Calculate presence time (subtracting 30 minutes from GioKhoiHanh)
  calculatePresenceTime(gioKhoiHanh: string, departureDate: string): string {
    if (!gioKhoiHanh || !departureDate) return '';
    const parts = gioKhoiHanh.split(':');
    if (parts.length !== 2) return `${gioKhoiHanh} ${departureDate}`;
    let hour = parseInt(parts[0], 10);
    let min = parseInt(parts[1], 10);
    
    min -= 30;
    if (min < 0) {
      min += 60;
      hour -= 1;
    }
    if (hour < 0) {
      hour += 24;
    }
    
    const hourStr = hour.toString().padStart(2, '0');
    const minStr = min.toString().padStart(2, '0');
    return `${hourStr}:${minStr} ngày ${departureDate}`;
  }

  // Helper method to mask passenger phone (matching Figure 2 e.g. 033xxxx412)
  maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return phone;
    return phone.substring(0, 3) + 'xxxx' + phone.substring(phone.length - 3);
  }

  // Helper method to mask email (matching Figure 2 e.g. dtp*********@gmail.com)
  maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    const parts = email.split('@');
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 3) {
      return name + '***@' + domain;
    }
    return name.substring(0, 3) + '*'.repeat(Math.max(name.length - 3, 5)) + '@' + domain;
  }

  // Pre-fill mock data for quick visualization
  fillMockData(caseNumber: number): void {
    if (caseNumber === 1) {
      this.phoneNumber = '0333555412';
      this.bookingCode = 'P5CDWE67';
    } else {
      this.phoneNumber = '0981939379';
      this.bookingCode = 'P5CDWE88';
    }
    this.searchTickets();
  }

  // Search logic
  searchTickets(): void {
    const cleanPhone = this.phoneNumber.trim();
    const cleanCode = this.bookingCode.trim().toUpperCase();

    if (!cleanPhone || !cleanCode) {
      this.searchError = 'Vui lòng nhập đầy đủ Số điện thoại và Mã đặt vé';
      return;
    }

    this.searchError = '';
    this.isLoading = true;

    // Simulate API lookup
    setTimeout(() => {
      const order = this.mockOrders.find(
        (o) =>
          o.soDienThoai === cleanPhone &&
          (o.maDonHang.toUpperCase() === cleanCode || o.tickets.some((t) => t.maVe.toUpperCase() === cleanCode))
      );

      if (order) {
        // Deep copy order to prevent direct mutations to mockOrders template
        this.currentOrder = JSON.parse(JSON.stringify(order));
        this.currentStep = 'results';
      } else {
        this.searchError = 'Không tìm thấy thông tin đặt vé với dữ liệu cung cấp. Vui lòng thử lại với SĐT: 0333555412, Mã: P5CDWE67 hoặc SĐT: 0981939379, Mã: P5CDWE88.';
      }

      this.isLoading = false;
    }, 600);
  }

  // Back from results to search
  backToSearch(): void {
    this.phoneNumber = '';
    this.bookingCode = '';
    this.searchError = '';
    this.currentOrder = null;
    this.currentStep = 'search';
    
    // Clear URL query parameters when going back
    this.router.navigate([], {
      queryParams: {
        phone: null,
        code: null
      },
      queryParamsHandling: 'merge'
    });
  }

  // Re-booking action
  rebookTickets(): void {
    this.showToast('Tính năng mua lại vé xe đang được xử lý!', 'success');
  }

  // Unified Edit Info Modal Actions
  openEditOrderModal(): void {
    if (!this.currentOrder) return;
    
    // Check if edits limit is reached
    const edits = this.currentOrder.soLanDaSua || 0;
    const limit = this.currentOrder.gioiHanChinhSua || 2;
    if (edits >= limit) {
      this.showToast('Bạn đã hết lượt chỉnh sửa thông tin cho vé này!', 'error');
      return;
    }

    this.editFullName = this.currentOrder.hoTenKhachHang;
    this.editPhone = this.currentOrder.soDienThoai;
    this.editEmail = this.currentOrder.email;
    this.editMaDiemDon = this.currentOrder.maDiemDon || '';
    this.editMaDiemTra = this.currentOrder.maDiemTra || '';
    this.showEditModal = true;
  }

  closeEditOrderModal(): void {
    this.showEditModal = false;
  }

  saveEditChanges(): void {
    if (!this.currentOrder) return;

    const edits = this.currentOrder.soLanDaSua || 0;
    const limit = this.currentOrder.gioiHanChinhSua || 2;
    if (edits >= limit) {
      this.showToast('Bạn đã hết lượt chỉnh sửa thông tin cho vé này!', 'error');
      return;
    }

    const name = this.editFullName.trim();
    const phone = this.editPhone.trim();
    const email = this.editEmail.trim();

    if (!name || !phone || !email || !this.editMaDiemDon || !this.editMaDiemTra) {
      this.showToast('Vui lòng nhập đầy đủ tất cả thông tin!', 'error');
      return;
    }

    // Vietnam phone verification
    const vnPhoneRegex = /^(0[35789])[0-9]{8}$/;
    if (!vnPhoneRegex.test(phone)) {
      this.showToast('Số điện thoại không hợp lệ! (Phải gồm 10 chữ số bắt đầu bằng 03, 05, 07, 08 hoặc 09)', 'error');
      return;
    }

    // Email address formatting verification
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showToast('Email không đúng định dạng! (Ví dụ: example@gmail.com)', 'error');
      return;
    }

    // Save changes
    this.currentOrder.hoTenKhachHang = name;
    this.currentOrder.soDienThoai = phone;
    this.currentOrder.email = email;
    this.currentOrder.maDiemDon = this.editMaDiemDon;
    this.currentOrder.maDiemTra = this.editMaDiemTra;

    // Map stations labels
    const matchDiemDon = this.diemDonOptions.find(o => o.maDiem === this.editMaDiemDon);
    if (matchDiemDon) {
      this.currentOrder.diemDon = matchDiemDon.tenDiem;
    }
    const matchDiemTra = this.diemTraOptions.find(o => o.maDiem === this.editMaDiemTra);
    if (matchDiemTra) {
      this.currentOrder.diemTra = matchDiemTra.tenDiem;
    }

    // Increment count
    this.currentOrder.soLanDaSua = edits + 1;

    // Sync back to template array
    const originalIndex = this.mockOrders.findIndex(o => o.maDonHang === this.currentOrder?.maDonHang);
    if (originalIndex !== -1) {
      this.mockOrders[originalIndex] = JSON.parse(JSON.stringify(this.currentOrder));
    }

    this.showEditModal = false;
    this.showToast('Lưu thay đổi thành công!', 'success');
  }

  // Ticket cancellation and review
  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  confirmCancelTicket(): void {
    if (this.currentOrder) {
      this.currentOrder.trangThaiDonHang = 'Đã hủy';
      
      // Sync back to template array
      const originalIndex = this.mockOrders.findIndex(o => o.maDonHang === this.currentOrder?.maDonHang);
      if (originalIndex !== -1) {
        this.mockOrders[originalIndex] = JSON.parse(JSON.stringify(this.currentOrder));
      }
      this.showToast('Hủy đơn đặt vé thành công!', 'success');
    }
    this.showCancelModal = false;
  }

  openReviewModal(): void {
    this.showReviewModal = true;
    this.reviewStars = 5;
    this.reviewComment = '';
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  submitReview(): void {
    this.showToast(`Cảm ơn bạn đã gửi đánh giá ${this.reviewStars} sao cho chúng tôi!`, 'success');
    this.showReviewModal = false;
  }

  // Toast feedback helper
  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
}
