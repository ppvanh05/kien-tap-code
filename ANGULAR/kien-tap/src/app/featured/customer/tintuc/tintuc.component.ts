import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { CustomerTinTucService } from '../../../core/services/customer-tin-tuc.service';

@Component({
  selector: 'app-tintuc',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './tintuc.component.html',
  styleUrl: './tintuc.component.css'
})
export class TintucComponent implements OnInit, AfterViewInit {
  @ViewChild('latestNewsSection') latestNewsSection!: ElementRef;

  categories = ['THÔNG BÁO', 'SỰ KIỆN', 'KHUYẾN MÃI', 'TIN NHÀ XE', 'CẨM NANG DI CHUYỂN', 'TUYỂN DỤNG'];
  activeCategory = '';
  searchQuery = '';

  featuredNews: any = null;
  latestNews: any[] = [];
  subFeaturedNews: any[] = [];
  allNews: any[] = [];

  pages: any[] = [1];
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  private isBrowser: boolean;

  constructor(
    private newsService: CustomerTinTucService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.loadNews();
    }
  }

  ngAfterViewInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'latest-news') {
        // Scroll to the latest news section after the view has initialized and data is loaded
        // Use a timeout to ensure rendering is complete
        setTimeout(() => {
          if (this.latestNewsSection) {
            this.latestNewsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500); // Adjust timeout as needed
      }
    });
  }

  loadNews() {
    // Reset data before fetching to avoid stale data
    if (this.currentPage === 1) {
      this.featuredNews = null;
      this.latestNews = [];
      this.subFeaturedNews = [];
      this.allNews = [];
    }

    const loai = this.activeCategory ? this.mapCategory(this.activeCategory) : '';
    this.newsService.getPublishedNews({
      page: this.currentPage,
      limit: this.pageSize,
      loai: loai,
      search: this.searchQuery
    }).subscribe({
      next: (response) => {
        const items = response.items || [];
        const mappedItems = items.map((item: any) => this.mapNewsItem(item));

        if (this.currentPage === 1) {
          if (!this.activeCategory && !this.searchQuery) {
            // TRANG TỔNG: Chia layout Featured, Latest, Sub, All
            this.featuredNews = response.featuredNews ? this.mapNewsItem(response.featuredNews) : null;
            this.latestNews = mappedItems.slice(0, 3);
            this.subFeaturedNews = mappedItems.slice(3, 5);
            
            // "Tất cả tin tức" lấy toàn bộ các tin tức để đảm bảo mục này luôn hiển thị
            this.allNews = mappedItems;
          } else {
            // TRANG FILTER (Theo loại hoặc Search): Hiện tất cả vào grid All News, ẩn các mục đặc biệt
            this.featuredNews = null;
            this.latestNews = [];
            this.subFeaturedNews = [];
            this.allNews = mappedItems;
          }
        } else {
          // Trang 2 trở đi: Luôn hiện vào grid All News
          this.allNews = mappedItems;
        }

        this.totalPages = response.meta?.totalPages || 1;
        this.generatePagination(this.currentPage, this.totalPages);
        
        // Cần detectChanges để đảm bảo UI cập nhật ngay lập tức sau khi có dữ liệu
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching news:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onCategoryChange(cat: string, searchInput?: HTMLInputElement) {
    // Trim để đảm bảo không bị lệch ký tự trắng
    const selectedCat = cat.trim();
    
    // Nếu click vào tab đang chọn thì reset về trang tổng (Toggle)
    if (this.activeCategory === selectedCat) {
      this.activeCategory = '';
    } else {
      this.activeCategory = selectedCat;
    }

    // Luôn reset search khi đổi tab để tránh việc search cũ làm lọc mất kết quả của tab mới
    this.searchQuery = '';
    if (searchInput) {
      searchInput.value = '';
    }

    this.currentPage = 1;
    this.loadNews();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery = value;
    this.currentPage = 1;
    this.loadNews();
  }

  onPageChange(page: any) {
    if (page === '...') return;
    const targetPage = Number(page);
    if (targetPage >= 1 && targetPage <= this.totalPages) {
      this.currentPage = targetPage;
      this.loadNews();
    }
  }

  mapCategory(cat: string): string {
    switch (cat) {
      case 'THÔNG BÁO': return 'ThongBao';
      case 'SỰ KIỆN': return 'SuKien';
      case 'KHUYẾN MÃI': return 'KhuyenMai';
      case 'TIN NHÀ XE': return 'TinTucChung';
      case 'CẨM NANG DI CHUYỂN': return 'HuongDan';
      case 'TUYỂN DỤNG': return 'TuyenDung';
      default: return '';
    }
  }

  mapNewsItem(item: any) {
    if (!item) return null;
    return {
      maTinTuc: item.MaTinTuc,
      title: item.TieuDe,
      date: this.formatDate(item.NgayDang),
      description: item.MoTaNgan || '',
      image: item.AnhBia || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
      tag: this.getCategoryLabel(item.LoaiTinTuc) || 'MỚI NHẤT',
      category: this.getCategoryLabel(item.LoaiTinTuc)
    };
  }

  getCategoryLabel(type: string): string {
    switch (type) {
      case 'ThongBao': return 'THÔNG BÁO';
      case 'SuKien': return 'SỰ KIỆN';
      case 'KhuyenMai': return 'KHUYẾN MÃI';
      case 'TinTucChung': return 'TIN NHÀ XE';
      case 'HuongDan': return 'CẨM NANG DI CHUYỂN';
      case 'TuyenDung': return 'TUYỂN DỤNG';
      default: return 'TIN NHÀ XE';
    }
  }

  formatDate(dateStr: any): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  generatePagination(current: number, total: number) {
    const pages: any[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    this.pages = pages;
  }
}

