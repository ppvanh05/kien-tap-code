import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ThanhToanApiService } from '../../../core/services/thanh-toan-api.service';
import { TimKiemApiService } from '../../../core/services/tim-kiem-api.service';

import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';

@Component({
  selector: 'app-thanh-toan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './thanh-toan.html',
  styleUrl: './thanh-toan.css',
})
export class ThanhToan implements OnInit, OnDestroy {
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

  // Timer: 10 minutes = 600 seconds
  timeLeft: number = 600;
  timerInterval: any = null;

  // Getter for suggested presence time
  get suggestedPresenceTime(): string {
    // Return the trip's original scheduled presence time (gioGoiYCoMat) instead of the pickup point time
    return this.bookingData.gioGoiYCoMat || this.bookingData.suggestedPresenceTime || '';
  }

  // Modal states
  showCancelModal: boolean = false;
  showExpirationModal: boolean = false;
  expirationRedirectTime: number = 5;
  expirationInterval: any = null;

  showSuccessModal: boolean = false;
  successRedirectTime: number = 20;
  successInterval: any = null;

  paymentMethods = [
    { id: 'vietqr', name: 'Thanh toán qua VietQR', icon: 'asset/images/customer/VietQR_Logo.png', badge: '' },
    { id: 'momo', name: 'Ví MoMo', icon: 'asset/images/customer/MoMo_Logo.png', badge: '' },
    { id: 'vnpay', name: 'Ví VNPay', icon: 'asset/images/customer/VNPay_logo.png', badge: '' },
    { id: 'zalopay', name: 'Ví ZaloPay', icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay.png', badge: 'Giảm 25% tối đa 20k cho khách lần đầu thanh toán. Giảm tối đa 50k cho đơn từ 500k cho tất cả các giao dịch' }
  ];

  constructor(
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private thanhToanService: ThanhToanApiService,
    private timKiemApiService: TimKiemApiService
  ) {}

  // Selected date from booking context
  selectedDate: string = '22/05/2026';

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('final_booking');
      if (saved) {
        try {
          this.bookingData = JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing final_booking:', e);
        }
      }

      if (!this.bookingData || !this.bookingData.tripId) {
        this.router.navigate(['/tim-kiem-chuyen']);
        return;
      }

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
    if (this.successInterval) {
      clearInterval(this.successInterval);
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
    this.router.navigate(['/tim-kiem-chuyen']);
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
    this.router.navigate(['/tim-kiem-chuyen'], {
      queryParams: {
        diemDi: this.bookingData.searchDeparture || this.bookingData.startStation || null,
        diemDen: this.bookingData.searchDestination || this.bookingData.endStation || null,
        ngayDi: this.bookingData.searchDate || this.bookingData.selectedDate || null,
        adults: this.bookingData.adults || null,
        children: this.bookingData.children || null,
        infants: this.bookingData.infants || null,
        isRoundTrip: this.bookingData.isRoundTrip || null,
        ngayVe: this.bookingData.ngayVe || null,
        passengers: this.bookingData.passengers || null
      }
    });
  }

  finishPayment() {
    const paymentMethodMap: Record<string, string> = {
      vietqr: 'VietQR',
      momo: 'Ví MoMo',
      vnpay: 'Ví VNPay',
      zalopay: 'Ví ZaloPay',
    };

    const methodStr = paymentMethodMap[this.selectedPayment] || 'Ví MoMo';
    
    const createOrderPayload = {
      MaKhachHang: this.bookingData.MaKhachHang || 'KH001',
      MaLichTrinh: String(this.bookingData.tripId || 1),
      DanhSachMaGheChuyen: this.bookingData.DanhSachMaGheChuyen || [],
      HoTenNguoiDi: this.bookingData.customerName,
      SdtNguoiDi: this.bookingData.customerPhone,
      EmailNguoiDi: this.bookingData.customerEmail || undefined,
      MaDiemDon: this.bookingData.pickup?.maDiem || this.bookingData.MaDiemDon || 'MD04',
      MaDiemTra: this.bookingData.dropoff?.maDiem || this.bookingData.MaDiemTra || 'MT03',
      PhuongThucThanhToan: methodStr,
    };

    console.log('Payment create-order payload:', createOrderPayload);

    this.timKiemApiService.createOrder(createOrderPayload).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          const realMaDonHang = response.data.order.MaDonHang;
          
          this.bookingData = {
            ...this.bookingData,
            MaDonHang: realMaDonHang,
            orderData: response.data.order,
            ticketsData: response.data.tickets,
            phuongThucThanhToan: methodStr
          };

          this.showSuccessModal = true;
          this.successRedirectTime = 20;
          
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.removeItem('current_booking');
            localStorage.removeItem('final_booking');
          }
          
          if (this.timerInterval) {
            clearInterval(this.timerInterval);
          }
          
          if (typeof window !== 'undefined') {
            this.successInterval = setInterval(() => {
              if (this.successRedirectTime > 1) {
                this.successRedirectTime--;
                this.cdr.detectChanges();
              } else {
                this.closeSuccessModal();
              }
            }, 1000);
          }
          this.cdr.detectChanges();
        } else {
          alert('Không thể hoàn tất thanh toán. Vui lòng thử lại.');
        }
      },
      error: (err: any) => {
        console.error('Failed to create order and pay', err);
        alert('Lỗi xác nhận thanh toán: ' + (err.error?.message || err.message));
      }
    });
  }

  closeSuccessModal() {
    if (this.successInterval) {
      clearInterval(this.successInterval);
    }
    this.showSuccessModal = false;
    this.router.navigate(['/home']);
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

  simulateSuccess() {
    this.finishPayment();
  }

  getPickupArrivalTime(timeStr?: string): string {
    const timeToUse = timeStr || this.bookingData.departureTime;
    const timeParts = timeToUse.split(':');
    if (timeParts.length !== 2) return timeToUse;
    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);
    minutes -= 30;
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    if (hours < 0) {
      hours += 24;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  viewTicketDetails() {
    if (this.successInterval) {
      clearInterval(this.successInterval);
    }
    const orderCode = this.bookingData?.MaDonHang || '';
    const phone = this.bookingData?.customerPhone || '';
    this.router.navigate(['/tra-cuu-ve'], {
      queryParams: {
        maDonHang: orderCode,
        soDienThoai: phone
      }
    });
  }

  printTicket() {
    window.print();
  }
}
