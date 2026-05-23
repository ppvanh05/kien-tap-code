import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RefundReportItem {
  maVe: string;
  tuyen: string;
  ngayDi: string;
  gioDi: string;
  ngayDat: string;
  vpDat: string;
  vpHuy: string;
  lyDoHuy: string;
  giaVe: number;
  phiHuy: number;
  tienHoan: number;
}

@Component({
  selector: 'app-bao-cao-hoan-huy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bao-cao-hoan-huy.component.html',
  styleUrls: ['./bao-cao-hoan-huy.component.css']
})
export class BaoCaoHoanHuyComponent implements OnInit {
  filters = {
    fromDate: '2026-05-01',
    toDate: '2026-05-31',
    route: 'Tất cả',
    time: 'Tất cả',
    cancelReason: 'Tất cả'
  };

  allRefunds: RefundReportItem[] = [];
  filteredRefunds: RefundReportItem[] = [];

  // KPI stats
  stats = {
    totalCancelled: 0,
    totalOriginalPrice: 0,
    totalFees: 0,
    totalRefunded: 0
  };

  routesList = [
    'Gia Lai ↔ Sài Gòn (BX Miền Đông)',
    'Gia Lai ↔ Bình Dương (BX Bến Cát)',
    'Bình Định ↔ Sài Gòn (BX Miền Tây)',
    'Phú Yên ↔ Sài Gòn (BX Miền Đông)'
  ];

  timesList = ['08:00', '13:00', '19:00', '21:00'];
  
  reasonsList = [
    'Khách hàng chủ động hủy (Trước 24h)',
    'Khách hàng chủ động hủy (Dưới 24h)',
    'Đổi lịch trình chuyến đi',
    'Trễ giờ lên xe / Không liên lạc được',
    'Nhà xe hủy chuyến / Sự cố kỹ thuật'
  ];

  ngOnInit() {
    this.allRefunds = this.generateMockRefunds();
    this.onViewReport();
  }

  private generateMockRefunds(): RefundReportItem[] {
    // Generate realistic cancelled tickets for Tân Xuân Phúc in May 2026
    const data: RefundReportItem[] = [];
    const routes = [
      'Gia Lai ↔ Sài Gòn (BX Miền Đông)',
      'Gia Lai ↔ Bình Dương (BX Bến Cát)',
      'Bình Định ↔ Sài Gòn (BX Miền Tây)',
      'Phú Yên ↔ Sài Gòn (BX Miền Đông)'
    ];
    const times = ['08:00', '13:00', '19:00', '21:00'];
    const channels = [
      'Website / Online',
      'Văn phòng Gia Lai (An Nhơn Bắc)'
    ];
    const reasons = [
      'Khách hàng chủ động hủy (Trước 24h)',
      'Khách hàng chủ động hủy (Dưới 24h)',
      'Đổi lịch trình chuyến đi',
      'Trễ giờ lên xe / Không liên lạc được',
      'Nhà xe hủy chuyến / Sự cố kỹ thuật'
    ];

    // Generate 25 mock cancellation records
    for (let i = 1; i <= 25; i++) {
      const routeIdx = i % routes.length;
      const timeIdx = (i * 3) % times.length;
      
      const isOnlineDat = (i % 3) === 0;
      const isOnlineHuy = (i % 2) === 0;
      
      const vpDatStr = isOnlineDat ? channels[0] : channels[1];
      const vpHuyStr = isOnlineHuy ? channels[0] : channels[1];
      const reasonIdx = i % reasons.length;

      const day = (i % 25) + 1;
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const ngayDi = `2026-05-${dayStr}`;

      const bookingDay = Math.max(1, day - (i % 3) - 1);
      const bookingDayStr = bookingDay < 10 ? `0${bookingDay}` : `${bookingDay}`;
      const ngayDat = `2026-05-${bookingDayStr}`;

      let giaVe = 350000;
      if (routeIdx === 2) giaVe = 300000;
      if (routeIdx === 3) giaVe = 280000;

      // Fees based on cancellation reason
      let phiHuy = 0;
      if (reasonIdx === 0) {
        phiHuy = 0; // free cancellation before 24h
      } else if (reasonIdx === 1) {
        phiHuy = giaVe * 0.1; // 10% fee
      } else if (reasonIdx === 3) {
        phiHuy = giaVe; // 100% loss for no-show
      } else if (reasonIdx === 4) {
        phiHuy = 0; // free if company cancelled, might include compensation but here just refund 100%
      } else {
        phiHuy = giaVe * 0.05; // 5% admin fee
      }

      const tienHoan = giaVe - phiHuy;

      data.push({
        maVe: `TXP2605C${String(100 + i).padStart(3, '0')}`,
        tuyen: routes[routeIdx],
        ngayDi: ngayDi,
        gioDi: times[timeIdx],
        ngayDat: ngayDat,
        vpDat: vpDatStr,
        vpHuy: vpHuyStr,
        lyDoHuy: reasons[reasonIdx],
        giaVe: giaVe,
        phiHuy: phiHuy,
        tienHoan: tienHoan
      });
    }

    return data.sort((a, b) => b.ngayDi.localeCompare(a.ngayDi));
  }

