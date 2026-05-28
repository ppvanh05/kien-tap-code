import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaoCaoService } from '../../../../core/services/bao-cao.service';

interface CrewReportItem {
  maNhanSu: string;
  hoTen: string;
  vaiTro: 'Tài xế' | 'Phụ xe';
  sdt: string;
  cccd: string;
  loaiBangLai: string;
  thoiHanBangLai: string;
  trangThaiLamViec: 'Đang hoạt động' | 'Đã khóa';
}

@Component({
  selector: 'app-bao-cao-tai-xe-phu-xe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bao-cao-tai-xe-phu-xe.component.html',
  styleUrls: ['./bao-cao-tai-xe-phu-xe.component.css']
})
export class BaoCaoTaiXePhuXeComponent implements OnInit {
  filters = {
    searchTerm: '',
    role: 'Tất cả',
    status: 'Tất cả'
  };

  filteredCrew: CrewReportItem[] = [];
  isReportViewed = true;

  // KPI stats
  stats = {
    totalCrew: 0,
    totalDrivers: 0,
    totalAssistants: 0,
    expiringLicenses: 0
  };

  rolesList = ['Tài xế', 'Phụ xe'];

  constructor(
    private baoCaoService: BaoCaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.onViewReport();
  }

  isLicenseExpiringSoon(expiryStr: string): boolean {
    if (!expiryStr || expiryStr === 'N/A') return false;
    const parts = expiryStr.split('/');
    if (parts.length !== 3) return false;
    const expiryDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    const today = new Date('2026-05-18');
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }

  isLicenseExpired(expiryStr: string): boolean {
    if (!expiryStr || expiryStr === 'N/A') return false;
    const parts = expiryStr.split('/');
    if (parts.length !== 3) return false;
    const expiryDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    const today = new Date('2026-05-18');
    return expiryDate.getTime() < today.getTime();
  }

  onViewReport() {
    this.isReportViewed = true;
    this.baoCaoService.getBaoCaoTaiXePhuXe(this.filters).subscribe({
      next: (data: any[]) => {
        this.filteredCrew = data as CrewReportItem[];
        this.calculateStats();
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        console.error('Error fetching tai xe phu xe report:', err);
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      }
    });
  }

  private calculateStats() {
    let totalDrivers = 0;
    let totalAssistants = 0;
    let expiringLicenses = 0;

    this.filteredCrew.forEach(item => {
      if (item.vaiTro === 'Tài xế') {
        totalDrivers++;
        if (this.isLicenseExpiringSoon(item.thoiHanBangLai) || this.isLicenseExpired(item.thoiHanBangLai)) {
          expiringLicenses++;
        }
      } else {
        totalAssistants++;
      }
    });

    this.stats = {
      totalCrew: this.filteredCrew.length,
      totalDrivers,
      totalAssistants,
      expiringLicenses
    };
  }

  onResetFilters() {
    this.filters = {
      searchTerm: '',
      role: 'Tất cả',
      status: 'Tất cả'
    };
    this.isReportViewed = true;
    this.onViewReport();
  }

  onExportExcel() {
    if (this.filteredCrew.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO NHÂN SỰ TÀI XẾ & PHỤ XE (TÂN XUÂN PHÚC)\n';
    csvContent += `Bộ lọc: Vai trò: ${this.filters.role}, Trạng thái: ${this.filters.status}\n\n`;
    
    csvContent += 'Mã nhân sự,Họ tên nhân viên,Vai trò,Số điện thoại,CCCD,Loại bằng lái,Thời hạn bằng lái,Trạng thái làm việc\n';

    this.filteredCrew.forEach(item => {
      csvContent += `"${item.maNhanSu}","${item.hoTen}","${item.vaiTro}","${item.sdt}","${item.cccd}","${item.loaiBangLai}","${item.thoiHanBangLai}","${item.trangThaiLamViec}"\n`;
    });

    // Summary Row
    csvContent += `\n"Tổng cộng nhân sự",${this.stats.totalCrew},"Lái xe",${this.stats.totalDrivers},"Phụ xe",${this.stats.totalAssistants},"Bằng lái hết hạn/sắp hết hạn",${this.stats.expiringLicenses}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoTaiXePhuXe_TXP.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
