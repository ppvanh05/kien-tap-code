import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ve-chung-toi',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterModule],
  templateUrl: './ve-chung-toi.component.html',
  styleUrl: './ve-chung-toi.component.css'
})
export class VeChungToiComponent {
  scrollToIntroduction() {
    const element = document.getElementById('introduction');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
