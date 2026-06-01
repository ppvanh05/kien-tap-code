import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuyenXeService } from '../../QuanLyDieuHanh/tuyen-xe.service';
import { PhuongTienService } from '../../QuanLyDieuHanh/phuong-tien.service';
import { TaiXeService } from '../../QuanLyDieuHanh/tai-xe.service'; // Import TaiXeService
import { BaoCaoService } from '../../../../core/services/bao-cao.service';

interface TripReportItem {
  maChuyen: string;
  tuyen: string;
  bienSoXe: string;
  loaiXe: string;
  ngayDi: string;
  gioDi: string;
  slDaBan: number;
  tongGhe: number;
  tyLeLapDay: number;
  doanhThuVe: number;
  chiPhiVanHanh: number;
  loiNhuan: number;
  trangThai: 'Còn chỗ' | 'Hết chỗ' | 'Đã khởi hành' | 'Hủy';
  
  // New fields for enhanced analysis
  taiXeChinh: string;
  phuXe: string;
  diemDanhGiaTrungBinh: number; // Average rating from customers for this trip
  soLuongDanhGiaTieuCuc: number; // Number of negative reviews
  tyLeDongGopDoanhThuTuyen: number; // Percentage contribution to route revenue

  // Detailed Expenses
  phiCauDuong: number;
  phiDau: number;
  phiRuaXe: number;
  phiAnUong: number;
  phiBenBai: number;
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
    fromDate: '2026-05-01',
    toDate: '2026-05-31',
    route: 'Tất cả',
    licensePlate: 'Tất cả',
    status: 'Tất cả'
  };

  isReportViewed = true;

  // Data lists
  allTrips: TripReportItem[] = [];
  filteredTrips: TripReportItem[] = [];
  
  // Lists for dropdown options
  routesList: string[] = [];
  vehiclesList: string[] = [];
  statusList = ['Còn chỗ', 'Hết chỗ', 'Đã khởi hành', 'Hủy'];

  // Modal controls
  showExpenseModal = false;
  selectedTrip: TripReportItem | null = null;

  // Pagination variables
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Stats summaries
  stats = {
    totalTrips: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0
  };

  constructor(
    private tuyenXeService: TuyenXeService,
    private phuongTienService: PhuongTienService,
    private taiXeService: TaiXeService, // Inject TaiXeService
    private baoCaoService: BaoCaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.routesList = this.tuyenXeService.getRoutesList();
    this.vehiclesList = this.phuongTienService.getVehicles().map(v => v.licensePlate);
    this.onViewReport();
  }

  onViewReport() {
    this.isReportViewed = true;
    this.baoCaoService.getBaoCaoChuyenXe(this.filters).subscribe({
      next: (data: any[]) => {
        this.filteredTrips = data as TripReportItem[];
        this.calculateStats();
        this.currentPage = 1;
        this.calculateTotalPages();
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        console.error('Error fetching chuyến xe report:', err);
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      }
    });
  }


  private calculateStats() {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalProfit = 0;
    let totalTrips = 0;

    this.filteredTrips.forEach(item => {
      totalRevenue += item.doanhThuVe;
      totalExpenses += item.chiPhiVanHanh;
      totalProfit += item.loiNhuan;
      totalTrips++;
    });

    this.stats = {
      totalTrips: totalTrips,
      totalRevenue: totalRevenue,
      totalExpenses: totalExpenses,
      totalProfit: totalProfit
    };
  }



  private calculateTotalPages() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredTrips.length / this.pageSize));
  }

  get paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTrips.slice(start, start + this.pageSize);
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
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
      route: 'Tất cả',
      licensePlate: 'Tất cả',
      status: 'Tất cả'
    };
    this.isReportViewed = true;
    this.onViewReport();
  }

  // Modal actions
  openExpenseDetail(trip: TripReportItem) {
    this.selectedTrip = trip;
    this.showExpenseModal = true;
  }

  closeExpenseDetail() {
    this.showExpenseModal = false;
    this.selectedTrip = null;
  }

  onExportExcel() {
    if (this.filteredTrips.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO THỐNG KÊ CHI TIẾT THEO CHUYẾN XE (TÂN XUÂN PHÚC)\n';
    csvContent += `Thời gian: Từ ${this.filters.fromDate} đến ${this.filters.toDate}\n`;
    csvContent += `Tuyến: ${this.filters.route}, Biển số xe: ${this.filters.licensePlate}, Trạng thái: ${this.filters.status}\n\n`;
    
    csvContent += 'Mã chuyến,Tuyến xe,Biển số xe,Loại xe,Ngày đi,Giờ đi,SL đã bán,Tổng ghế,Tỷ lệ lấp đầy (%),Doanh thu vé (VNĐ),Chi phí vận hành (VNĐ),Lợi nhuận (VNĐ),Trạng thái,Tài xế chính,Phụ xe,Điểm đánh giá TB,SL đánh giá tiêu cực,Tỷ lệ đóng góp DT tuyến (%)\n';

    this.filteredTrips.forEach(item => {
      csvContent += `"${item.maChuyen}","${item.tuyen}","${item.bienSoXe}","${item.loaiXe}","${item.ngayDi}","${item.gioDi}",${item.slDaBan},${item.tongGhe},${item.tyLeLapDay}%,${item.doanhThuVe},${item.chiPhiVanHanh},${item.loiNhuan},"${item.trangThai}","${item.taiXeChinh}","${item.phuXe}",${item.diemDanhGiaTrungBinh},${item.soLuongDanhGiaTieuCuc},${item.tyLeDongGopDoanhThuTuyen}\n`;
    });

    // Summary Row
    csvContent += `\n"TỔNG CỘNG",,,,,,,${this.stats.totalTrips},,"Tổng doanh thu",${this.stats.totalRevenue},"Tổng chi phí",${this.stats.totalExpenses},"Tổng lợi nhuận",${this.stats.totalProfit}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoChiTietChuyenXe_TXP_${this.filters.fromDate}_to_${this.filters.toDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
