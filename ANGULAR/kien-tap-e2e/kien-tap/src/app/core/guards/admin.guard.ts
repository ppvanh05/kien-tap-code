import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AdminAuthService } from '../services/admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AdminAuthService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAccess(route, state);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAccess(route, state);
  }

  private checkAccess(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      // Only redirect if we are running in the browser
      if (isPlatformBrowser(this.platformId)) {
        this.router.navigate(['/admin-login'], { queryParams: { returnUrl: state.url } });
      }
      return false;
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return false;
    }

    // Check permissions if route requires it
    const requiredPermission = route.data['requiredPermission'] as string;
    if (requiredPermission) {
      const basePermission = requiredPermission.split('.')[0];
      const hasPermission = currentUser.Quyen?.includes(requiredPermission) || currentUser.Quyen?.includes(basePermission);
      if (!hasPermission) {
        if (isPlatformBrowser(this.platformId)) {
          alert('Bạn không có quyền truy cập vào chức năng này!');
          this.router.navigate(['/admin/trang-chu']);
        }
        return false;
      }
    }

    return true;
  }
}
