import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- MODELS ---
export interface KhachHang {
  maKhachHang: string;
  hoTenKhachHang: string;
  soDienThoai: string;
  email: string;
  matKhau: string;
  anhDaiDien: string;
  gioiTinh: 'Nam' | 'Nữ' | 'Khác';
  ngaySinh: string;
  diaChi: string;
  cccd: string;
  ghiChu: string;
  trangThaiTaiKhoan: 'HoatDong' | 'DaKhoa';
  ngayDangKy: string;
}

const MOCK_KHACH_HANG: KhachHang[] = [
  {
    maKhachHang: 'KH0001',
    hoTenKhachHang: 'Nguyễn Văn A',
    soDienThoai: '0901234567',
    email: 'vana@gmail.com',
    matKhau: '******',
    anhDaiDien: 'https://i.pravatar.cc/150?u=KH0001',
    gioiTinh: 'Nam',
    ngaySinh: '1995-10-15',
    diaChi: '123 Đường ABC, Quận 1, TP.HCM',
    cccd: '079123456789',
    ghiChu: 'Khách hàng thân thiết',
    trangThaiTaiKhoan: 'HoatDong',
    ngayDangKy: '2024-01-10'
  },
  {
    maKhachHang: 'KH0002',
    hoTenKhachHang: 'Trần Thị B',
    soDienThoai: '0912345678',
    email: 'thib@gmail.com',
    matKhau: '******',
    anhDaiDien: 'https://i.pravatar.cc/150?u=KH0002',
    gioiTinh: 'Nữ',
    ngaySinh: '1998-05-20',
    diaChi: '456 Đường XYZ, Quận 7, TP.HCM',
    cccd: '079987654321',
    ghiChu: '',
    trangThaiTaiKhoan: 'HoatDong',
    ngayDangKy: '2024-02-15'
  },
  {
    maKhachHang: 'KH0003',
    hoTenKhachHang: 'Lê Văn C',
    soDienThoai: '0987654321',
    email: 'vanc@gmail.com',
    matKhau: '******',
    anhDaiDien: 'https://i.pravatar.cc/150?u=KH0003',
    gioiTinh: 'Nam',
    ngaySinh: '1990-12-30',
    diaChi: '789 Đường LMN, Quận 10, TP.HCM',
    cccd: '079555666777',
    ghiChu: 'Tài khoản đang bị theo dõi',
    trangThaiTaiKhoan: 'DaKhoa',
    ngayDangKy: '2023-12-01'
  }
];

@Component({
  selector: 'app-quan-ly-tai-khoan-khach-hang',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quan-ly-tai-khoan-khach-hang.component.html',
  styleUrls: ['./quan-ly-tai-khoan-khach-hang.component.css']
})
export class QuanLyTaiKhoanKhachHangComponent implements OnInit {
  khachHangs: KhachHang[] = [...MOCK_KHACH_HANG];
  filteredKhachHangs: KhachHang[] = [];
  
  // UI State
  currentFilterStatus: 'all' | 'active' | 'locked' = 'all';
  searchText: string = '';
  isModalOpen = false;
  isEditMode = false;
  
  // Form State
  currentKH: Partial<KhachHang> = {};

  constructor() {}

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.khachHangs;

    // Filter by status tab
    if (this.currentFilterStatus === 'active') {
      result = result.filter(kh => kh.trangThaiTaiKhoan === 'HoatDong');
    } else if (this.currentFilterStatus === 'locked') {
      result = result.filter(kh => kh.trangThaiTaiKhoan === 'DaKhoa');
    }

    // Search
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      result = result.filter(kh => 
        kh.hoTenKhachHang.toLowerCase().includes(search) ||
        kh.soDienThoai.includes(search) ||
        kh.email.toLowerCase().includes(search) ||
        kh.maKhachHang.toLowerCase().includes(search)
      );
    }

    this.filteredKhachHangs = result;
  }

  filterByStatus(status: 'all' | 'active' | 'locked'): void {
    this.currentFilterStatus = status;
    this.applyFilters();
  }

  search(): void {
    this.applyFilters();
  }

  openModal(kh?: KhachHang): void {
    this.isEditMode = !!kh;
    if (kh) {
      this.currentKH = JSON.parse(JSON.stringify(kh));
    } else {
      this.currentKH = {
        trangThaiTaiKhoan: 'HoatDong',
        ngayDangKy: new Date().toISOString().split('T')[0],
        gioiTinh: 'Nam'
      };
    }
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentKH = {};
  }

  save(): void {
    if (this.isEditMode) {
      const idx = this.khachHangs.findIndex(kh => kh.maKhachHang === this.currentKH.maKhachHang);
      if (idx !== -1) {
        this.khachHangs[idx] = this.currentKH as KhachHang;
      }
    } else {
      const newKH = {
        ...this.currentKH,
        maKhachHang: 'KH' + (this.khachHangs.length + 1).toString().padStart(4, '0')
      } as KhachHang;
      this.khachHangs.unshift(newKH);
    }
    this.applyFilters();
    this.closeModal();
  }

  toggleAccountStatus(): void {
    this.currentKH.trangThaiTaiKhoan = this.currentKH.trangThaiTaiKhoan === 'HoatDong' ? 'DaKhoa' : 'HoatDong';
    if (this.isEditMode) {
      this.save();
    }
  }
}
