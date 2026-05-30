import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthModalService } from '../../featured/customer/auth/auth-modal.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router,
    private authModalService: AuthModalService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      map(isLoggedIn => {
        if (!isLoggedIn) {
          // Open login modal
          this.authModalService.openLoginModal();
          return false;
        }
        return true;
      })
    );
  }
}
