import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  showCopyToast = false;

  async share(event: Event) {
    event.preventDefault();
    
    const shareData = {
      title: 'TXP - Tân Xuân Phúc',
      text: 'Đặt vé xe khách Tân Xuân Phúc - Chất lượng, an toàn, tin cậy.',
      url: window.location.href
    };

    try {
      // 1. Thử dùng Web Share API (cho điện thoại iPhone/Android)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // 2. Fallback: Copy link cho máy tính
        await navigator.clipboard.writeText(window.location.href);
        this.showToast();
      }
    } catch (err) {
      // Nếu user cancel hoặc có lỗi, thử copy link
      if ((err as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        this.showToast();
      }
    }
  }

  private showToast() {
    this.showCopyToast = true;
    setTimeout(() => {
      this.showCopyToast = false;
    }, 3000);
  }
}
