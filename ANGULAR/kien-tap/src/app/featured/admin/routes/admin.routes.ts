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
          { path: 'dat-ve-moi', loadComponent: () => import('../QuanLyVe/DatVeMoi/dat-ve-moi.component').then(m => m.DatVeMoiComponent) },
          { path: 'danh-sach-ve', loadComponent: () => import('../QuanLyVe/DanhSachVe/danh-sach-ve.component').then(m => m.DanhSachVeComponent) },
          { path: 'hoan-tien', loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) }
        ]
      },
      {
        path: 'quan-ly-dieu-hanh',
        children: [
          { 
            path: 'quan-ly-tuyen-xe', 
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyTuyenXe/quan-ly-tuyen-xe.component').then(m => m.QuanLyTuyenXeComponent) 
          },
          { 
            path: 'quan-ly-lich-trinh', 
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyLichTrinh/quan-ly-lich-trinh.component').then(m => m.QuanLyLichTrinhComponent) 
          },
          { 
            path: 'quan-ly-phuong-tien', 
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyPhuongTien/quan-ly-phuong-tien.component').then(m => m.QuanLyPhuongTienComponent) 
          },
          { 
            path: 'quan-ly-tai-xe-phu-xe', 
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyTaiXePhuXe/quan-ly-tai-xe.component').then(m => m.QuanLyTaiXeComponent) 
          },
          { 
            path: 'quan-ly-diem-don-tra-dung', 
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyDiemDonTraDung/quan-ly-diem-don-tra-dung.component').then(m => m.QuanLyDiemDonTraDungComponent) 
          }
        ]
      },
       { path: 'quan-ly-tin-tuc', loadComponent: () => import('../QuanLyTinTuc/quan-ly-tin-tuc.component').then(m => m.QuanLyTinTucComponent) },
      { path: 'quan-ly-khach-hang', loadComponent: () => import('../QuanLyTaiKhoanKhachHang/quan-ly-tai-khoan-khach-hang.component').then(m => m.QuanLyTaiKhoanKhachHangComponent) },
      { path: 'quan-ly-nhan-vien', loadComponent: () => import('../QuanLyTaiKhoanNhanVien/quan-ly-tai-khoan-nhan-vien.component').then(m => m.QuanLyTaiKhoanNhanVienComponent) },
      { path: 'quan-ly-chinh-sach', loadComponent: () => import('../QuanLyChinhSach/quan-ly-chinh-sach.component').then(m => m.QuanLyChinhSachComponent) },
      { path: 'quan-ly-nhat-ky', loadComponent: () => import('../QuanLyNhatKy/quan-ly-nhat-ky.component').then(m => m.QuanLyNhatKyComponent) },
      {
        path: 'bao-cao',
        children: [
          { path: '', redirectTo: 'bao-cao-chi-tiet', pathMatch: 'full' },
          { path: 'bao-cao-chi-tiet', loadComponent: () => import('../BaoCao/BaoCaoChiTiet/bao-cao-chi-tiet.component').then(m => m.BaoCaoChiTietComponent) },
          { path: 'bao-cao-tong-hop-theo-tuyen', loadComponent: () => import('../BaoCao/BaoCaoTongHopTheoTuyen/bao-cao-tong-hop-theo-tuyen.component').then(m => m.BaoCaoTongHopTheoTuyenComponent) },
          { path: 'bao-cao-tai-xe-phu-xe', loadComponent: () => import('../BaoCao/BaoCaoTaiXePhuXe/bao-cao-tai-xe-phu-xe.component').then(m => m.BaoCaoTaiXePhuXeComponent) },
          { path: 'bao-cao-khach-hang', loadComponent: () => import('../BaoCao/BaoCaoKhachHang/bao-cao-khach-hang.component').then(m => m.BaoCaoKhachHangComponent) },
          { path: 'bao-cao-hoan-huy', loadComponent: () => import('../BaoCao/BaoCaoHoanHuy/bao-cao-hoan-huy.component').then(m => m.BaoCaoHoanHuyComponent) }
        ]
      },
      { path: '', redirectTo: 'trang-chu', pathMatch: 'full' }
    ]
  }
];
