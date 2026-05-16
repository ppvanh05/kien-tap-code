import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../bo-cuc/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'trang-chu',
        loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent)
      },
      {
        path: 'quan-ly-ve',
        children: [
          { path: 'dat-ve-moi', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) },
          { path: 'danh-sach-ve', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) },
          { path: 'hoan-tien', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) }
        ]
      },
      {
        path: 'quan-ly-dieu-hanh',
        children: [
          { path: 'quan-ly-tuyen-xe', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) },
          { path: 'quan-ly-lich-trinh', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) },
          { path: 'quan-ly-phuong-tien', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) },
          { path: 'quan-ly-tai-xe-phu-xe', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) },
          { path: 'quan-ly-diem-don-tra-dung', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) }
        ]
      },
      { path: 'quan-ly-tin-tuc', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) },
      { path: 'quan-ly-khach-hang', loadComponent: () => import('../QuanLyTaiKhoanKhachHang/quan-ly-tai-khoan-khach-hang.component').then(m => m.QuanLyTaiKhoanKhachHangComponent) },
      { path: 'quan-ly-nhan-vien', loadComponent: () => import('../QuanLyTaiKhoanNhanVien/quan-ly-tai-khoan-nhan-vien.component').then(m => m.QuanLyTaiKhoanNhanVienComponent) },
      { path: 'quan-ly-chinh-sach', loadComponent: () => import('../QuanLyChinhSach/quan-ly-chinh-sach.component').then(m => m.QuanLyChinhSachComponent) },
      { path: '', redirectTo: 'trang-chu', pathMatch: 'full' }
    ]
  }
];
