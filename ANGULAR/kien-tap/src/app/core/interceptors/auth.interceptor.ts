import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
               || localStorage.getItem('auth_token');

    // Đính kèm token cho tất cả API customer cần xác thực
    const needsAuth =
      req.url.includes('/customer/profile') ||
      req.url.includes('/customer/tra-cuu-ve');

    if (token && needsAuth) {
      const clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next(clonedReq);
    }
  }
  return next(req);
};