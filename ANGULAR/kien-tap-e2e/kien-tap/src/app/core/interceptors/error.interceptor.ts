import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthModalService } from '../../featured/customer/auth/auth-modal.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const authModalService = inject(AuthModalService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // If it's a customer API and returns 401, the session might be expired
        if (req.url.includes('/customer/')) {
          console.warn('Customer session expired or unauthorized. Logging out...');
          authService.logout();
          authModalService.openLoginModal();
          router.navigate(['/home']);
        }
      }
      return throwError(() => error);
    })
  );
};
