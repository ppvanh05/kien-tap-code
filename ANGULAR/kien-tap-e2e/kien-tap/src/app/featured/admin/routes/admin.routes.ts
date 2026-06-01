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
          { path: 'dat-ve-moi', data: { requiredPermission: 'ticket' }, loadComponent: () => import('../QuanLyVe/DatVeMoi/tim-kiem-chuyen-xe1/tim-kiem-chuyen-xe').then(m => m.TimKiemChuyenXe) },
          { path: 'dat-ve-moi/thong-tin-don-hang', data: { requiredPermission: 'ticket' }, loadComponent: () => import('../QuanLyVe/DatVeMoi/thong-tin-don-hang1/thong-tin-don-hang').then(m => m.ThongTinDonHang) },
          { path: 'dat-ve-moi/thanh-toan', data: { requiredPermission: 'ticket' }, loadComponent: () => import('../QuanLyVe/DatVeMoi/thanh-toan1/thanh-toan').then(m => m.ThanhToan) },
          { path: 'danh-sach-ve', data: { requiredPermission: 'ticket' }, loadComponent: () => import('../QuanLyVe/DanhSachVe/danh-sach-ve.component').then(m => m.DanhSachVeComponent) },
          { path: 'hoan-tien', data: { requiredPermission: 'ticket' }, loadComponent: () => import('../trang-chu/trang-chu.component').then(m => m.TrangChuComponent) }
        ]
      },
      {
        path: 'quan-ly-dieu-hanh',
        children: [
          { 
            path: 'quan-ly-tuyen-xe', 
            data: { requiredPermission: 'dispatch' },
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyTuyenXe/quan-ly-tuyen-xe.component').then(m => m.QuanLyTuyenXeComponent) 
          },
          { 
            path: 'quan-ly-lich-trinh', 
            data: { requiredPermission: 'dispatch' },
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyLichTrinh/quan-ly-lich-trinh.component').then(m => m.QuanLyLichTrinhComponent) 
          },
          { 
            path: 'quan-ly-phuong-tien', 
            data: { requiredPermission: 'dispatch' },
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyPhuongTien/quan-ly-phuong-tien.component').then(m => m.QuanLyPhuongTienComponent) 
          },
          { 
            path: 'quan-ly-tai-xe-phu-xe', 
            data: { requiredPermission: 'dispatch' },
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyTaiXePhuXe/quan-ly-tai-xe.component').then(m => m.QuanLyTaiXeComponent) 
          },
          { 
            path: 'quan-ly-diem-don-tra-dung', 
            data: { requiredPermission: 'dispatch' },
            loadComponent: () => import('../QuanLyDieuHanh/QuanLyDiemDonTraDung/quan-ly-diem-don-tra-dung.component').then(m => m.QuanLyDiemDonTraDungComponent) 
          }
        ]
      },
       { path: 'quan-ly-tin-tuc', data: { requiredPermission: 'news' }, loadComponent: () => import('../QuanLyTinTuc/quan-ly-tin-tuc.component').then(m => m.QuanLyTinTucComponent) },
      { path: 'quan-ly-khach-hang', data: { requiredPermission: 'customer' }, loadComponent: () => import('../QuanLyTaiKhoanKhachHang/quan-ly-tai-khoan-khach-hang.component').then(m => m.QuanLyTaiKhoanKhachHangComponent) },
      { path: 'quan-ly-nhan-vien', data: { requiredPermission: 'employee' }, loadComponent: () => import('../QuanLyTaiKhoanNhanVien/quan-ly-tai-khoan-nhan-vien.component').then(m => m.QuanLyTaiKhoanNhanVienComponent) },
      { path: 'quan-ly-chinh-sach', data: { requiredPermission: 'policy' }, loadComponent: () => import('../QuanLyChinhSach/quan-ly-chinh-sach.component').then(m => m.QuanLyChinhSachComponent) },
      { path: 'quan-ly-nhat-ky', data: { requiredPermission: 'log' }, loadComponent: () => import('../QuanLyNhatKy/quan-ly-nhat-ky.component').then(m => m.QuanLyNhatKyComponent) },
      { path: 'quan-ly-tu-khoa-cam', data: { requiredPermission: 'review' }, loadComponent: () => import('../QuanLyTuKhoaCam/quan-ly-tu-khoa-cam.component').then(m => m.QuanLyTuKhoaCamComponent) },
      {
        path: 'bao-cao',
        children: [
          { path: '', redirectTo: 'bao-cao-chi-tiet', pathMatch: 'full' },
          { path: 'bao-cao-chi-tiet', data: { requiredPermission: 'report' }, loadComponent: () => import('../BaoCao/BaoCaoChiTiet/bao-cao-chi-tiet.component').then(m => m.BaoCaoChiTietComponent) },
          { path: 'bao-cao-tong-hop-theo-tuyen', data: { requiredPermission: 'report' }, loadComponent: () => import('../BaoCao/BaoCaoTongHopTheoTuyen/bao-cao-tong-hop-theo-tuyen.component').then(m => m.BaoCaoTongHopTheoTuyenComponent) },
          { path: 'bao-cao-tai-xe-phu-xe', data: { requiredPermission: 'report' }, loadComponent: () => import('../BaoCao/BaoCaoTaiXePhuXe/bao-cao-tai-xe-phu-xe.component').then(m => m.BaoCaoTaiXePhuXeComponent) },
          { path: 'bao-cao-khach-hang', data: { requiredPermission: 'report' }, loadComponent: () => import('../BaoCao/BaoCaoKhachHang/bao-cao-khach-hang.component').then(m => m.BaoCaoKhachHangComponent) },
          { path: 'bao-cao-hoan-huy', data: { requiredPermission: 'report' }, loadComponent: () => import('../BaoCao/BaoCaoHoanHuy/bao-cao-hoan-huy.component').then(m => m.BaoCaoHoanHuyComponent) }
        ]
      },
      { path: '', redirectTo: 'trang-chu', pathMatch: 'full' }
    ]
  }
];
