import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaoCaoService } from '../../../../core/services/bao-cao.service';

interface RefundReportItem {
  maVe: string;
  nguoiHuy: string; // Source of cancellation (e.g., "Khách hàng tự hủy trên web", "Nhân viên bán vé hủy hộ")
  tienGoc: number; // Original ticket price
  tyLePhi: number; // Cancellation fee percentage
  lePhiHuy: number; // Cancellation fee amount
  tienHoan: number; // Refund amount
  maGiaoDich: string; // Transaction ID for refund
  ngayHuy: string; // Cancellation date for filtering
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
    nguoiHuy: 'Tất cả'
  };

  filteredRefunds: RefundReportItem[] = [];
  isReportViewed = true;

  // KPI stats
  stats = {
    totalCancelled: 0,
    totalOriginalPrice: 0,
    totalFees: 0,
    totalRefunded: 0
  };

  nguoiHuyList: string[] = ['Khách hàng tự hủy trên web', 'Nhân viên bán vé hủy hộ'];

  constructor(
    private baoCaoService: BaoCaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.onViewReport();
  }

  onViewReport() {
    this.isReportViewed = true;
    this.baoCaoService.getBaoCaoHoanHuy(this.filters).subscribe({
      next: (data: any[]) => {
        this.filteredRefunds = data as RefundReportItem[];
        this.calculateStats();
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        console.error('Error fetching hoan huy report:', err);
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      }
    });
  }

  private calculateStats() {
    let totalOriginalPrice = 0;
    let totalFees = 0;
    let totalRefunded = 0;

    this.filteredRefunds.forEach(item => {
      totalOriginalPrice += item.tienGoc;
      totalFees += item.lePhiHuy;
      totalRefunded += item.tienHoan;
    });

    this.stats = {
      totalCancelled: this.filteredRefunds.length,
      totalOriginalPrice: totalOriginalPrice,
      totalFees: totalFees,
      totalRefunded: totalRefunded
    };
  }

  onResetFilters() {
    this.filters = {
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
      nguoiHuy: 'Tất cả'
    };
    this.isReportViewed = true;
    this.onViewReport();
  }

  onExportExcel() {
    if (this.filteredRefunds.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO HOÀN HỦY VÉ XE KHÁCH (TÂN XUÂN PHÚC)\n';
    csvContent += `Thời gian hủy: Từ ${this.filters.fromDate} đến ${this.filters.toDate}\n`;
    csvContent += `Bộ lọc: Người hủy: ${this.filters.nguoiHuy}\n\n`;
    
    csvContent += 'Mã vé / Mã đơn hàng,Người thực hiện hủy,Tiền vé gốc,Tỷ lệ phí hủy áp dụng (%),Lệ phí hủy (VNĐ),Số tiền hoàn lại,Mã giao dịch hoàn\n';

    this.filteredRefunds.forEach(item => {
      csvContent += `"${item.maVe}","${item.nguoiHuy}",${item.tienGoc},${item.tyLePhi * 100},${item.lePhiHuy},${item.tienHoan},"${item.maGiaoDich}"\n`;
    });

    // Summary Row
    csvContent += `\n"Tổng cộng",${this.stats.totalCancelled},"Tổng tiền gốc",${this.stats.totalOriginalPrice},"Tổng phí hủy",${this.stats.totalFees},"Tổng tiền hoàn",${this.stats.totalRefunded}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoHoanHuy_TXP.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