  onViewReport() {
    this.filteredRefunds = this.allRefunds.filter(item => {
      // Date filter
      if (this.filters.fromDate && item.ngayDi < this.filters.fromDate) return false;
      if (this.filters.toDate && item.ngayDi > this.filters.toDate) return false;

      // Advanced filters
      if (this.filters.route !== 'Tất cả' && item.tuyen !== this.filters.route) return false;
      if (this.filters.time !== 'Tất cả' && item.gioDi !== this.filters.time) return false;
      if (this.filters.cancelReason !== 'Tất cả' && item.lyDoHuy !== this.filters.cancelReason) return false;

      return true;
    });

    this.calculateStats();
  }

  private calculateStats() {
    let price = 0;
    let fees = 0;
    let refund = 0;

    this.filteredRefunds.forEach(item => {
      price += item.giaVe;
      fees += item.phiHuy;
      refund += item.tienHoan;
    });

    this.stats = {
      totalCancelled: this.filteredRefunds.length,
      totalOriginalPrice: price,
      totalFees: fees,
      totalRefunded: refund
    };
  }

  onResetFilters() {
    this.filters = {
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
      route: 'Tất cả',
      time: 'Tất cả',
      cancelReason: 'Tất cả'
    };
    this.onViewReport();
  }

  onExportExcel() {
    if (this.filteredRefunds.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO HOÀN HỦY VÉ XE KHÁCH (TÂN XUÂN PHÚC)\n';
    csvContent += `Thời gian khởi hành: Từ ${this.filters.fromDate} đến ${this.filters.toDate}\n`;
    csvContent += `Bộ lọc: Tuyến: ${this.filters.route}, Lý do: ${this.filters.cancelReason}\n\n`;
    
    csvContent += 'Mã vé,Tuyến xe,Ngày đi,Giờ đi,Ngày đặt,Kênh đặt,Kênh hủy,Lý do hủy,Giá vé (VNĐ),Phí hủy (VNĐ),Số tiền hoàn (VNĐ)\n';

    this.filteredRefunds.forEach(item => {
      csvContent += `"${item.maVe}","${item.tuyen}","${item.ngayDi}","${item.gioDi}","${item.ngayDat}","${item.vpDat}","${item.vpHuy}","${item.lyDoHuy}",${item.giaVe},${item.phiHuy},${item.tienHoan}\n`;
    });

    // Summary Row
    csvContent += `\n"Tổng cộng",,,,,,,,"${this.stats.totalOriginalPrice}",${this.stats.totalFees},${this.stats.totalRefunded}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoHoanHuy_TXP_${this.filters.fromDate}_to_${this.filters.toDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
