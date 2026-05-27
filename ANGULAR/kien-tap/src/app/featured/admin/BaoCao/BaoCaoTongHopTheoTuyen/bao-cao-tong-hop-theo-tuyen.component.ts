import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuyenXeService } from '../../QuanLyDieuHanh/tuyen-xe.service';
import { BaoCaoService } from '../../../../core/services/bao-cao.service';

interface RouteSummaryItem {
  maTuyen: string;
  tuyen: string;
  khoangCachThoiGian: string;
  slChuyenChay: number;
  slVeDaBan: number;
  tyLeLapDay: number;
  tongDoanhThu: number;
  tongChiPhiVanHanh: number; // New field
  loiNhuanTuyen: number; // New field
  doanhThuTrungBinhChuyen: number; // New field
  loiNhuanTrungBinhChuyen: number; // New field
  trangThai: 'Đang hoạt động' | 'Ngừng hoạt động';
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
    route: 'Tất cả',
    status: 'Tất cả'
  };

  filteredSummaries: RouteSummaryItem[] = [];
  isReportViewed = true;

  routesList: string[] = [];

  // Totals for summary row
  totals = {
    slChuyenChay: 0,
    slVeDaBan: 0,
    tongDoanhThu: 0,
    tongChiPhiVanHanh: 0,
    loiNhuanTuyen: 0,
    tyLeLapDayTrungBinh: 0,
    doanhThuTrungBinhChuyen: 0,
    loiNhuanTrungBinhChuyen: 0
  };

  constructor(
    private tuyenXeService: TuyenXeService,
    private baoCaoService: BaoCaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.routesList = this.tuyenXeService.getRoutesList();
    this.onViewReport();
  }

  onViewReport() {
    this.isReportViewed = true;
    this.baoCaoService.getBaoCaoTuyenXe(this.filters).subscribe({
      next: (data: any[]) => {
        this.filteredSummaries = data as RouteSummaryItem[];
        this.calculateTotals();
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        console.error('Error fetching tuyen xe report:', err);
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      }
    });
  }

  private calculateTotals() {
    let slChuyenChay = 0;
    let slVeDaBan = 0;
    let tongDoanhThu = 0;
    let tongChiPhiVanHanh = 0;
    let loiNhuanTuyen = 0;
    let sumTyLeLapDay = 0;
    let sumDoanhThuTrungBinhChuyen = 0;
    let sumLoiNhuanTrungBinhChuyen = 0;

    this.filteredSummaries.forEach(item => {
      slChuyenChay += item.slChuyenChay;
      slVeDaBan += item.slVeDaBan;
      tongDoanhThu += item.tongDoanhThu;
      tongChiPhiVanHanh += item.tongChiPhiVanHanh;
      loiNhuanTuyen += item.loiNhuanTuyen;
      sumTyLeLapDay += item.tyLeLapDay;
      sumDoanhThuTrungBinhChuyen += item.doanhThuTrungBinhChuyen;
      sumLoiNhuanTrungBinhChuyen += item.loiNhuanTrungBinhChuyen;
    });

    this.totals = {
      slChuyenChay,
      slVeDaBan,
      tongDoanhThu,
      tongChiPhiVanHanh,
      loiNhuanTuyen,
      tyLeLapDayTrungBinh: this.filteredSummaries.length > 0 
        ? Math.round(sumTyLeLapDay / this.filteredSummaries.length) 
        : 0,
      doanhThuTrungBinhChuyen: this.filteredSummaries.length > 0
        ? sumDoanhThuTrungBinhChuyen / this.filteredSummaries.length
        : 0,
      loiNhuanTrungBinhChuyen: this.filteredSummaries.length > 0
        ? sumLoiNhuanTrungBinhChuyen / this.filteredSummaries.length
        : 0
    };
  }

  onResetFilters() {
    this.filters = {
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
      route: 'Tất cả',
      status: 'Tất cả'
    };
    this.isReportViewed = true;
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
    csvContent += `Tuyến: ${this.filters.route}\n`;
    csvContent += `Trạng thái: ${this.filters.status}\n\n`;
    
    csvContent += 'Mã tuyến,Tên tuyến,Cự ly & Thời gian,Số chuyến đã chạy,Số vé đã bán,Lấp đầy TB (%),Doanh thu (VNĐ),Chi phí vận hành (VNĐ),Lợi nhuận tuyến (VNĐ),Doanh thu TB/chuyến (VNĐ),Lợi nhuận TB/chuyến (VNĐ),Trạng thái\n';

    this.filteredSummaries.forEach(item => {
      csvContent += `"${item.maTuyen}","${item.tuyen}","${item.khoangCachThoiGian}",${item.slChuyenChay},${item.slVeDaBan},${item.tyLeLapDay}%,${item.tongDoanhThu},${item.tongChiPhiVanHanh},${item.loiNhuanTuyen},${item.doanhThuTrungBinhChuyen},${item.loiNhuanTrungBinhChuyen},"${item.trangThai}"\n`;
    });

    // Summary Row
    csvContent += `\n"TỔNG CỘNG",,${this.totals.slChuyenChay},${this.totals.slVeDaBan},${this.totals.tyLeLapDayTrungBinh}%,${this.totals.tongDoanhThu},${this.totals.tongChiPhiVanHanh},${this.totals.loiNhuanTuyen},${this.totals.doanhThuTrungBinhChuyen},${this.totals.loiNhuanTrungBinhChuyen},\n`;

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
