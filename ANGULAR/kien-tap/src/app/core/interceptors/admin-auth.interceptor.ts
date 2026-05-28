import { HttpInterceptorFn } from '@angular/common/http';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  // Check if we are running in a browser environment to safely access localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('admin_token');
    
    // Only attach the token to API requests directed to our backend
    if (token && req.url.startsWith('http://localhost:3000')) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(cloned);
    }
  }
  
  return next(req);
};
