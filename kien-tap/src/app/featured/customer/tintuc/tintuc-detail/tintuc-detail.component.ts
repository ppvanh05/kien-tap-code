import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-tintuc-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './tintuc-detail.component.html',
  styleUrl: './tintuc-detail.component.css'
})
export class TintucDetailComponent {
  newsDetail = {
    category: 'TIN NHÀ XE',
    title: 'Tân Xuân Phúc Chính Thức Vận Hành Dòng Xe THACO Mobihome 22 Phòng Premium Cao Cấp',
    date: '15/05/2026',
    summary: 'Đánh dấu bước chuyển mình mạnh mẽ, Tân Xuân Phúc tự hào đưa vào phục vụ hành khách dàn chuyên cơ mặt đất THACO Mobihome 22 Phòng Premium thế hệ mới trên tuyến Bình Định - Phú Yên đi TP.HCM và Bình Dương.',
    image: 'asset/images/customer/tintuc1.png'
  };

  otherNews = [
    {
      id: 1,
      title: 'Khai trương tuyến mới Sài Gòn - Đà Lạt với dòng xe Limousine VIP',
      date: '10 Tháng 5, 2026'
    },
    {
      id: 2,
      title: 'Hướng dẫn đặt vé và thanh toán trực tuyến qua ứng dụng TXP',
      date: '05 Tháng 5, 2026'
    },
    {
      id: 3,
      title: 'Ưu đãi 20% cho khách hàng thân thiết trong mùa hè này',
      date: '01 Tháng 5, 2026'
    }
  ];

  relatedNews = [
    {
      category: 'DỊCH VỤ',
      title: 'Nâng cấp hệ thống phòng chờ hạng thương gia tại các đầu bến chính',
      summary: 'Nhằm mang lại sự tiện nghi tối đa, TXP chính thức đưa vào hoạt động hệ thống phòng chờ...',
      date: '08 Tháng 5, 2026',
      image: 'asset/images/customer/tintuc2.jpg'
    },
    {
      category: 'TUYỂN DỤNG',
      title: 'TXP tìm kiếm đồng đội: Tuyển dụng 20 nhân viên điều hành tại TP.HCM',
      summary: 'Gia nhập đội ngũ vận tải hàng đầu và cùng chúng tôi kiến tạo những hành trình hạnh phúc...',
      date: '03 Tháng 5, 2026',
      image: 'asset/images/customer/benxebencat.jpg'
    },
    {
      category: 'CÔNG NGHỆ',
      title: 'Chuyển đổi số trong vận tải: Cách TXP tối ưu hóa lịch trình bằng AI',
      summary: 'Tìm hiểu về hệ thống quản lý thông minh giúp giảm thiểu thời gian chờ và tiết kiệm nhiên liệu...',
      date: '28 Tháng 4, 2026',
      image: 'asset/images/customer/tintuc3.png'
    }
  ];
}
