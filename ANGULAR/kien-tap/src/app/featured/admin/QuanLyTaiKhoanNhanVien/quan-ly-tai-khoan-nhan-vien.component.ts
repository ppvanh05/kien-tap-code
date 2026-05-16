import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- MODELS (MERGED AS REQUESTED) ---
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
  role: LoaiTaiKhoan;
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
  dienThoaiCoDinh?: string;
  email: string;
  fax?: string;
  whatsApp?: string;
  skype?: string;
  maVanPhong: string;
  anhDaiDien?: string;
  ghiChu?: string;
  trangThai: TrangThaiTaiKhoan;
  danhSachQuyen: string[]; // Lưu ID các quyền được cấp
}

// --- CONSTANTS & MOCK DATA ---
const ALL_PERMISSIONS: QuyenHan[] = [
  // Bán vé
  { id: 'BV_BAN_VE', label: 'Bán vé mới', role: LoaiTaiKhoan.BanVe },
  { id: 'BV_DOI_TRA', label: 'Đổi/Trả vé', role: LoaiTaiKhoan.BanVe },
  { id: 'BV_TRA_CUU', label: 'Tra cứu lịch sử vé', role: LoaiTaiKhoan.BanVe },
  { id: 'BV_HO_TRO', label: 'Hỗ trợ khách hàng', role: LoaiTaiKhoan.BanVe },

  // Điều phối
  { id: 'DP_TUYEN_XE', label: 'Quản lý tuyến xe', role: LoaiTaiKhoan.DieuPhoi },
  { id: 'DP_LICH_TRINH', label: 'Quản lý lịch trình', role: LoaiTaiKhoan.DieuPhoi },
  { id: 'DP_PHUONG_TIEN', label: 'Quản lý phương tiện', role: LoaiTaiKhoan.DieuPhoi },
  { id: 'DP_PHAN_CONG', label: 'Phân công tài/phụ xe', role: LoaiTaiKhoan.DieuPhoi },

  // Ban quản lý
  { id: 'BQL_DOANH_THU', label: 'Xem báo cáo doanh thu', role: LoaiTaiKhoan.BanQuanLy },
  { id: 'BQL_THONG_KE', label: 'Thống kê hiệu suất', role: LoaiTaiKhoan.BanQuanLy },
  { id: 'BQL_CHINH_SACH', label: 'Quản lý chính sách giá/hủy', role: LoaiTaiKhoan.BanQuanLy },
  { id: 'BQL_GIAM_SAT', label: 'Theo dõi hoạt động kinh doanh', role: LoaiTaiKhoan.BanQuanLy },

  // Quản trị viên
  { id: 'QTV_NHAN_VIEN', label: 'Quản lý tài khoản nhân viên', role: LoaiTaiKhoan.QuanTriVien },
  { id: 'QTV_TIN_TUC', label: 'Quản lý tin tức', role: LoaiTaiKhoan.QuanTriVien },
  { id: 'QTV_DANH_GIA', label: 'Kiểm duyệt nội dung đánh giá', role: LoaiTaiKhoan.QuanTriVien },
  { id: 'QTV_HE_THONG', label: 'Cấu hình hệ thống', role: LoaiTaiKhoan.QuanTriVien },
];

const MOCK_NHAN_VIEN: NhanVien[] = [
  {
    maNhanVien: 'CL364',
    tenTruyCap: 'dailyminhtam',
    tenHienThi: 'Minh Tâm BOSS',
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
    danhSachQuyen: ['QTV_NHAN_VIEN', 'QTV_TIN_TUC', 'QTV_DANH_GIA', 'QTV_HE_THONG']
  },
  {
    maNhanVien: 'CL363',
    tenTruyCap: 'nhanvienanhhuydatcang1',
    tenHienThi: 'Linhll1 NV',
    hoVaTenDem: 'Lý Long',
    ten: 'Linh',
    loaiTaiKhoan: LoaiTaiKhoan.BanVe,
    trangThai: TrangThaiTaiKhoan.HoatDong,
    gioiTinh: 'Nam',
    ngaySinh: '1990-09-20',
    diaChi: 'Hải Phòng',
    soDienThoai: '0987654321',
    email: 'linhll1@gmail.com',
    maVanPhong: 'VP30 Mỹ Đình',
    danhSachQuyen: ['BV_BAN_VE', 'BV_DOI_TRA']
  },
  {
    maNhanVien: 'CL330',
    tenTruyCap: 'cuongkaratekit',
    tenHienThi: 'Anh Huy BOSS',
    hoVaTenDem: 'Trần Anh',
    ten: 'Huy',
    loaiTaiKhoan: LoaiTaiKhoan.BanQuanLy,
    trangThai: TrangThaiTaiKhoan.VoHieuHoa,
    gioiTinh: 'Nam',
    ngaySinh: '1982-12-10',
    diaChi: 'Quảng Ninh',
    soDienThoai: '0900112233',
    email: 'anhhuy@gmail.com',
    maVanPhong: 'VP02',
    danhSachQuyen: ['BQL_DOANH_THU', 'BQL_THONG_KE']
  }
];

