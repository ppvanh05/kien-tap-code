import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CustomerReportItem {
  tenKhachHang: string;
  sdt: string;
  tuyen: string;
  slDat: number;
  slHuy: number;
  slThanhToan: number;
  tienBaoHiem: number;
  giaVe: number;
  thucThu: number;
}

@Component({
  selector: 'app-bao-cao-khach-hang',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bao-cao-khach-hang.component.html',
  styleUrls: ['./bao-cao-khach-hang.component.css']
})
export class BaoCaoKhachHangComponent implements OnInit {
  filters = {
    fromDate: '2026-05-01',
    toDate: '2026-05-31',
    searchTerm: '',
    route: 'Tất cả'
  };

  allCustomers: CustomerReportItem[] = [];
  filteredCustomers: CustomerReportItem[] = [];

  // KPI stats
  stats = {
    totalCustomers: 0,
    totalBookings: 0,
    totalCancellations: 0,
    totalRevenue: 0
  };

  routesList = [
    'Gia Lai ↔ Sài Gòn (BX Miền Đông)',
    'Gia Lai ↔ Bình Dương (BX Bến Cát)',
    'Bình Định ↔ Sài Gòn (BX Miền Tây)',
    'Phú Yên ↔ Sài Gòn (BX Miền Đông)'
  ];

  ngOnInit() {
    this.allCustomers = this.generateMockCustomers();
    this.onViewReport();
  }

  private generateMockCustomers(): CustomerReportItem[] {
    // Generate realistic passenger profiles for Tân Xuân Phúc
    return [
      {
        tenKhachHang: 'Nguyễn Văn An',
        sdt: '0912445566',
        tuyen: 'Gia Lai ↔ Sài Gòn (BX Miền Đông)',
        slDat: 5,
        slHuy: 0,
        slThanhToan: 5,
        tienBaoHiem: 50000,
        giaVe: 1750000,
        thucThu: 1800000 // including insurance or extra fees
      },
      {
        tenKhachHang: 'Trần Thị Bích',
        sdt: '0988776655',
        tuyen: 'Gia Lai ↔ Bình Dương (BX Bến Cát)',
        slDat: 4,
        slHuy: 1,
        slThanhToan: 3,
        tienBaoHiem: 30000,
        giaVe: 1050000,
        thucThu: 1080000
      },
      {
        tenKhachHang: 'Lê Văn Cường',
        sdt: '0903112233',
        tuyen: 'Bình Định ↔ Sài Gòn (BX Miền Tây)',
        slDat: 8,
        slHuy: 2,
        slThanhToan: 6,
        tienBaoHiem: 60000,
        giaVe: 1800000,
        thucThu: 1860000
      },
      {
        tenKhachHang: 'Phạm Minh Đạo',
        sdt: '0976334455',
        tuyen: 'Phú Yên ↔ Sài Gòn (BX Miền Đông)',
        slDat: 3,
        slHuy: 0,
        slThanhToan: 3,
        tienBaoHiem: 30000,
        giaVe: 840000,
        thucThu: 870000
      },
      {
        tenKhachHang: 'Hoàng Thị Dung',
        sdt: '0934889900',
        tuyen: 'Gia Lai ↔ Sài Gòn (BX Miền Đông)',
        slDat: 6,
        slHuy: 1,
        slThanhToan: 5,
        tienBaoHiem: 50000,
        giaVe: 1750000,
        thucThu: 1800000
      },
      {
        tenKhachHang: 'Nguyễn Thị Phương',
        sdt: '0919223344',
        tuyen: 'Gia Lai ↔ Bình Dương (BX Bến Cát)',
        slDat: 2,
        slHuy: 0,
        slThanhToan: 2,
        tienBaoHiem: 20000,
        giaVe: 700000,
        thucThu: 720000
      },
      {
        tenKhachHang: 'Lý Quốc Bảo',
        sdt: '0983112244',
        tuyen: 'Bình Định ↔ Sài Gòn (BX Miền Tây)',
        slDat: 10,
        slHuy: 0,
        slThanhToan: 10,
        tienBaoHiem: 100000,
        giaVe: 3000000,
        thucThu: 3100000
      },
      {
        tenKhachHang: 'Vũ Thanh Hằng',
        sdt: '0967445522',
        tuyen: 'Phú Yên ↔ Sài Gòn (BX Miền Đông)',
        slDat: 1,
        slHuy: 1,
        slThanhToan: 0,
        tienBaoHiem: 0,
        giaVe: 0,
        thucThu: 0
      }
    ];
  }

  onViewReport() {
    this.filteredCustomers = this.allCustomers.filter(item => {
      // Search term
      if (this.filters.searchTerm) {
        const query = this.filters.searchTerm.toLowerCase();
        const matchName = item.tenKhachHang.toLowerCase().includes(query);
        const matchPhone = item.sdt.includes(query);
        if (!matchName && !matchPhone) return false;
      }

      // Route filter
      if (this.filters.route !== 'Tất cả' && item.tuyen !== this.filters.route) return false;

      return true;
    });

    this.calculateStats();
  }

  private calculateStats() {
    let bookings = 0;
    let cancellations = 0;
    let revenue = 0;

    this.filteredCustomers.forEach(item => {
      bookings += item.slThanhToan;
      cancellations += item.slHuy;
      revenue += item.thucThu;
    });

    this.stats = {
      totalCustomers: this.filteredCustomers.length,
      totalBookings: bookings,
      totalCancellations: cancellations,
      totalRevenue: revenue
    };
  }

  onResetFilters() {
    this.filters = {
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
      searchTerm: '',
      route: 'Tất cả'
    };
    this.onViewReport();
  }

  onExportExcel() {
    if (this.filteredCustomers.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO GIAO DỊCH KHÁCH HÀNG (TÂN XUÂN PHÚC)\n';
    csvContent += `Thời gian: Từ ${this.filters.fromDate} đến ${this.filters.toDate}\n`;
    csvContent += `Tuyến: ${this.filters.route}\n\n`;
    
    csvContent += 'Tên khách hàng,Số điện thoại,Tuyến xe,SL vé đã đặt,SL vé đã hủy,SL vé đã thanh toán,Tiền bảo hiểm (VNĐ),Giá vé (VNĐ),Thực thu (VNĐ)\n';

    this.filteredCustomers.forEach(item => {
      csvContent += `"${item.tenKhachHang}","${item.sdt}","${item.tuyen}",${item.slDat},${item.slHuy},${item.slThanhToan},${item.tienBaoHiem},${item.giaVe},${item.thucThu}\n`;
    });

    // Summary Row
    csvContent += `\n"Tổng cộng",,,"",${this.stats.totalBookings + this.stats.totalCancellations},${this.stats.totalCancellations},${this.stats.totalBookings},,${this.stats.totalRevenue}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoKhachHang_TXP_${this.filters.fromDate}_to_${this.filters.toDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
