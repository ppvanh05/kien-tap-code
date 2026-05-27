import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaoCaoService } from '../../../../core/services/bao-cao.service';

interface CustomerReportItem {
  maKhachHang: string;
  tenKhachHang: string;
  sdt: string;
  email: string;
  ngayDangKy: string;
  tongVeDat: number;
  trangThai: 'Đang hoạt động' | 'Đã khóa';
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
    searchTerm: '',
    status: 'Tất cả',
    fromDate: '',
    toDate: ''
  };

  filteredCustomers: CustomerReportItem[] = [];
  isReportViewed = true;

  // KPI stats
  stats = {
    totalCustomers: 0,
    activeCustomers: 0,
    lockedCustomers: 0,
    totalVeDat: 0
  };

  constructor(
    private baoCaoService: BaoCaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.onViewReport();
  }

  onViewReport() {
    this.isReportViewed = true;
    this.baoCaoService.getBaoCaoKhachHang(this.filters).subscribe({
      next: (data: any[]) => {
        this.filteredCustomers = data as CustomerReportItem[];
        this.calculateStats();
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        console.error('Error fetching khach hang report:', err);
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      }
    });
  }

  private calculateStats() {
    let activeCustomers = 0;
    let lockedCustomers = 0;
    let totalVeDat = 0;

    this.filteredCustomers.forEach(item => {
      totalVeDat += item.tongVeDat;
      if (item.trangThai === 'Đang hoạt động') {
        activeCustomers++;
      } else {
        lockedCustomers++;
      }
    });

    this.stats = {
      totalCustomers: this.filteredCustomers.length,
      activeCustomers,
      lockedCustomers,
      totalVeDat
    };
  }

  onResetFilters() {
    this.filters = {
      searchTerm: '',
      status: 'Tất cả',
      fromDate: '',
      toDate: ''
    };
    this.isReportViewed = true;
    this.onViewReport();
  }

  onExportExcel() {
    if (this.filteredCustomers.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO THỐNG KÊ TÀI KHOẢN KHÁCH HÀNG (TÂN XUÂN PHÚC)\n';
    csvContent += `Bộ lọc: Trạng thái: ${this.filters.status}`;
    if (this.filters.fromDate || this.filters.toDate) {
      csvContent += `, Từ ngày: ${this.filters.fromDate || '...'} Đến ngày: ${this.filters.toDate || '...'}`;
    }
    csvContent += '\n\n';
    
    csvContent += 'Mã khách hàng,Họ tên khách hàng,Số điện thoại,Email,Ngày đăng ký,Tổng vé đặt,Trạng thái tài khoản\n';

    this.filteredCustomers.forEach(item => {
      csvContent += `"${item.maKhachHang}","${item.tenKhachHang}","${item.sdt}","${item.email}","${item.ngayDangKy}",${item.tongVeDat},"${item.trangThai}"\n`;
    });

    // Summary Row
    csvContent += `\n"Tổng số khách hàng",${this.stats.totalCustomers},"Hoạt động",${this.stats.activeCustomers},"Bị khóa",${this.stats.lockedCustomers},"Tổng số vé đặt",${this.stats.totalVeDat}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoKhachHang_TXP.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
