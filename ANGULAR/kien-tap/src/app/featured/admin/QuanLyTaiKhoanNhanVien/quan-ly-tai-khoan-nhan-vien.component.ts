import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- MODELS ---
export enum LoaiTaiKhoan {
  BanVe = 'BanVe',
  DieuPhoi = 'DieuPhoi',
  BanQuanLy = 'BanQuanLy',
  QuanTriVien = 'QuanTriVien'
}

export enum TrangThaiTaiKhoan {
  HoatDong = 'HoatDong',
  VoHieuHoa = 'VoHieuHoa'
}

export interface QuyenHan {
  id: string;
  label: string;
}

export interface ModuleQuyen {
  tenModule: string;
  icon: string;
  role: LoaiTaiKhoan;
  danhSachQuyen: QuyenHan[];
}

export interface NhanVien {
  maNhanVien: string;
  loaiTaiKhoan: LoaiTaiKhoan;
  tenTruyCap: string;
  matKhau?: string;
  hoVaTenDem: string;
  ten: string;
  tenHienThi: string;
  gioiTinh: string;
  ngaySinh: Date | string;
  diaChi: string;
  soDienThoai: string;
  email: string;
  maVanPhong: string;
  anhDaiDien?: string;
  ghiChu?: string;
  trangThai: TrangThaiTaiKhoan;
  danhSachQuyen: string[]; 
}

// --- CONSTANTS: CHI QUYỀN THEO CỤC (MODULES) ---
const MODUL_QUYEN_HE_THONG: ModuleQuyen[] = [
  {
    tenModule: 'Nghiệp vụ Bán vé',
    icon: 'confirmation_number',
    role: LoaiTaiKhoan.BanVe,
    danhSachQuyen: [
      { id: 'BV_BAN_VE', label: 'Bán vé mới' },
      { id: 'BV_DOI_TRA', label: 'Đổi/Trả vé' },
      { id: 'BV_TRA_CUU', label: 'Tra cứu lịch sử vé' },
      { id: 'BV_HO_TRO', label: 'Hỗ trợ khách hàng' }
    ]
  },
  {
    tenModule: 'Điều phối vận hành',
    icon: 'local_shipping',
    role: LoaiTaiKhoan.DieuPhoi,
    danhSachQuyen: [
      { id: 'DP_TUYEN_XE', label: 'Quản lý tuyến xe' },
      { id: 'DP_LICH_TRINH', label: 'Quản lý lịch trình' },
      { id: 'DP_PHUONG_TIEN', label: 'Quản lý phương tiện' },
      { id: 'DP_PHAN_CONG', label: 'Phân công tài/phụ xe' }
    ]
  },
  {
    tenModule: 'Quản lý & Thống kê',
    icon: 'analytics',
    role: LoaiTaiKhoan.BanQuanLy,
    danhSachQuyen: [
      { id: 'BQL_DOANH_THU', label: 'Xem báo cáo doanh thu' },
      { id: 'BQL_THONG_KE', label: 'Thống kê hiệu suất' },
      { id: 'BQL_CHINH_SACH', label: 'Quản lý chính sách giá/hủy' },
      { id: 'BQL_GIAM_SAT', label: 'Theo dõi hoạt động kinh doanh' }
    ]
  },
  {
    tenModule: 'Quản trị hệ thống',
    icon: 'settings_suggest',
    role: LoaiTaiKhoan.QuanTriVien,
    danhSachQuyen: [
      { id: 'QTV_NHAN_VIEN', label: 'Quản lý tài khoản nhân viên' },
      { id: 'QTV_TIN_TUC', label: 'Quản lý tin tức' },
      { id: 'QTV_DANH_GIA', label: 'Kiểm duyệt nội dung đánh giá' },
      { id: 'QTV_HE_THONG', label: 'Cấu hình hệ thống' }
    ]
  }
];

const MOCK_NHAN_VIEN: NhanVien[] = [
  {
    maNhanVien: 'CL364',
    tenTruyCap: 'dailyminhtam',
    tenHienThi: 'Nguyễn Minh Tâm',
    hoVaTenDem: 'Nguyễn Minh',
    ten: 'Tâm',
    loaiTaiKhoan: LoaiTaiKhoan.QuanTriVien,
    trangThai: TrangThaiTaiKhoan.HoatDong,
    gioiTinh: 'Nam',
    ngaySinh: '1985-05-20',
    diaChi: 'Hà Nội',
    soDienThoai: '0912345678',
    email: 'minhtam@gmail.com',
    maVanPhong: 'VP01',
    danhSachQuyen: ['QTV_NHAN_VIEN', 'QTV_TIN_TUC']
  }
];

@Component({
  selector: 'app-quan-ly-tai-khoan-nhan-vien',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quan-ly-tai-khoan-nhan-vien.component.html',
  styleUrls: ['./quan-ly-tai-khoan-nhan-vien.component.css']
})
export class QuanLyTaiKhoanNhanVienComponent implements OnInit {
  nhanViens: NhanVien[] = [...MOCK_NHAN_VIEN];
  filteredNhanViens: NhanVien[] = [];
  roles = [LoaiTaiKhoan.BanVe, LoaiTaiKhoan.DieuPhoi, LoaiTaiKhoan.BanQuanLy, LoaiTaiKhoan.QuanTriVien];

