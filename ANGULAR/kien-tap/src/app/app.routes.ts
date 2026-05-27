import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./featured/admin/routes/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'home',
    loadComponent: () => import('./featured/customer/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'tim-kiem-chuyen',
    loadComponent: () => import('./featured/customer/tim-kiem-chuyen-xe/tim-kiem-chuyen-xe').then(m => m.TimKiemChuyenXe)
  },
  {
    path: 'login',
    loadComponent: () => import('./featured/customer/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'tin-tuc',
    loadComponent: () => import('./featured/customer/tintuc/tintuc.component').then(m => m.TintucComponent)
  },
  {
    path: 'tin-tuc/chi-tiet',
    loadComponent: () => import('./featured/customer/tintuc/tintuc-detail/tintuc-detail.component').then(m => m.TintucDetailComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./featured/customer/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'gioi-thieu/ve-chung-toi',
    loadComponent: () => import('./featured/customer/gioi-thieu/ve-chung-toi/ve-chung-toi.component').then(m => m.VeChungToiComponent)
  },
  {
    path: 'gioi-thieu/chinh-sach',
    loadComponent: () => import('./featured/customer/gioi-thieu/chinh-sach/chinh-sach.component').then(m => m.ChinhSachComponent)
  },
  {
    path: 'thong-tin-don-hang',
    loadComponent: () => import('./featured/customer/thong-tin-don-hang/thong-tin-don-hang').then(m => m.ThongTinDonHang)
  },
  {
    path: 'thanh-toan',
    loadComponent: () => import('./featured/customer/thanh-toan/thanh-toan').then(m => m.ThanhToan)
  },
  {
    path: 'tra-cuu-ve',
    loadComponent: () => import('./featured/customer/tra-cuu-ve/tra-cuu-ve').then(m => m.TraCuuVeComponent)
  },
  {
    path: 'danh-gia',
    loadComponent: () => import('./featured/customer/review/review.component').then(m => m.ReviewComponent)
  },
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  }
];
