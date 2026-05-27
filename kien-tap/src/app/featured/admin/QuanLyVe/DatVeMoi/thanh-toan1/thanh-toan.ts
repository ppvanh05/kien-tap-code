import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-thanh-toan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  // Timer: 15 minutes = 900 seconds
  timeLeft: number = 900;
  timerInterval: any = null;

  // Modal states
  showCancelModal: boolean = false;
  showExpirationModal: boolean = false;
  expirationRedirectTime: number = 5;
  expirationInterval: any = null;

  paymentMethods = [
    { id: 'vietqr', name: 'Thanh toán qua VietQR', icon: '/asset/images/customer/VietQR_Logo.png', badge: '' },
    { id: 'momo', name: 'Ví MoMo', icon: '/asset/images/customer/MoMo_Logo.png', badge: '' },
    { id: 'vnpay', name: 'Ví VNPay', icon: '/asset/images/customer/VNPay_logo.png', badge: '' },
    { id: 'zalopay', name: 'Ví ZaloPay', icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay.png', badge: 'Giảm 25% tối đa 20k cho khách lần đầu thanh toán. Giảm tối đa 50k cho đơn từ 500k cho tất cả các giao dịch' },
    { id: 'atm', name: 'Thẻ ATM nội địa', icon: '/asset/images/customer/napas_logo.png', badge: '' },
    { id: 'card', name: 'Thẻ Visa/Master/JCB', icon: '/asset/images/customer/the-quoc-te_logo.jpg', badge: '' }
  ];

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

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
    alert('Thanh toán thành công! Vé điện tử đã được gửi tới số điện thoại/email của bạn.');
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
}
