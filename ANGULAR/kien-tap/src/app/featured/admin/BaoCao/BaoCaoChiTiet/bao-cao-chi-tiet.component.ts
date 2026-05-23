import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DetailedReportItem {
  maVe: string;
  tuyen: string;
  ngayDi: string;
  gioDi: string;
  ngayDat: string;
  pttt: string;
  vpDatVe: string; // Booking channel: Website / Online or Văn phòng Gia Lai (An Nhơn Bắc)
  giaVe: number;
}

@Component({
  selector: 'app-bao-cao-chi-tiet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bao-cao-chi-tiet.component.html',
  styleUrls: ['./bao-cao-chi-tiet.component.css']
})
export class BaoCaoChiTietComponent implements OnInit {
  // Date and filter options
  filters = {
    dateType: 'NgayDi', // 'NgayDi' or 'NgayDat'
    fromDate: '2026-05-01',
    toDate: '2026-05-31',
    route: 'Tất cả',
    time: 'Tất cả',
    paymentMethod: 'Tất cả',
    office: 'Tất cả'
  };

  // Data lists
  allData: DetailedReportItem[] = [];
  filteredData: DetailedReportItem[] = [];
  
  // Lists for dropdown options
  routesList = [
    'Gia Lai ↔ Sài Gòn (BX Miền Đông)',
    'Gia Lai ↔ Bình Dương (BX Bến Cát)',
    'Bình Định ↔ Sài Gòn (BX Miền Tây)',
    'Phú Yên ↔ Sài Gòn (BX Miền Đông)'
  ];

  timesList = ['08:00', '13:00', '19:00', '21:00'];
  paymentMethods = ['Momo', 'ZaloPay', 'Chuyển khoản (Vietcombank)', 'Tiền mặt'];
  officesList = [
    'Website / Online',
    'Văn phòng Gia Lai (An Nhơn Bắc)'
  ];

  // Pagination variables
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Stats summaries
  stats = {
    totalTickets: 0,
    totalRevenue: 0,
    onlineCount: 0,
    officeCount: 0
  };

  ngOnInit() {
    this.allData = this.generateMockData();
    this.onViewReport();
  }

  private generateMockData(): DetailedReportItem[] {
    const data: DetailedReportItem[] = [];
    const routes = [
      'Gia Lai ↔ Sài Gòn (BX Miền Đông)',
      'Gia Lai ↔ Bình Dương (BX Bến Cát)',
      'Bình Định ↔ Sài Gòn (BX Miền Tây)',
      'Phú Yên ↔ Sài Gòn (BX Miền Đông)'
    ];
    const times = ['08:00', '13:00', '19:00', '21:00'];
    const pttts = ['Momo', 'ZaloPay', 'Chuyển khoản (Vietcombank)', 'Tiền mặt'];
    const channels = [
      'Website / Online',
      'Văn phòng Gia Lai (An Nhơn Bắc)'
    ];

    // Generate 120 detailed e-ticket items in May 2026
    for (let i = 1; i <= 120; i++) {
      const routeIdx = i % routes.length;
      const timeIdx = (i * 3) % times.length;
      const ptttIdx = (i * 7) % pttts.length;
      
      // 40% Online, 60% Office booking (corresponds roughly to SRS where online is starting up)
      const isOnline = (i % 5) < 2;
      const channelStr = isOnline ? channels[0] : channels[1];
      
      const day = (i % 28) + 1;
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const ngayDi = `2026-05-${dayStr}`;
      
      // Booking date is 1-4 days before departure
      const bookingDay = Math.max(1, day - (i % 4) - 1);
      const bookingDayStr = bookingDay < 10 ? `0${bookingDay}` : `${bookingDay}`;
      const ngayDat = `2026-05-${bookingDayStr}`;

      // Price based on route
      let giaVe = 350000; // Limousine Gia Lai - SG
      if (routeIdx === 2) giaVe = 300000; // Binh Dinh - SG
      if (routeIdx === 3) giaVe = 280000; // Phu Yen - SG

      data.push({
        maVe: `TXP2605${String(1000 + i).padStart(4, '0')}`,
        tuyen: routes[routeIdx],
        ngayDi: ngayDi,
        gioDi: times[timeIdx],
        ngayDat: ngayDat,
        pttt: pttts[ptttIdx],
        vpDatVe: channelStr,
        giaVe: giaVe
      });
    }

    // Sort by departure date descending, then departure time descending
    return data.sort((a, b) => {
      if (a.ngayDi !== b.ngayDi) {
        return b.ngayDi.localeCompare(a.ngayDi);
      }
      return b.gioDi.localeCompare(a.gioDi);
    });
  }

  onViewReport() {
    this.filteredData = this.allData.filter(item => {
      // Date filter
      const targetDate = this.filters.dateType === 'NgayDi' ? item.ngayDi : item.ngayDat;
      if (this.filters.fromDate && targetDate < this.filters.fromDate) return false;
      if (this.filters.toDate && targetDate > this.filters.toDate) return false;

      // Advanced filters
      if (this.filters.route !== 'Tất cả' && item.tuyen !== this.filters.route) return false;
      if (this.filters.time !== 'Tất cả' && item.gioDi !== this.filters.time) return false;
      if (this.filters.paymentMethod !== 'Tất cả' && item.pttt !== this.filters.paymentMethod) return false;
      if (this.filters.office !== 'Tất cả' && item.vpDatVe !== this.filters.office) return false;

      return true;
    });

    // Calculate summaries
    this.calculateStats();
    
    // Reset pagination
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  private calculateStats() {
    let totalRevenue = 0;
    let onlineCount = 0;
    let officeCount = 0;

    this.filteredData.forEach(item => {
      totalRevenue += item.giaVe;
      if (item.vpDatVe === 'Website / Online') {
        onlineCount++;
      } else {
        officeCount++;
      }
    });

    this.stats = {
      totalTickets: this.filteredData.length,
      totalRevenue: totalRevenue,
      onlineCount: onlineCount,
      officeCount: officeCount
    };
  }

  private calculateTotalPages() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
  }

  get paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers() {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 4);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  onResetFilters() {
    this.filters = {
      dateType: 'NgayDi',
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
      route: 'Tất cả',
      time: 'Tất cả',
      paymentMethod: 'Tất cả',
      office: 'Tất cả'
    };
    this.onViewReport();
  }

  onExportExcel() {
    if (this.filteredData.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    // Dynamic CSV export for Vietnamese accent support with UTF-8 BOM
    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO CHI TIẾT VÉ BÁN (TÂN XUÂN PHÚC)\n';
    csvContent += `Thời gian: Từ ${this.filters.fromDate} đến ${this.filters.toDate}\n`;
    csvContent += `Tuyến: ${this.filters.route}, Giờ đi: ${this.filters.time}, PTTT: ${this.filters.paymentMethod}, Văn phòng/Kênh: ${this.filters.office}\n\n`;
    
    // Headers
    csvContent += 'Mã vé,Tuyến xe,Ngày đi,Giờ đi,Ngày đặt,Phương thức thanh toán,Kênh đặt vé,Giá vé (VNĐ)\n';

    // Records
    this.filteredData.forEach(item => {
      csvContent += `"${item.maVe}","${item.tuyen}","${item.ngayDi}","${item.gioDi}","${item.ngayDat}","${item.pttt}","${item.vpDatVe}",${item.giaVe}\n`;
    });

    // Summary Row
    csvContent += `\n"Tổng cộng",,,,,,,"",${this.stats.totalRevenue}\n`;

    // Download action
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoChiTietVe_TXP_${this.filters.fromDate}_to_${this.filters.toDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
