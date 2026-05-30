import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ToastComponent } from './shared/toast/toast.component';
import { HeaderComponent } from './featured/customer/layout/header/header.component';
import { FooterComponent } from './featured/customer/layout/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('kien-tap');
  showCustomerLayout = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateLayout(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateLayout(event.urlAfterRedirects);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
  }

  private updateLayout(url: string): void {
    const path = url.split('?')[0];
    this.showCustomerLayout = !(
      path.startsWith('/admin') ||
      path === '/login' ||
      path === '/admin-login'
    );
  }
}
