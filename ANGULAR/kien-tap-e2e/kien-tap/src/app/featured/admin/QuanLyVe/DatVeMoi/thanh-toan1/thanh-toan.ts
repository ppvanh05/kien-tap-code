import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';


@Component({
  selector: 'app-thanh-toan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './thanh-toan.html',
  styleUrl: './thanh-toan.css',
})
export class ThanhToan implements OnInit, OnDestroy {
  private readonly apiBaseUrl = environment.apiBase;
  bookingData: any = {
    tripId: 1,
    departureTime: '18:00',
    arrivalTime: '05:00',
    duration: '11 giờ',
    distance: '550km',
    startStation: 'Bến xe Miền Tây',
    endStation: 'Bến xe Quy Nhơn',
    price: 400000,
    selectedSeats: ['1A', '2A'],
    totalPrice: 800000,
    customerName: 'Nghi Trần Ngọc Bảo',
    customerPhone: '0981939379',
    customerEmail: 'nghitnb23406@st.uel.edu.vn',
    pickup: { time: '18:30', name: 'Bến xe Miền Tây', address: '395 Kinh Dương Vương, P.An Lạc, Q.Bình Tân, TP.HCM' },
    dropoff: { time: '05:00', name: 'Bến xe Quy Nhơn', address: '71 Tây Sơn, Phường Ghềnh Ráng, Quy Nhơn, Bình Định' }
  };

  selectedPayment: string = 'vietqr';

  // Timer: 15 minutes = 900 seconds
  timeLeft: number = 900;
  timerInterval: any = null;

  // Modal states
  showCancelModal: boolean = false;
  showExpirationModal: boolean = false;
  showSuccessModal: boolean = false;
  showAlertModal: boolean = false;
  expirationRedirectTime: number = 5;
  expirationInterval: any = null;

  // Success order data for ticket display
  successOrder: any = null;
  
  // Alert data
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' | 'info' = 'info';
  
  // Confirm modal data
  showConfirmModal: boolean = false;
  confirmMessage: string = '';
  confirmCallback: (() => void) | null = null;

  // Hold seat state
  isHoldingSeat: boolean = false;



  paymentMethods = [
    { id: 'vietqr', name: 'Thanh toán qua VietQR', icon: '/asset/images/customer/VietQR_Logo.png', badge: '' },
    { id: 'momo', name: 'Ví MoMo', icon: '/asset/images/customer/MoMo_Logo.png', badge: '' },
    { id: 'vnpay', name: 'Ví VNPay', icon: '/asset/images/customer/VNPay_logo.png', badge: '' },
    { id: 'zalopay', name: 'Ví ZaloPay', icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay.png', badge: 'Giảm 25% tối đa 20k cho khách lần đầu thanh toán. Giảm tối đa 50k cho đơn từ 500k cho tất cả các giao dịch' },
    { id: 'atm', name: 'Thẻ ATM nội địa', icon: '/asset/images/customer/napas_logo.png', badge: '' },
    { id: 'card', name: 'Thẻ Visa/Master/JCB', icon: '/asset/images/customer/the-quoc-te_logo.jpg', badge: '' },
    { id: 'cash', name: 'Tiền mặt', icon: 'https://img.icons8.com/ios-filled/50/money--v1.png', badge: 'Nhân viên xác nhận nhận tiền mặt từ khách hàng' }
  ];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
  ) {}

  // Selected date from booking context
  selectedDate: string = '22/05/2026';

