import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CrewReportItem {
  maNhanSu: string;
  hoTen: string;
  vaiTro: 'Tài xế chính' | 'Tài xế phụ' | 'Phụ xe';
  sdt: string;
  soChuyenChay: number;
  tongGioChay: number;
  tongChiPhi: number;
  trangThai: 'Đang hoạt động' | 'Đã khóa';
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
    fromDate: '2026-05-01',
    toDate: '2026-05-31',
    searchTerm: '',
    role: 'Tất cả',
    status: 'Tất cả'
  };

  allCrew: CrewReportItem[] = [];
  filteredCrew: CrewReportItem[] = [];

  // KPI stats
  stats = {
    totalCrew: 0,
    totalTrips: 0,
    totalExpenses: 0
  };

  // Dropdown list for Roles
  rolesList = ['Tài xế chính', 'Tài xế phụ', 'Phụ xe'];

  ngOnInit() {
    this.allCrew = this.generateMockCrew();
    this.onViewReport();
  }

  private generateMockCrew(): CrewReportItem[] {
    // Generate realistic drivers and assistants for Tân Xuân Phúc
    return [
      {
        maNhanSu: 'TXP_NS001',
        hoTen: 'Trần Minh Toại',
        vaiTro: 'Tài xế chính',
        sdt: '0913456789',
        soChuyenChay: 24,
        tongGioChay: 192,
        tongChiPhi: 14200000, // fuel, toll gates, parking, etc.
        trangThai: 'Đang hoạt động'
      },
      {
        maNhanSu: 'TXP_NS002',
        hoTen: 'Nguyễn Văn Đạt',
        vaiTro: 'Tài xế chính',
        sdt: '0987654321',
        soChuyenChay: 22,
        tongGioChay: 176,
        tongChiPhi: 12900000,
        trangThai: 'Đang hoạt động'
      },
      {
        maNhanSu: 'TXP_NS003',
        hoTen: 'Lê Thanh Bình',
        vaiTro: 'Tài xế phụ',
        sdt: '0905123456',
        soChuyenChay: 18,
        tongGioChay: 144,
        tongChiPhi: 7800000,
        trangThai: 'Đang hoạt động'
      },
      {
        maNhanSu: 'TXP_NS004',
        hoTen: 'Phạm Hồng Thái',
        vaiTro: 'Tài xế phụ',
        sdt: '0977223344',
        soChuyenChay: 15,
        tongGioChay: 120,
        tongChiPhi: 6500000,
        trangThai: 'Đang hoạt động'
      },
      {
        maNhanSu: 'TXP_NS005',
        hoTen: 'Hoàng Quốc Việt',
        vaiTro: 'Phụ xe',
        sdt: '0935556677',
        soChuyenChay: 26,
        tongGioChay: 208,
        tongChiPhi: 3200000, // meals, washing, minor parking
        trangThai: 'Đang hoạt động'
      },
      {
        maNhanSu: 'TXP_NS006',
        hoTen: 'Vũ Ngọc Khánh',
        vaiTro: 'Phụ xe',
        sdt: '0911889900',
        soChuyenChay: 20,
        tongGioChay: 160,
        tongChiPhi: 2400000,
        trangThai: 'Đang hoạt động'
      },
      {
        maNhanSu: 'TXP_NS007',
        hoTen: 'Đặng Quốc Huy',
        vaiTro: 'Tài xế chính',
        sdt: '0989332211',
        soChuyenChay: 12,
        tongGioChay: 96,
        tongChiPhi: 6800000,
        trangThai: 'Đang hoạt động'
      },
      {
        maNhanSu: 'TXP_NS008',
        hoTen: 'Bùi Thế Anh',
        vaiTro: 'Phụ xe',
        sdt: '0966445566',
        soChuyenChay: 8,
        tongGioChay: 64,
        tongChiPhi: 950000,
        trangThai: 'Đã khóa'
      }
    ];
  }

  onViewReport() {
    this.filteredCrew = this.allCrew.filter(item => {
      // Search term
      if (this.filters.searchTerm) {
        const query = this.filters.searchTerm.toLowerCase();
        const matchName = item.hoTen.toLowerCase().includes(query);
        const matchPhone = item.sdt.includes(query);
        const matchCode = item.maNhanSu.toLowerCase().includes(query);
        if (!matchName && !matchPhone && !matchCode) return false;
      }

      // Role
      if (this.filters.role !== 'Tất cả' && item.vaiTro !== this.filters.role) return false;

      // Status
      if (this.filters.status !== 'Tất cả' && item.trangThai !== this.filters.status) return false;

      return true;
    });

    this.calculateStats();
  }

  private calculateStats() {
    let totalTrips = 0;
    let totalExpenses = 0;

    this.filteredCrew.forEach(item => {
      totalTrips += item.soChuyenChay;
      totalExpenses += item.tongChiPhi;
    });

    this.stats = {
      totalCrew: this.filteredCrew.length,
      totalTrips: totalTrips,
      totalExpenses: totalExpenses
    };
  }

  onResetFilters() {
    this.filters = {
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
      searchTerm: '',
      role: 'Tất cả',
      status: 'Tất cả'
    };
    this.onViewReport();
  }

  onExportExcel() {
    if (this.filteredCrew.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO CÔNG TÁC TÀI XẾ & PHỤ XE (TÂN XUÂN PHÚC)\n';
    csvContent += `Thời gian: Từ ${this.filters.fromDate} đến ${this.filters.toDate}\n`;
    csvContent += `Bộ lọc: Vai trò: ${this.filters.role}, Trạng thái: ${this.filters.status}\n\n`;
    
    csvContent += 'Mã nhân sự,Họ tên nhân viên,Vai trò,Số điện thoại,Số chuyến đã chạy,Tổng giờ chạy (giờ),Tổng chi phí phát sinh (VNĐ),Trạng thái làm việc\n';

    this.filteredCrew.forEach(item => {
      csvContent += `"${item.maNhanSu}","${item.hoTen}","${item.vaiTro}","${item.sdt}",${item.soChuyenChay},${item.tongGioChay},${item.tongChiPhi},"${item.trangThai}"\n`;
    });

    // Summary Row
    csvContent += `\n"Tổng cộng",,,"",${this.stats.totalTrips},,${this.stats.totalExpenses},\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoTaiXePhuXe_TXP_${this.filters.fromDate}_to_${this.filters.toDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
