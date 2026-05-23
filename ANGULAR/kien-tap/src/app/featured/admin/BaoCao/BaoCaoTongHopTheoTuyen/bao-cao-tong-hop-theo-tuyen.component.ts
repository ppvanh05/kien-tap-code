import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RouteSummaryItem {
  tuyen: string;
  slVeDaBan: number;
  tongDoanhThu: number;
}

@Component({
  selector: 'app-bao-cao-tong-hop-theo-tuyen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bao-cao-tong-hop-theo-tuyen.component.html',
  styleUrls: ['./bao-cao-tong-hop-theo-tuyen.component.css']
})
export class BaoCaoTongHopTheoTuyenComponent implements OnInit {
  filters = {
    fromDate: '2026-05-01',
    toDate: '2026-05-31',
    route: 'Tất cả'
  };

  allSummaries: RouteSummaryItem[] = [];
  filteredSummaries: RouteSummaryItem[] = [];

  routesList = [
    'Gia Lai ↔ Sài Gòn (BX Miền Đông)',
    'Gia Lai ↔ Bình Dương (BX Bến Cát)',
    'Bình Định ↔ Sài Gòn (BX Miền Tây)',
    'Phú Yên ↔ Sài Gòn (BX Miền Đông)'
  ];

  // Totals for summary row
  totals = {
    slVeDaBan: 0,
    tongDoanhThu: 0
  };

  ngOnInit() {
    this.generateMockSummaries();
    this.onViewReport();
  }

  private generateMockSummaries() {
    // Generate realistic, consistent figures based on routes for Tân Xuân Phúc
    this.allSummaries = [
      {
        tuyen: 'Gia Lai ↔ Sài Gòn (BX Miền Đông)',
        slVeDaBan: 313,
        tongDoanhThu: 109550000 // 313 * 350,000
      },
      {
        tuyen: 'Gia Lai ↔ Bình Dương (BX Bến Cát)',
        slVeDaBan: 224,
        tongDoanhThu: 78400000 // 224 * 350,000
      },
      {
        tuyen: 'Bình Định ↔ Sài Gòn (BX Miền Tây)',
        slVeDaBan: 405,
        tongDoanhThu: 121500000 // 405 * 300,000
      },
      {
        tuyen: 'Phú Yên ↔ Sài Gòn (BX Miền Đông)',
        slVeDaBan: 175,
        tongDoanhThu: 49000000 // 175 * 280,000
      }
    ];
  }

  onViewReport() {
    // Dynamic filter based on selected route
    this.filteredSummaries = this.allSummaries.filter(item => {
      if (this.filters.route !== 'Tất cả' && item.tuyen !== this.filters.route) return false;
      return true;
    });

    this.calculateTotals();
  }

  private calculateTotals() {
    let slVeDaBan = 0;
    let tongDoanhThu = 0;

    this.filteredSummaries.forEach(item => {
      slVeDaBan += item.slVeDaBan;
      tongDoanhThu += item.tongDoanhThu;
    });

    this.totals = {
      slVeDaBan,
      tongDoanhThu
    };
  }

  onResetFilters() {
    this.filters = {
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
      route: 'Tất cả'
    };
    this.onViewReport();
  }

  onExportExcel() {
    if (this.filteredSummaries.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO TỔNG HỢP VÉ BÁN THEO TUYẾN (TÂN XUÂN PHÚC)\n';
    csvContent += `Thời gian: Từ ${this.filters.fromDate} đến ${this.filters.toDate}\n`;
    csvContent += `Tuyến: ${this.filters.route}\n\n`;
    
    csvContent += 'Tuyến xe,Số lượng vé đã bán,Tổng doanh thu (VNĐ)\n';

    this.filteredSummaries.forEach(item => {
      csvContent += `"${item.tuyen}",${item.slVeDaBan},${item.tongDoanhThu}\n`;
    });

    // Summary Row
    csvContent += `\n"TỔNG (VNĐ)",${this.totals.slVeDaBan},${this.totals.tongDoanhThu}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoTongHopTuyen_TXP_${this.filters.fromDate}_to_${this.filters.toDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