// --- COMPONENT ---
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

  // Filter & Search
  currentFilterStatus: 'all' | 'active' | 'locked' = 'all';
  searchText: string = '';
  selectedRoleFilter: string = '';

  // Modal State
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
  availablePermissions: QuyenHan[] = [];

  // Roles for template
  roles = [LoaiTaiKhoan.BanVe, LoaiTaiKhoan.DieuPhoi, LoaiTaiKhoan.BanQuanLy, LoaiTaiKhoan.QuanTriVien];

  constructor() { }

  ngOnInit(): void {
    this.applyFilters();
  }

  filterByStatus(status: 'all' | 'active' | 'locked'): void {
    this.currentFilterStatus = status;
    this.applyFilters();
  }

  search(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.nhanViens];

    // Filter by Status
    if (this.currentFilterStatus === 'active') {
      result = result.filter(nv => nv.trangThai === TrangThaiTaiKhoan.HoatDong);
    } else if (this.currentFilterStatus === 'locked') {
      result = result.filter(nv => nv.trangThai === TrangThaiTaiKhoan.VoHieuHoa);
    }

    // Filter by Role
    if (this.selectedRoleFilter) {
      result = result.filter(nv => nv.loaiTaiKhoan === (this.selectedRoleFilter as LoaiTaiKhoan));
    }

    // Search text
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      result = result.filter(nv =>
        nv.maNhanVien.toLowerCase().includes(search) ||
        nv.tenTruyCap.toLowerCase().includes(search) ||
        nv.tenHienThi.toLowerCase().includes(search)
      );
    }

    this.filteredNhanViens = result;
  }

  getRoleLabel(role: LoaiTaiKhoan | string | undefined): string {
    if (!role) return 'Chưa xác định';
    switch (role) {
      case LoaiTaiKhoan.BanVe: return 'Nhân viên bán vé';
      case LoaiTaiKhoan.DieuPhoi: return 'Nhân viên điều phối';
      case LoaiTaiKhoan.BanQuanLy: return 'Ban quản lý';
      case LoaiTaiKhoan.QuanTriVien: return 'Quản trị viên';
      default: return role.toString();
    }
  }

  // Modal Actions
  openModal(nv?: NhanVien): void {
    this.isEditMode = !!nv;
    if (nv) {
      this.currentNhanVien = JSON.parse(JSON.stringify(nv)); // Deep clone
    } else {
      this.currentNhanVien = {
        loaiTaiKhoan: LoaiTaiKhoan.BanVe,
        trangThai: TrangThaiTaiKhoan.HoatDong,
        gioiTinh: 'Nam',
        danhSachQuyen: []
      };
    }
    this.updateAvailablePermissions();
    this.activeTab = 'basic';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  editNhanVien(nv: NhanVien): void {
    this.openModal(nv);
  }

  updateAvailablePermissions(): void {
    if (this.currentNhanVien.loaiTaiKhoan) {
      this.availablePermissions = ALL_PERMISSIONS.filter(p => p.role === this.currentNhanVien.loaiTaiKhoan);
    }
  }

  onRoleChange(): void {
    this.updateAvailablePermissions();
    // Reset permissions when role changes to avoid inconsistency
    this.currentNhanVien.danhSachQuyen = [];
  }

  togglePermission(permId: string): void {
    if (!this.currentNhanVien.danhSachQuyen) {
      this.currentNhanVien.danhSachQuyen = [];
    }
    const index = this.currentNhanVien.danhSachQuyen.indexOf(permId);
    if (index > -1) {
      this.currentNhanVien.danhSachQuyen.splice(index, 1);
    } else {
      this.currentNhanVien.danhSachQuyen.push(permId);
    }
  }

  isPermissionChecked(permId: string): boolean {
    return this.currentNhanVien.danhSachQuyen?.includes(permId) || false;
  }

  toggleAccountStatus(): void {
    if (this.currentNhanVien.trangThai === TrangThaiTaiKhoan.HoatDong) {
      this.currentNhanVien.trangThai = TrangThaiTaiKhoan.VoHieuHoa;
    } else {
      this.currentNhanVien.trangThai = TrangThaiTaiKhoan.HoatDong;
    }

    // Nếu đang ở chế độ sửa, cập nhật trực tiếp luôn cho tiện
    if (this.isEditMode) {
      this.save();
    }
  }

  quickToggleLock(nv: NhanVien): void {
    const original = this.nhanViens.find(item => item.maNhanVien === nv.maNhanVien);
    if (original) {
      original.trangThai = original.trangThai === TrangThaiTaiKhoan.HoatDong ? TrangThaiTaiKhoan.VoHieuHoa : TrangThaiTaiKhoan.HoatDong;
      this.applyFilters();
    }
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
    if (!this.currentNhanVien.tenTruyCap || !this.currentNhanVien.ten) {
      alert('Vui lòng điền các thông tin bắt buộc');
      return;
    }

    if (this.isEditMode) {
      const index = this.nhanViens.findIndex(item => item.maNhanVien === this.currentNhanVien.maNhanVien);
      if (index !== -1) {
        this.nhanViens[index] = this.currentNhanVien as NhanVien;
      }
    } else {
      const newNv = {
        ...this.currentNhanVien,
        maNhanVien: 'NV' + Math.floor(Math.random() * 1000)
      } as NhanVien;
      this.nhanViens.push(newNv);
    }
    this.applyFilters();
    this.closeModal();
  }

  resetForm(): void {
    this.currentNhanVien = {};
    this.passwordConfirm = '';
    this.isChangingPassword = false;
    this.showPassword = false;
    this.showPasswordConfirm = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentNhanVien.anhDaiDien = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
