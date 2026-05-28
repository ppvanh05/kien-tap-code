import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { CustomerTinTucService } from '../../../../core/services/customer-tin-tuc.service';

@Component({
  selector: 'app-tintuc-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './tintuc-detail.component.html',
  styleUrl: './tintuc-detail.component.css'
})
export class TintucDetailComponent implements OnInit {
  newsDetail: any = null;
  otherNews: any[] = [];
  relatedNews: any[] = [];
  private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private newsService: CustomerTinTucService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) {
      return;
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchNewsDetail(id);
      }
    });
  }

  fetchNewsDetail(id: string) {
    this.newsService.getNewsById(id).subscribe({
      next: (response: any) => {
        if (response) {
          const rawNews = response.news;
          this.newsDetail = {
            category: this.getCategoryLabel(rawNews.LoaiTinTuc),
            title: rawNews.TieuDe,
            date: this.formatDate(rawNews.NgayDang),
            summary: rawNews.MoTaNgan || '',
            content: rawNews.NoiDungChiTiet || '',
            image: rawNews.AnhBia || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'
          };

          this.otherNews = (response.latestNews || []).map((item: any) => ({
            id: item.MaTinTuc,
            title: item.TieuDe,
            date: this.formatDateLabel(item.NgayDang)
          }));

          this.relatedNews = (response.relatedNews || []).map((item: any) => ({
            maTinTuc: item.MaTinTuc,
            category: this.getCategoryLabel(item.LoaiTinTuc),
            title: item.TieuDe,
            summary: item.MoTaNgan || '',
            date: this.formatDateLabel(item.NgayDang),
            image: item.AnhBia || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'
          }));
        }
      },
      error: (err: any) => {
        console.error('Error fetching news detail:', err);
      }
    });
  }

  getCategoryLabel(type: string): string {
    switch (type) {
      case 'TinTuc': return 'TIN NHÀ XE';
      case 'KhuyenMai': return 'KHUYẾN MÃI';
      case 'HuongDan': return 'CẨM NANG DI CHUYỂN';
      case 'ThongBao': return 'THÔNG BÁO';
      case 'SuKien': return 'SỰ KIỆN';
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

  formatDateLabel(dateStr: any): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day} Tháng ${month}, ${year}`;
  }
}

