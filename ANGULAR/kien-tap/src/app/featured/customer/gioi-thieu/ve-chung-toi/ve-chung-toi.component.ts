import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ve-chung-toi',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
