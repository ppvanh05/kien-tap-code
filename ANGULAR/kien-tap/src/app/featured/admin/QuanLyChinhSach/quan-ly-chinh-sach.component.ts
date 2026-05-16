import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- MODELS ---
export enum LoaiChinhSach {
  BaoHiem = 'BaoHiem',
  ThanhToan = 'ThanhToan',
  HuyVe = 'HuyVe',
  Khac = 'Khac'
}

export interface MocHuyVe {
  truocGio: number;
  phiHuy: number;
}

export interface ChinhSach {
  maChinhSach: string;
  tenChinhSach: string;
  loaiChinhSach: LoaiChinhSach;
  noiDung: string;
  ngayTao: string;
  trangThai: 'HoatDong' | 'VoHieuHoa';
  cacMocHuy?: MocHuyVe[];
}

const MOCK_CHINH_SACH: ChinhSach[] = [
  {
    maChinhSach: 'CS001',
    tenChinhSach: 'Chính sách bảo mật thông tin khách hàng',
    loaiChinhSach: LoaiChinhSach.Khac,
    noiDung: '<p>Chúng tôi cam kết bảo mật thông tin tuyệt đối...</p>',
    ngayTao: '27-05-2024',
    trangThai: 'HoatDong'
  },
  {
    maChinhSach: 'CS002',
    tenChinhSach: 'Chính sách bảo hiểm du lịch nhà xe Anh Huy',
    loaiChinhSach: LoaiChinhSach.BaoHiem,
    noiDung: '<p>Hành khách được bảo hiểm tối đa 100tr đồng...</p>',
    ngayTao: '24-05-2024',
    trangThai: 'HoatDong'
  },
  {
    maChinhSach: 'CS003',
    tenChinhSach: 'Chính sách thanh toán',
    loaiChinhSach: LoaiChinhSach.ThanhToan,
    noiDung: '<p>Hỗ trợ thanh toán qua ví điện tử, ngân hàng...</p>',
    ngayTao: '24-05-2024',
    trangThai: 'HoatDong'
  }
];

@Component({
  selector: 'app-quan-ly-chinh-sach',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quan-ly-chinh-sach.component.html',
  styleUrls: ['./quan-ly-chinh-sach.component.css']
})
export class QuanLyChinhSachComponent implements OnInit {
  LoaiChinhSach = LoaiChinhSach; // Thêm dòng này để HTML hiểu được Enum
  chinhSachs: ChinhSach[] = [...MOCK_CHINH_SACH];
  filteredChinhSachs: ChinhSach[] = [];
  
  // UI State
  currentTab: 'all' | 'active' | 'locked' = 'all';
  isModalOpen = false;
  isEditMode = false;
  showAddDropdown = false;
  
  // Form State
  currentCS: Partial<ChinhSach> = {};

  constructor() {}

  ngOnInit(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.currentTab === 'all') this.filteredChinhSachs = this.chinhSachs;
    else if (this.currentTab === 'active') this.filteredChinhSachs = this.chinhSachs.filter(c => c.trangThai === 'HoatDong');
    else this.filteredChinhSachs = this.chinhSachs.filter(c => c.trangThai === 'VoHieuHoa');
  }

  setTab(tab: 'all' | 'active' | 'locked'): void {
    this.currentTab = tab;
    this.applyFilter();
  }

  openModal(loai?: LoaiChinhSach, cs?: ChinhSach): void {
    this.isEditMode = !!cs;
    if (cs) {
      this.currentCS = JSON.parse(JSON.stringify(cs));
    } else {
      this.currentCS = {
        loaiChinhSach: loai || LoaiChinhSach.Khac,
        trangThai: 'HoatDong',
        ngayTao: new Date().toLocaleDateString('vi-VN'),
        cacMocHuy: loai === LoaiChinhSach.HuyVe ? [{ truocGio: 24, phiHuy: 10 }] : [],
        noiDung: ''
      };
    }
    this.isModalOpen = true;
    this.showAddDropdown = false;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentCS = {};
  }

  addMocHuy(): void {
    if (!this.currentCS.cacMocHuy) this.currentCS.cacMocHuy = [];
    this.currentCS.cacMocHuy.push({ truocGio: 0, phiHuy: 0 });
  }

  removeMocHuy(index: number): void {
    this.currentCS.cacMocHuy?.splice(index, 1);
  }

  save(): void {
    if (this.isEditMode) {
      const idx = this.chinhSachs.findIndex(c => c.maChinhSach === this.currentCS.maChinhSach);
      if (idx !== -1) this.chinhSachs[idx] = this.currentCS as ChinhSach;
    } else {
      const newCS = {
        ...this.currentCS,
        maChinhSach: 'CS' + Math.floor(Math.random() * 1000)
      } as ChinhSach;
      this.chinhSachs.push(newCS);
    }
    this.applyFilter();
    this.closeModal();
  }

  toggleLock(): void {
    this.currentCS.trangThai = this.currentCS.trangThai === 'HoatDong' ? 'VoHieuHoa' : 'HoatDong';
    if (this.isEditMode) this.save();
  }

  onEditorInput(event: any): void {
    this.currentCS.noiDung = event.target.innerHTML;
  }

  execAction(command: string, value: any = null): void {
    if (command === 'createLink') {
      const url = prompt('Nhập địa chỉ liên kết (URL):', 'https://');
      if (url) document.execCommand(command, false, url);
    } else if (command === 'insertImage') {
      const url = prompt('Nhập link ảnh:', 'https://');
      if (url) document.execCommand(command, false, url);
    } else if (command === 'insertHTML' && value === 'table') {
      const tableHTML = '<table border="1" style="width:100%; border-collapse:collapse; margin: 10px 0;"><tr><td style="padding:5px;">&nbsp;</td><td style="padding:5px;">&nbsp;</td></tr><tr><td style="padding:5px;">&nbsp;</td><td style="padding:5px;">&nbsp;</td></tr></table>';
      document.execCommand('insertHTML', false, tableHTML);
    } else {
      document.execCommand(command, false, value);
    }
    this.updateContent();
  }

  onBtnMouseDown(event: MouseEvent, command: string, value: any = null): void {
    event.preventDefault(); // Ngăn chặn mất focus khỏi vùng soạn thảo
    this.execAction(command, value);
  }

  updateContent(): void {
    const editor = document.querySelector('.editor-content');
    if (editor) {
      this.currentCS.noiDung = editor.innerHTML;
    }
  }
}
