import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';

@Component({
  selector: 'app-tintuc',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './tintuc.component.html',
  styleUrl: './tintuc.component.css'
})
export class TintucComponent {
  categories = ['TIN NHÀ XE', 'KHUYẾN MÃI', 'CẨM NANG DI CHUYỂN'];
  activeCategory = 'TIN NHÀ XE';

  featuredNews = {
    title: 'Chào đón dòng xe Limousine THACO Mobihome 22 Phòng Premium mới nhất',
    date: '01/05/2026',
    description: 'Tân Xuân Phúc chính thức đưa vào vận hành dòng xe phòng nằm cao cấp với đầy đủ tiện nghi, hứa hẹn mang lại trải nghiệm hành trình tuyệt vời cho quý khách.',
    image: '/asset/images/customer/tintuc1.png',
    tag: 'MỚI NHẤT'
  };

  latestNews = [
    {
      title: 'Khuyến mãi đặt vé khứ hồi giảm 10%',
      category: 'KHUYẾN MÃI',
      date: '30/04/2026',
      image: '/asset/images/customer/km2.jpg'
    },
    {
      title: 'Hành trình xe qua Phù Cát - Đập Đá',
      category: 'HÀNH TRÌNH',
      date: '29/04/2026',
      image: '/asset/images/customer/banner.jpg'
    },
    {
      title: 'Tuyển dụng tài xế hạng E kinh nghiệm',
      category: 'THÔNG BÁO',
      date: '27/04/2026',
      image: '/asset/images/customer/nhaxe1.png'
    }
  ];

  subFeaturedNews = [
    {
      title: 'Cập nhật lịch trình 6 chuyến cố định mỗi ngày',
      date: '28/04/2026',
      image: '/asset/images/customer/tintuc2.jpg'
    },
    {
      title: 'Tân Xuân Phúc đón trả khách tại Bến xe Bến Cát',
      date: '25/04/2026',
      image: '/asset/images/customer/benxebencat.jpg'
    }
  ];

  allNews = [
    {
      title: 'Hướng dẫn chi tiết đặt vé online Tân Xuân Phúc',
      date: '01/05/2026',
      description: 'Chỉ với vài thao tác đơn giản trên website hoặc ứng dụng, bạn đã có thể sở hữu tấm vé cho hành trình của mình...',
      image: '/asset/images/customer/tintuc3.png'
    },
    {
      title: 'Quy định hành lý đi xe phòng Limousine',
      date: '01/05/2026',
      description: 'Mỗi hành khách được mang theo tối đa bao nhiêu kg hành lý và những vật dụng nào bị cấm mang lên xe...',
      image: '/asset/images/customer/tintuc4.png'
    }
  ];

  pages = [1, 2, 3, '...', 90, 91];
  currentPage = 1;
}
