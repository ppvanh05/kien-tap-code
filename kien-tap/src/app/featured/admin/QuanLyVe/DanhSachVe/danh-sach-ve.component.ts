import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timer } from 'rxjs';
import { LunarCalendarService } from '../../../../core/services/lunar-calendar.service';

export interface CalendarDay {
  day: number | null;
  lunarDay?: number;
  lunarMonth?: number;
  isToday?: boolean;
  isSelected?: boolean;
}

interface Ticket {
  id: string;
  customer: string;
  phone: string;
  route: string;
  arrivalDate: string;
  date: string;
  time: string;
  total: string;
  paymentStatus: 'Chờ thanh toán' | 'Đã thanh toán' | 'Đã hủy' | 'Chờ hoàn tiền' | 'Đã hoàn tiền';
  ticketStatus: 'Chờ thanh toán' | 'Chờ khởi hành' | 'Đã hoàn thành' | 'Đã hủy';
  paymentMethod: string;
  seat: string;
}

@Component({
  selector: 'app-danh-sach-ve',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './danh-sach-ve.component.html',
  styleUrls: ['./danh-sach-ve.component.css']
})
export class DanhSachVeComponent implements OnInit {
  // Biến lưu trữ giá trị đang nhập ở bộ lọc
  filters = {
    searchTerm: '',
    route: 'Tất cả tuyến',
    departureDate: '',
    seat: '',
    paymentStatus: 'Tất cả',
    ticketStatus: 'Tất cả'
  };

  // Danh sách hiển thị thực tế trên bảng (sau khi lọc)
  displayTickets: Ticket[] = [];

  // Phân trang
  currentPage: number = 1;
  pageSize: number = 15;

  tickets: Ticket[] = this.generateMockTickets();

  // Custom Date Picker
  isDatePickerOpen: boolean = false;
  viewDate: Date = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  constructor(
    private cdr: ChangeDetectorRef, 
    private zone: NgZone,
    private lunarService: LunarCalendarService
  ) {
    this.displayTickets = [...this.tickets];
  }

  ngOnInit() {
    this.generateCalendar();
  }

  toggleDatePicker() {
    this.isDatePickerOpen = !this.isDatePickerOpen;
    if (this.isDatePickerOpen) {
      this.generateCalendar();
    }
  }

  generateCalendar() {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    this.calendarDays = [];
    for (let i = 0; i < startOffset; i++) {
      this.calendarDays.push({ day: null });
    }
    
    const today = new Date();
    const selectedDate = this.parseDate(this.filters.departureDate);
    
    for (let d = 1; d <= daysInMonth; d++) {
      const lunar = this.lunarService.getLunarDate(d, month + 1, year);
      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
      const isSelected = selectedDate?.getDate() === d && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
      
      this.calendarDays.push({
        day: d,
        lunarDay: lunar.day,
        lunarMonth: lunar.month,
        isToday,
        isSelected
      });
    }
  }

  prevMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDate(d: CalendarDay) {
    if (!d.day) return;
    const date = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), d.day);
    this.filters.departureDate = this.formatDateToISO(date);
    this.isDatePickerOpen = false;
    this.onSearch();
  }

  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return null;
  }

  private formatDateToISO(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getDisplayDate(): string {
    const d = this.parseDate(this.filters.departureDate);
    if (!d) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getViewMonthYear(): string {
    const month = this.viewDate.getMonth() + 1;
    const year = this.viewDate.getFullYear();
    return `THÁNG ${month}/${year}`;
  }

  private generateMockTickets(): Ticket[] {
    const list: Ticket[] = [];
    const names = ['Nguyễn Văn An', 'Trần Thị Bích', 'Lê Văn Cường', 'Phạm Minh Đạo', 'Hoàng Thị Dung', 'Nguyễn Thị Phương', 'Lý Quốc Bảo', 'Vũ Thị Hằng', 'Đặng Văn Khoa', 'Bùi Thị Lan'];
    const routes = [
      'Bình Dương → BX Miền Đông', 'BX Miền Đông → Bình Dương',
      'Bình Dương → BX Miền Tây', 'BX Miền Tây → Bình Dương',
      'Bình Dương → Bến Cát', 'Bến Cát → Bình Dương'
    ];

    // Tạo 1234 vé
    for (let i = 1; i <= 1234; i++) {
      let pStatus: any = 'Đã thanh toán';
      let tStatus: any = 'Đã hoàn thành';

      // 5 vé đầu tiên luôn là Chờ thanh toán để hiện ở trang 1
      if (i <= 5) {
        tStatus = 'Chờ thanh toán';
        pStatus = 'Chờ thanh toán';
      } else if (i <= 205) {
        // 200 vé tiếp theo: Chờ khởi hành
        tStatus = 'Chờ khởi hành';
        pStatus = 'Đã thanh toán';
      } else if (i <= 505) {
        // 300 vé tiếp theo: Đã hoàn thành
        tStatus = 'Đã hoàn thành';
        pStatus = 'Đã thanh toán';
      } else if (i <= 515) {
        // ĐÚNG 10 vé Chờ hoàn tiền
        tStatus = 'Đã hủy';
        pStatus = 'Chờ hoàn tiền';
      } else {
        // Phần còn lại: Hỗn hợp
        if (i % 8 === 0) {
          tStatus = 'Đã hủy';
          pStatus = 'Đã hoàn tiền';
        } else if (i % 7 === 0) {
          tStatus = 'Đã hủy';
          pStatus = 'Đã hủy';
        } else {
          tStatus = 'Đã hoàn thành';
          pStatus = 'Đã thanh toán';
        }
      }

      const times = ['05:30', '07:00', '08:30', '10:00', '13:00', '15:45', '17:30', '20:00', '22:15'];
      const pttts = ['Momo', 'ZaloPay', 'Chuyển khoản (Vietcombank)', 'Tiền mặt'];
      const seats = ['A1', 'A2', 'B3', 'A5, A6', 'B7', 'A8, A9', 'B12', 'A15', 'B16, B17', 'A20'];
      const ticket: Ticket = {
        id: `TXP2605${String(1000 + i).padStart(4, '0')}`,
        customer: names[i % names.length],
        phone: `09${Math.floor(10000000 + Math.random() * 89999999).toString().substring(0, 8)}`,
        route: routes[i % routes.length],
        date: i <= 205 ? '2026-05-20' : '2026-05-15',
        arrivalDate: i <= 205 ? '2026-05-20' : '2026-05-15',
        time: times[i % times.length],
        total: `${150 + (i % 10) * 20}.000đ`,
        paymentStatus: pStatus,
        ticketStatus: tStatus,
        paymentMethod: pStatus === 'Chờ thanh toán' ? 'Chưa thanh toán' : pttts[i % pttts.length],
        seat: seats[i % seats.length]
      };
      list.push(ticket);
    }
    return list;
  }

  onSearch() {
    this.displayTickets = this.tickets.filter(t => {
      const matchSearch = !this.filters.searchTerm ||
        t.id.toLowerCase().includes(this.filters.searchTerm.toLowerCase()) ||
        t.customer.toLowerCase().includes(this.filters.searchTerm.toLowerCase()) ||
        t.phone.includes(this.filters.searchTerm);

      const matchRoute = this.filters.route === 'Tất cả tuyến' || t.route === this.filters.route;
      const matchDepDate = !this.filters.departureDate || t.date === this.filters.departureDate;
      const matchSeat = !this.filters.seat || t.seat.toLowerCase().includes(this.filters.seat.toLowerCase());
      const matchPayment = this.filters.paymentStatus === 'Tất cả' || t.paymentStatus === this.filters.paymentStatus;
      const matchTicket = this.filters.ticketStatus === 'Tất cả' || t.ticketStatus === this.filters.ticketStatus;

      return matchSearch && matchRoute && matchDepDate && matchSeat && matchPayment && matchTicket;
    });
    this.currentPage = 1; // Reset về trang 1 khi tìm kiếm
  }

  onReset() {
    this.filters = {
      searchTerm: '',
      route: 'Tất cả tuyến',
      departureDate: '',
      seat: '',
      paymentStatus: 'Tất cả',
      ticketStatus: 'Tất cả'
    };
    this.displayTickets = [...this.tickets];
    this.currentPage = 1;
  }

  get paginatedTickets() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.displayTickets.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.displayTickets.length / this.pageSize);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers() {
    const pages = [];
    const total = this.totalPages;

    // Hiển thị tối đa 5 trang xung quanh trang hiện tại
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(total, start + 4);

    if (end === total) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Modal Chi tiết vé
  showDetailsModal: boolean = false;
  selectedTicket: Ticket | null = null;

  openDetailsModal(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
  }

  // Các thao tác trong modal chi tiết
  onCollectMoney() {
    alert('Đang thực hiện thu tiền cho vé ' + this.selectedTicket?.id);
    if (this.selectedTicket) {
      this.selectedTicket.paymentStatus = 'Đã thanh toán';
      this.selectedTicket.ticketStatus = 'Chờ khởi hành';
    }
  }

  onRefund() {
    if (confirm('Bạn đã thực hiện hoàn tiền thủ công cho khách hàng này chưa?')) {
      if (this.selectedTicket) {
        this.selectedTicket.paymentStatus = 'Đã hoàn tiền';
        this.selectedTicket.ticketStatus = 'Đã hủy';
      }
      alert('Đã cập nhật trạng thái: Đã hoàn tiền.');
    }
  }

  // Modal OTP Hủy vé
  showOtpModal: boolean = false;
  otpValue: string = '';

  openOtpModal() {
    this.showOtpModal = true;
    this.otpValue = '';
  }

  closeOtpModal() {
    this.showOtpModal = false;
  }

  confirmCancelWithOtp() {
    if (this.otpValue.length === 6) {
      alert('Xác thực thành công! Hệ thống không thể hoàn tiền tự động. Vé ' + this.selectedTicket?.id + ' đã được chuyển sang trạng thái "Chờ hoàn tiền" để nhân viên xử lý thủ công.');
      if (this.selectedTicket) {
        this.selectedTicket.paymentStatus = 'Chờ hoàn tiền';
        this.selectedTicket.ticketStatus = 'Đã hủy';
      }
      this.closeOtpModal();
    } else {
      alert('Vui lòng nhập đúng mã OTP 6 chữ số.');
    }
  }

  onCancelTicket() {
    // Nếu vé đã thanh toán thì yêu cầu OTP
    if (this.selectedTicket?.paymentStatus === 'Đã thanh toán') {
      this.openOtpModal();
    } else {
      // Nếu chưa thanh toán thì cho hủy luôn sau khi confirm
      if (confirm('Bạn có chắc chắn muốn hủy vé chưa thanh toán này?')) {
        if (this.selectedTicket) {
          this.selectedTicket.paymentStatus = 'Đã hủy';
          this.selectedTicket.ticketStatus = 'Đã hủy';
        }
        this.closeDetailsModal();
      }
    }
  }

  // Trạng thái nút gửi lại: 'idle', 'sending', 'success'
  resendStatus: 'idle' | 'sending' | 'success' = 'idle';
  private resendTimeout: any;

  onResendNotification() {
    if (this.resendStatus !== 'idle') return;

    this.resendStatus = 'sending';

    // Sử dụng RxJS timer: 1 giây xoay
    timer(1000).subscribe(() => {
      this.zone.run(() => {
        this.resendStatus = 'success';
        this.cdr.detectChanges();

        if (this.resendTimeout) clearTimeout(this.resendTimeout);

        // 4 giây hiện thông báo thành công
        this.resendTimeout = setTimeout(() => {
          this.zone.run(() => {
            this.resendStatus = 'idle';
            this.cdr.detectChanges();
          });
        }, 4000);
      });
    });
  }

  getResendButtonText(): string {
    if (this.resendStatus === 'sending') return 'Đang gửi...';
    if (this.resendStatus === 'success') return 'Đã gửi thành công!';
    return 'Gửi lại SMS/Email';
  }

  getReportTime(time: string | undefined): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes - 30;
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Xử lý nếu là nửa đêm

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // Modal In vé (kế thừa từ logic cũ nhưng mở từ Details)
  showPrintModal: boolean = false;

  openPrintModalFromDetails() {
    this.showPrintModal = true;
    // Không đóng details modal để giữ context, hoặc đóng tùy ý.
    // Ở đây tôi giữ details mở, print modal sẽ đè lên trên.
  }

  closePrintModal() {
    this.showPrintModal = false;
    this.showDetailsModal = false;
    this.selectedTicket = null;
  }

  exportPDF() {
    alert('Đang khởi tạo tệp PDF cho vé ' + this.selectedTicket?.id);
  }

  printTicket() {
    window.print();
  }

  updateFilter(key: string, event: any) {
    (this.filters as any)[key] = event.target.value;
  }

  getPaymentClass(status: string) {
    switch (status) {
      case 'Đã thanh toán': return 'status-paid';
      case 'Chờ thanh toán': return 'status-waiting';
      case 'Chờ hoàn tiền': return 'status-refund-pending';
      case 'Đã hoàn tiền': return 'status-refunded';
      case 'Đã hủy': return 'status-cancelled';
      default: return '';
    }
  }

  getTicketStatusClass(status: string) {
    switch (status) {
      case 'Chờ thanh toán': return 'status-waiting';
      case 'Chờ khởi hành': return 'status-upcoming';
      case 'Đã hoàn thành': return 'status-completed';
      case 'Đã hủy': return 'status-cancelled';
      default: return '';
    }
  }

  getPriceColorClass(status: string) {
    switch (status) {
      case 'Chờ thanh toán': return 'price-unpaid';
      case 'Đã thanh toán': return 'price-paid';
      case 'Chờ hoàn tiền':
      case 'Đã hoàn tiền': 
      case 'Đã hủy': 
        return 'price-cancelled';
      default: return '';
    }
  }

  getPtttClass(pttt: string) {
    if (pttt === 'Momo') return 'pttt-momo';
    if (pttt === 'ZaloPay') return 'pttt-zalopay';
    if (pttt.includes('Chuyển khoản')) return 'pttt-ck';
    if (pttt === 'Tiền mặt') return 'pttt-cash';
    return '';
  }

  getRefundCalculation(ticket: Ticket | null) {
    if (!ticket) return { rate: 0, amount: 0, fee: 0, text: 'Không xác định' };
    
    // Parse ticket price (e.g. "170.000đ" -> 170000)
    const priceNum = parseInt(ticket.total.replace(/\./g, '').replace('đ', '')) || 0;
    
    // Today is simulated as 2026-05-18
    const today = new Date('2026-05-18T12:00:00');
    
    // Ticket date and time
    const ticketDateTime = new Date(`${ticket.date}T${ticket.time || '12:00'}:00`);
    
    const diffMs = ticketDateTime.getTime() - today.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    
    let rate = 0;
    let text = '';
    
    if (diffDays >= 7) {
      rate = 100;
      text = 'Trước khởi hành > 7 ngày (Hoàn 100%)';
    } else if (diffHours >= 24) {
      rate = 50;
      text = 'Trước khởi hành > 24 giờ (Hoàn 50%)';
    } else if (diffHours >= 12) {
      rate = 30;
      text = 'Trước khởi hành > 12 giờ (Hoàn 30%)';
    } else {
      rate = 0;
      text = 'Sát giờ khởi hành < 12 giờ hoặc đã qua (Hoàn 0%)';
    }
    
    const amount = (priceNum * rate) / 100;
    const fee = priceNum - amount;
    
    return {
      rate,
      amount,
      fee,
      text
    };
  }

  getSeatsList(seat: string): string[] {
    if (!seat) return [];
    return seat.split(',').map(s => s.trim());
  }

  getSeatColorClass(seat: string): string {
    if (!seat) return '';
    return seat.startsWith('A') ? 'seat-a' : 'seat-b';
  }
}