  ngOnInit() {
    console.log('ThanhToan ngOnInit called. window type:', typeof window);

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('final_booking');
      console.log('ThanhToan final_booking in localStorage:', saved);
      if (saved) {
        try {
          this.bookingData = JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing final_booking:', e);
        }
      }
      // Extract selected date from booking data if available
      if (this.bookingData && this.bookingData.selectedDate) {
        this.selectedDate = this.bookingData.selectedDate;
      }
      this.startCountdown();
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.expirationInterval) {
      clearInterval(this.expirationInterval);
    }
  }

  startCountdown() {
    console.log('startCountdown called. timeLeft:', this.timeLeft);
    if (typeof window !== 'undefined') {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      this.timerInterval = setInterval(() => {
        console.log('Timer ticking. Current timeLeft:', this.timeLeft);
        if (this.timeLeft > 0) {
          this.timeLeft--;
          this.cdr.detectChanges();
        } else {
          clearInterval(this.timerInterval);
          this.triggerExpiration();
        }
      }, 1000);
    }
  }

  triggerExpiration() {
    this.showExpirationModal = true;
    this.expirationRedirectTime = 5;
    this.cdr.detectChanges();
    if (typeof window !== 'undefined') {
      this.expirationInterval = setInterval(() => {
        if (this.expirationRedirectTime > 0) {
          this.expirationRedirectTime--;
          this.cdr.detectChanges();
        } else {
          clearInterval(this.expirationInterval);
          this.closeExpirationModal();
        }
      }, 1000);
    }
  }

  closeExpirationModal() {
    if (this.expirationInterval) {
      clearInterval(this.expirationInterval);
    }
    this.showExpirationModal = false;
    this.router.navigate(['/admin/quan-ly-ve/dat-ve-moi']);
  }

  get formattedTimeLeft(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
  }

  formatPrice(price: number): string {
    return (price || 0).toLocaleString('vi-VN') + 'đ';
  }

  goBack() {
    this.showCancelModal = true;
  }

  cancelCancel() {
    this.showCancelModal = false;
  }

  confirmCancel() {
    this.showCancelModal = false;
    this.router.navigate(['/admin/quan-ly-ve/dat-ve-moi']);
  }

  finishPayment() {
    this.showAlert('Thanh toán thành công! Vé điện tử đã được gửi tới số điện thoại/email của bạn.', 'success');
    localStorage.removeItem('current_booking');
    localStorage.removeItem('final_booking');
    setTimeout(() => {
      this.router.navigate(['/admin/trang-chu']);
    }, 2000);
  }

  showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertModal = true;
  }

  closeAlert() {
    this.showAlertModal = false;
    this.alertMessage = '';
  }

  showConfirm(message: string, callback: () => void) {
    this.confirmMessage = message;
    this.confirmCallback = callback;
    this.showConfirmModal = true;
  }

  closeConfirm() {
    this.showConfirmModal = false;
    this.confirmMessage = '';
    this.confirmCallback = null;
  }

  private mapPaymentMethodToBackend(id: string): string {
    const map: Record<string, string> = {
      vietqr: 'VietQR',
      momo: 'MoMo',
      vnpay: 'VNPay',
      zalopay: 'ZaloPay',
      atm: 'ATM',
      card: 'VisaMaster',
      cash: 'TienMat'
    };
    return map[id] || 'TienMat';
  }

  private buildCreateOrderPayload() {
    const method = this.mapPaymentMethodToBackend(this.selectedPayment);
    return {
      hoTenNguoiDi: this.bookingData.customerName,
      sdtNguoiDi: this.bookingData.customerPhone,
      emailNguoiDi: this.bookingData.customerEmail || '',
      maLichTrinh: this.bookingData.maLichTrinh || this.bookingData.tripId,
      maGheChuyenList: this.bookingData.maGheChuyenList || this.bookingData.selectedSeatIds || [],
      maDiemDon: this.bookingData.pickup?.maDiem || this.bookingData.pickup?.MaDiem,
      maDiemTra: this.bookingData.dropoff?.maDiem || this.bookingData.dropoff?.MaDiem,
      phuongThucThanhToan: method,
      ghiChu: method === 'TienMat' ? 'Nhân viên xác nhận thu tiền mặt' : 'Đặt vé giữ chỗ qua Hotline / Đại lý',
    };
  }

  private mapSuccessOrderFromApi(result: any) {
    const donHang = result?.donHang || result?.DON_HANG || {};
    const veList = result?.veList || donHang?.VE_DIEN_TU || [];
    const firstTicket = veList[0] || {};

    return {
      maDonHang: donHang.maDonHang || donHang.MaDonHang || firstTicket.MaDonHang || '',
      hoTenKhachHang: donHang.tenKhachHang || donHang.HoTenNguoiDi || this.bookingData.customerName,
      soDienThoai: donHang.soDienThoai || donHang.SdtNguoiDi || this.bookingData.customerPhone,
      email: donHang.EmailNguoiDi || this.bookingData.customerEmail || '',
      tenTuyen: firstTicket.tuyenXe || `${this.bookingData.startStation} - ${this.bookingData.endStation}`,
      gioKhoiHanh: firstTicket.gioDi || this.bookingData.departureTime,
      departureDate: firstTicket.ngayDi || this.selectedDate,
      tongGiaVe: donHang.tongGiaVe || this.bookingData.totalPrice,
      phuongThucThanhToan: donHang.phuongThucThanhToan ? this.mapPaymentMethod(donHang.phuongThucThanhToan) : 'Tiền mặt',
      trangThaiDonHang: donHang.TrangThaiDonHang === 'ChoThanhToan' ? 'Chờ thanh toán' : 'Thành công',
      diemDon: `${this.bookingData.pickup?.name || ''} - ${this.bookingData.pickup?.address || ''}`,
      diemTra: `${this.bookingData.dropoff?.name || ''} - ${this.bookingData.dropoff?.address || ''}`,
      bienSoXe: firstTicket.bienSoXe || '',
      tickets: veList.map((ticket: any, index: number) => ({
        soGhe: ticket.soGhe || this.bookingData.selectedSeats?.[index] || '',
        maVe: ticket.maVe || ticket.MaVe || '',
      })),
    };
  }

  confirmCashPayment() {
    this.showConfirm('Xác nhận đã nhận tiền chuyển khoản từ khách hàng và phát hành vé?', () => {
      const payload = this.buildCreateOrderPayload();
      if (!payload.maLichTrinh || !payload.maGheChuyenList.length) {
        this.showAlert('Thiếu thông tin lịch trình hoặc ghế. Vui lòng chọn lại chuyến xe.', 'warning');
        return;
      }

      this.http.post<any>(`${this.apiBaseUrl}/quan-ly-ve/tao-don-hang`, payload).subscribe({
        next: result => {
          this.successOrder = this.mapSuccessOrderFromApi(result);
          this.showSuccessModal = true;
          this.cdr.detectChanges();
        },
        error: error => {
          const message = error?.error?.message || 'Không thể xác nhận thanh toán chuyển khoản.';
          this.showAlert(message, 'error');
          this.cdr.detectChanges();
        },
      });
    });
  }

  confirmReservation() {
    this.showConfirm('Xác nhận đặt giữ chỗ bằng tiền mặt? (Trạng thái vé sẽ là Chờ thanh toán)', () => {
      const payload = this.buildCreateOrderPayload();
      if (!payload.maLichTrinh || !payload.maGheChuyenList.length) {
        this.showAlert('Thiếu thông tin lịch trình hoặc ghế. Vui lòng chọn lại chuyến xe.', 'warning');
        return;
      }

      this.http.post<any>(`${this.apiBaseUrl}/quan-ly-ve/tao-don-hang`, payload).subscribe({
        next: result => {
          this.successOrder = this.mapSuccessOrderFromApi(result);
          this.showSuccessModal = true;
          this.cdr.detectChanges();
        },
        error: error => {
          const message = error?.error?.message || 'Không thể tạo đơn hàng giữ chỗ bằng tiền mặt.';
          this.showAlert(message, 'error');
          this.cdr.detectChanges();
        },
      });
    });
  }

  holdSeat() {
    this.showConfirm(
      'Giữ chỗ cho khách và lưu vé với trạng thái "Chờ thanh toán" (thu tiền mặt sau)?',
      () => {
        const payload = {
          ...this.buildCreateOrderPayload(),
          phuongThucThanhToan: 'TienMat',
          ghiChu: 'Nhan vien giu cho - cho thu tien mat sau',
          trangThai: 'ChoThanhToan',
        };

        if (!payload.maLichTrinh || !payload.maGheChuyenList.length) {
          this.showAlert('Thiếu thông tin lịch trình hoặc ghế. Vui lòng chọn lại chuyến xe.', 'warning');
          return;
        }

        this.isHoldingSeat = true;
        this.cdr.detectChanges();

        this.http.post<any>(`${this.apiBaseUrl}/quan-ly-ve/tao-don-hang`, payload).subscribe({
          next: result => {
            this.isHoldingSeat = false;
            const donHang = result?.donHang || result?.DON_HANG || {};
            const maDonHang = donHang.maDonHang || donHang.MaDonHang || '';
            this.showAlert(
              `Đã giữ chỗ thành công!${maDonHang ? ' Mã đơn: ' + maDonHang + '.' : ''} Vé đang chờ thanh toán tiền mặt.`,
              'success'
            );
            localStorage.removeItem('current_booking');
            localStorage.removeItem('final_booking');
            setTimeout(() => this.router.navigate(['/admin/trang-chu']), 2000);
            this.cdr.detectChanges();
          },
          error: error => {
            this.isHoldingSeat = false;
            const message = error?.error?.message || 'Không thể giữ chỗ. Vui lòng thử lại.';
            this.showAlert(message, 'error');
            this.cdr.detectChanges();
          },
        });
      }
    );
  }

  private confirmCashPaymentLegacy() {
    this.showConfirm('Xác nhận đã nhận tiền mặt từ khách hàng?', () => {
      // Tạo data đơn hàng giả để hiển thị vé
      this.successOrder = {
        maDonHang: 'DH10000000',
        hoTenKhachHang: this.bookingData.customerName,
        soDienThoai: this.bookingData.customerPhone,
        email: this.bookingData.customerEmail || '',
        tenTuyen: this.bookingData.startStation + ' - ' + this.bookingData.endStation,
        gioKhoiHanh: this.bookingData.departureTime,
        departureDate: this.selectedDate,
        tongGiaVe: this.bookingData.totalPrice,
        phuongThucThanhToan: 'Tiền mặt',
        trangThaiDonHang: 'Thành công',
        diemDon: this.bookingData.pickup.name + ' - ' + this.bookingData.pickup.address,
        diemTra: this.bookingData.dropoff.name + ' - ' + this.bookingData.dropoff.address,
        bienSoXe: '51A-123.45',
        tickets: this.bookingData.selectedSeats.map((seat: string, index: number) => ({
          soGhe: seat,
          maVe: 'VE100000'
        }))
      };
      this.showSuccessModal = true;
    });
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    localStorage.removeItem('current_booking');
    localStorage.removeItem('final_booking');
    this.router.navigate(['/admin/trang-chu']);
  }

  getSelectedDate(): string {
    return this.selectedDate;
  }

  getDayOfWeek(): string {
    const parts = this.selectedDate.split('/');
    if (parts.length !== 3) return '';
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return dayNames[date.getDay()];
  }

  mapPaymentMethod(method: string): string {
    if (!method) return 'Tiền mặt';
    const normalized = String(method).toLowerCase();
    
    let pmId = normalized;
    if (normalized === 'tienmat') pmId = 'cash';
    if (normalized === 'visamaster') pmId = 'card';

    const found = this.paymentMethods.find(pm => pm.id.toLowerCase() === pmId);
    return found ? found.name : method;
  }

  getPaymentQR(): string {
    const amount = this.bookingData.totalPrice || 800000;
    switch (this.selectedPayment) {
      case 'vietqr':
        return `https://img.vietqr.io/image/vietinbank-970415-112233-compact2.jpg?amount=${amount}&addInfo=TXP%20Bus%20Thanh%20Toan%20Ve`;
      case 'momo':
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://momo.vn/pay?app_id=txpbus%26amount=${amount}`;
      case 'vnpay':
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://vnpay.vn/pay?amount=${amount}`;
      case 'zalopay':
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://zalopay.vn/pay?amount=${amount}`;
      case 'atm':
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://napas.com.vn/pay?amount=${amount}`;
      case 'card':
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://visa.com/pay?amount=${amount}`;
      default:
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://txpbus.com/pay?amount=${amount}`;
    }
  }

  getPaymentLogo(): string {
    const selected = this.paymentMethods.find(m => m.id === this.selectedPayment);
    return selected ? selected.icon : '';
  }

  confirmCashReceived() {
    this.showConfirm('Xác nhận đã nhận tiền mặt từ khách hàng và phát hành vé trực tiếp?', () => {
      const payload = {
        ...this.buildCreateOrderPayload(),
        trangThai: 'ChoKhoiHanh'
      };
      if (!payload.maLichTrinh || !payload.maGheChuyenList.length) {
        this.showAlert('Thiếu thông tin lịch trình hoặc ghế. Vui lòng chọn lại chuyến xe.', 'warning');
        return;
      }

      this.http.post<any>(`${this.apiBaseUrl}/quan-ly-ve/tao-don-hang`, payload).subscribe({
        next: result => {
          this.successOrder = this.mapSuccessOrderFromApi(result);
          this.showSuccessModal = true;
          this.cdr.detectChanges();
        },
        error: error => {
          const message = error?.error?.message || 'Không thể xác nhận thu tiền mặt.';
          this.showAlert(message, 'error');
          this.cdr.detectChanges();
        },
      });
    });
  }


}
