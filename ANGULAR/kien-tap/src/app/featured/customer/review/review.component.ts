import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

interface Review {
  id: number;
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
export class ReviewComponent {
  showReviewModal = false;
  activeFilter = 'Tất cả';
  isLoggedIn = false;

  pages = [1, 2, 3, '...', 10];
  currentPage = 1;

  constructor(private authService: AuthService, private toastService: ToastService) {
    this.authService.isLoggedIn$.subscribe(status => this.isLoggedIn = status);
  }

  filters = [
    { label: 'Tất cả', count: 498 },
    { label: 'Có bình luận', count: 181 },
    { label: 'Có hình ảnh', count: 12 },
    { label: '5 Sao ★', count: 477 },
    { label: '4 Sao ★', count: 15 },
    { label: '3 Sao ★', count: 4 },
    { label: '2 Sao ★', count: 1 },
    { label: '1 Sao ★', count: 1 }
  ];

  stats = [
    { label: 'Sạch sẽ', score: 4.0, percentage: 80 },
    { label: 'An toàn', score: 4.5, percentage: 90 },
    { label: 'Nhân viên', score: 3.8, percentage: 76 },
    { label: 'Tiện ích', score: 4.2, percentage: 84 },
    { label: 'Địa điểm', score: 3.5, percentage: 70 }
  ];

  reviews: Review[] = [
    {
      id: 1,
      author: 'Evgeny Tyurin',
      avatar: 'asset/images/customer/avatar_placeholder.png',
      date: '18/05/2026',
      rating: 5.0,
      isVerified: true,
      content: 'Xe rất sạch sẽ, đúng giờ và nhân viên phục vụ cực kỳ chu đáo. Tôi rất hài lòng với chuyến đi từ Vạn Giã vào Sài Gòn lần này. Chắc chắn sẽ quay lại ủng hộ nhà xe TXP.',
      images: ['asset/images/customer/tintuc1.png', 'asset/images/customer/tintuc2.jpg'],
      route: 'Vạn Giã - Nha Trang - Sài Gòn'
    },
    {
      id: 2,
      author: 'Ngọc Bích',
      avatar: 'asset/images/customer/avatar_placeholder.png',
      date: '15/05/2026',
      rating: 4.0,
      isVerified: true,
      content: 'Dịch vụ ổn, xe chạy êm. Tuy nhiên bến xe hơi đông nên lúc lên xe hơi lộn xộn một chút. Hy vọng nhà xe có thêm nhiều chuyến vào khung giờ sáng hơn.',
      route: 'Sài Gòn - Phan Thiết'
    }
  ];

  // Modal Rating Form
  ratingCriteria = [
    { label: 'Sạch sẽ & Thoải mái', score: 0 },
    { label: 'An toàn & Đúng giờ', score: 0 },
    { label: 'Thái độ nhân viên', score: 0 },
    { label: 'Tiện nghi trên xe', score: 0 },
    { label: 'Chất lượng dịch vụ chung', score: 0 }
  ];

  setRating(criteriaIndex: number, star: number) {
    this.ratingCriteria[criteriaIndex].score = star;
  }

  openReviewModal() {
    if (this.isLoggedIn) {
      this.showReviewModal = true;
    } else {
      this.toastService.show('Vui lòng đăng nhập để đánh giá chuyến đi của bạn', 'warning');
    }
  }

  closeModal() {
    this.showReviewModal = false;
    // Reset form
    this.ratingCriteria.forEach(c => c.score = 0);
  }
}
