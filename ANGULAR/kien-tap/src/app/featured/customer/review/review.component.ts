import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { DanhGiaService } from '../../../core/services/danh-gia.service';

interface Review {
  id: string;
  author: string;
  avatar: string;
  date: string;
  rating: number;
  content: string;
  images?: string[];
  route: string;
  isVerified: boolean;
}

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css'
})
export class ReviewComponent implements OnInit {
  Math = Math;
  activeFilter = 'Tất cả';
  isLoggedIn = false;

  pages: (number | string)[] = [];
  currentPage = 1;
  totalPages = 1;

  summary: any = {
    averageOverall: 0,
    totalReviews: 0,
    criteriaAverage: {
      anToan: 0,
      sachSe: 0,
      thaiDoNhanVien: 0,
      dungGio: 0,
      thongTinDayDu: 0,
      tienNghi: 0
    },
    ratingCount: {
      five: 0,
      four: 0,
      three: 0,
      two: 0,
      one: 0
    },
    commentCount: 0,
    imageCount: 0
  };

  filters = [
    { label: 'Tất cả', count: 0 },
    { label: 'Có bình luận', count: 0 },
    { label: 'Có hình ảnh', count: 0 },
    { label: '5 Sao', count: 0 },
    { label: '4 Sao', count: 0 },
    { label: '3 Sao', count: 0 },
    { label: '2 Sao', count: 0 },
    { label: '1 Sao', count: 0 }
  ];

  stats: any[] = [];
  reviews: Review[] = [];

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private danhGiaService: DanhGiaService
  ) {
    this.authService.isLoggedIn$.subscribe(status => this.isLoggedIn = status);
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    let rating: number | undefined = undefined;
    let hasComment: boolean | undefined = undefined;
    let hasImage: boolean | undefined = undefined;

    if (this.activeFilter === 'Có bình luận') {
      hasComment = true;
    } else if (this.activeFilter === 'Có hình ảnh') {
      hasImage = true;
    } else if (this.activeFilter.includes('Sao')) {
      const starMatch = this.activeFilter.match(/\d/);
      if (starMatch) {
        rating = parseInt(starMatch[0], 10);
      }
    }

    this.danhGiaService.getReviews({
      page: this.currentPage,
      limit: 5,
      rating,
      hasComment,
      hasImage
    }).subscribe({
      next: (res) => {
        this.reviews = (res.items || []).map((item: any) => ({
          author: item.author,
          avatar: item.avatar,
          date: item.date,
          rating: item.rating,
          content: item.content,
          images: item.images || [],
          route: item.route,

          diemAnToan: item.diemAnToan,
          diemSachSe: item.diemSachSe,
          diemThaiDo: item.diemThaiDo,
          diemDungGio: item.diemDungGio,
          diemThongTin: item.diemThongTin,
          diemTienNghi: item.diemTienNghi,

          isVerified: true
        }));
        this.summary = res.summary;
        this.currentPage = res.meta.currentPage;
        this.totalPages = res.meta.totalPages;

        this.updateFiltersAndStats();
        this.generatePagination();
      },
      error: (err) => {
        console.error('Lỗi khi tải đánh giá:', err);
        this.toastService.show('Không thể tải danh sách đánh giá', 'error');
      }
    });
  }

  updateFiltersAndStats(): void {
    // Cập nhật số lượng của các bộ lọc
    this.filters = [
      { label: 'Tất cả', count: this.summary.totalReviews },
      { label: 'Có bình luận', count: this.summary.commentCount },
      { label: 'Có hình ảnh', count: this.summary.imageCount },
      { label: '5 Sao', count: this.summary.ratingCount.five },
      { label: '4 Sao', count: this.summary.ratingCount.four },
      { label: '3 Sao', count: this.summary.ratingCount.three },
      { label: '2 Sao', count: this.summary.ratingCount.two },
      { label: '1 Sao', count: this.summary.ratingCount.one }
    ];

    // Cập nhật 6 tiêu chí
    const c = this.summary.criteriaAverage;
    this.stats = [
      { label: 'An toàn', score: c.anToan, percentage: Math.round(c.anToan * 20) },
      { label: 'Sạch sẽ', score: c.sachSe, percentage: Math.round(c.sachSe * 20) },
      { label: 'Nhân viên', score: c.thaiDoNhanVien, percentage: Math.round(c.thaiDoNhanVien * 20) },
      { label: 'Đúng giờ', score: c.dungGio, percentage: Math.round(c.dungGio * 20) },
      { label: 'Thông tin', score: c.thongTinDayDu, percentage: Math.round(c.thongTinDayDu * 20) },
      { label: 'Tiện nghi', score: c.tienNghi, percentage: Math.round(c.tienNghi * 20) }
    ];
  }

  selectFilter(filterLabel: string): void {
    this.activeFilter = filterLabel;
    this.currentPage = 1;
    this.loadReviews();
  }

  changePage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadReviews();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadReviews();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadReviews();
    }
  }

  generatePagination(): void {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 1) {
      this.pages = [];
      return;
    }

    const pagesArr: (number | string)[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pagesArr.push(i);
      }
    } else {
      pagesArr.push(1);
      if (current > 3) {
        pagesArr.push('...');
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pagesArr.push(i);
      }

      if (current < total - 2) {
        pagesArr.push('...');
      }
      pagesArr.push(total);
    }

    this.pages = pagesArr;
  }

  // Tiện ích định dạng ngày tháng sang dd/MM/yyyy
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  }
}