  // UI State
  currentFilterStatus: 'all' | 'active' | 'locked' = 'all';
  searchText: string = '';
  selectedRoleFilter: string = '';
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  activeTab: 'basic' | 'permission' | 'contact' = 'basic';
  
  // Form State
  currentNhanVien: Partial<NhanVien> = {};
  passwordConfirm: string = '';
  showPassword = false;
  showPasswordConfirm = false;
  isChangingPassword = false;

  // Permissions helper
  activeModule?: ModuleQuyen;

  constructor() { }

  ngOnInit(): void {
    this.applyFilters();
  }

  filterByStatus(status: 'all' | 'active' | 'locked'): void {
    this.currentFilterStatus = status;
    this.applyFilters();
  }

  search(): void { this.applyFilters(); }

  applyFilters(): void {
    let result = [...this.nhanViens];
    if (this.currentFilterStatus === 'active') result = result.filter(nv => nv.trangThai === TrangThaiTaiKhoan.HoatDong);
    else if (this.currentFilterStatus === 'locked') result = result.filter(nv => nv.trangThai === TrangThaiTaiKhoan.VoHieuHoa);
    if (this.selectedRoleFilter) result = result.filter(nv => nv.loaiTaiKhoan === (this.selectedRoleFilter as LoaiTaiKhoan));
    if (this.searchText) {
      const s = this.searchText.toLowerCase();
      result = result.filter(nv => nv.maNhanVien.toLowerCase().includes(s) || nv.tenTruyCap.toLowerCase().includes(s) || nv.tenHienThi.toLowerCase().includes(s));
    }
    this.filteredNhanViens = result;
  }

  getRoleLabel(role: LoaiTaiKhoan | string | undefined): string {
    if (!role) return 'Chưa chọn';
    switch (role) {
      case LoaiTaiKhoan.BanVe: return 'Nhân viên bán vé';
      case LoaiTaiKhoan.DieuPhoi: return 'Nhân viên điều phối';
      case LoaiTaiKhoan.BanQuanLy: return 'Ban quản lý';
      case LoaiTaiKhoan.QuanTriVien: return 'Quản trị viên';
      default: return role.toString();
    }
  }

  openModal(nv?: NhanVien): void {
    this.isEditMode = !!nv;
    this.currentNhanVien = nv ? JSON.parse(JSON.stringify(nv)) : { loaiTaiKhoan: LoaiTaiKhoan.BanVe, trangThai: TrangThaiTaiKhoan.HoatDong, gioiTinh: 'Nam', danhSachQuyen: [] };
    this.updateActiveModule();
    this.activeTab = 'basic';
    this.isModalOpen = true;
  }

  closeModal(): void { this.isModalOpen = false; this.resetForm(); }
  editNhanVien(nv: NhanVien): void { this.openModal(nv); }

  updateActiveModule(): void {
    this.activeModule = MODUL_QUYEN_HE_THONG.find(m => m.role === this.currentNhanVien.loaiTaiKhoan);
  }

  onRoleChange(): void {
    this.updateActiveModule();
    this.currentNhanVien.danhSachQuyen = [];
  }

  togglePermission(id: string): void {
    if (!this.currentNhanVien.danhSachQuyen) this.currentNhanVien.danhSachQuyen = [];
    const idx = this.currentNhanVien.danhSachQuyen.indexOf(id);
    if (idx > -1) this.currentNhanVien.danhSachQuyen.splice(idx, 1);
    else this.currentNhanVien.danhSachQuyen.push(id);
  }

  isPermissionChecked(id: string): boolean { return this.currentNhanVien.danhSachQuyen?.includes(id) || false; }

  toggleAccountStatus(): void {
    this.currentNhanVien.trangThai = this.currentNhanVien.trangThai === TrangThaiTaiKhoan.HoatDong ? TrangThaiTaiKhoan.VoHieuHoa : TrangThaiTaiKhoan.HoatDong;
    if (this.isEditMode) this.save();
  }

  nextTab(): void {
    if (this.activeTab === 'basic') this.activeTab = 'permission';
    else if (this.activeTab === 'permission') this.activeTab = 'contact';
    else this.save();
  }
  prevTab(): void {
    if (this.activeTab === 'contact') this.activeTab = 'permission';
    else if (this.activeTab === 'permission') this.activeTab = 'basic';
  }

  save(): void {
    if (this.isEditMode) {
      const idx = this.nhanViens.findIndex(n => n.maNhanVien === this.currentNhanVien.maNhanVien);
      if (idx !== -1) this.nhanViens[idx] = this.currentNhanVien as NhanVien;
    } else {
      this.nhanViens.push({ ...this.currentNhanVien, maNhanVien: 'NV' + Math.floor(Math.random() * 1000) } as NhanVien);
    }
    this.applyFilters();
    this.closeModal();
  }

  resetForm(): void { this.currentNhanVien = {}; this.passwordConfirm = ''; this.isChangingPassword = false; }
}
