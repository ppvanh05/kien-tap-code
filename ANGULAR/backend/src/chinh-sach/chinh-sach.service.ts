import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CHINH_SACH,
  CHINH_SACH_HUY_VE,
  LoaiChinhSachEnum,
  TrangThaiChinhSachEnum,
} from '@prisma/client';

@Injectable()
export class ChinhSachService {
  constructor(private readonly prisma: PrismaService) {}

  private parseNoiDung(noiDung: string): string[] {
    return noiDung
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  private mapCategory(loai: LoaiChinhSachEnum): string {
    switch (loai) {
      case LoaiChinhSachEnum.ChinhSachThanhToan:
        return 'Quy định đặt vé & Thanh toán';
      case LoaiChinhSachEnum.ChinhSachHuyVe:
        return 'Chính sách hủy vé & Hoàn tiền';
      case LoaiChinhSachEnum.ChinhSachBaoHiem:
        return 'Cam kết dịch vụ & Bồi thường';
      case LoaiChinhSachEnum.ChinhSachKhac:
        return 'Chính sách khác';
      default:
        return 'Chính sách khác';
    }
  }

  private mapIcon(loai: LoaiChinhSachEnum): string {
    switch (loai) {
      case LoaiChinhSachEnum.ChinhSachHuyVe:
        return 'cancel';
      case LoaiChinhSachEnum.ChinhSachKhac:
        return 'policy';
      case LoaiChinhSachEnum.ChinhSachThanhToan:
        return 'payments';
      case LoaiChinhSachEnum.ChinhSachBaoHiem:
        return 'verified_user';
      default:
        return 'description';
    }
  }

  private mapChinhSachItem(cs: CHINH_SACH) {
    return {
      id: cs.MaChinhSach_ND,
      title: cs.TieuDe,
      category: this.mapCategory(cs.LoaiChinhSach),
      loaiChinhSach: cs.LoaiChinhSach,
      icon: this.mapIcon(cs.LoaiChinhSach),
      content: this.parseNoiDung(cs.NoiDung),
      ngayApDung: cs.NgayApDung,
      trangThai: cs.TrangThai,
    };
  }

  private buildHuyVeContent(cs: CHINH_SACH_HUY_VE): string[] {
    const lines = cs.MoTa ? this.parseNoiDung(cs.MoTa) : [];
    lines.push(
      `Thời hạn hủy vé: Hủy trước ${cs.GioiHanGioTruocKhoiHanh} giờ so với giờ khởi hành`,
    );
    lines.push(
      `Tỷ lệ phí hủy: ${Math.round(cs.TyLePhiHuy * 100)}% giá trị vé`,
    );
    return lines;
  }

  private mapHuyVeItem(cs: CHINH_SACH_HUY_VE) {
    return {
      id: cs.MaChinhSach,
      title: cs.TenChinhSach,
      category: 'Chính sách hủy vé & Hoàn tiền',
      loaiChinhSach: LoaiChinhSachEnum.ChinhSachHuyVe,
      icon: 'cancel',
      content: this.buildHuyVeContent(cs),
      gioiHanGioTruocKhoiHanh: cs.GioiHanGioTruocKhoiHanh,
      tyLePhiHuy: cs.TyLePhiHuy,
      ngayApDung: cs.NgayApDung,
      trangThai: cs.TrangThai,
    };
  }

  async findAllActive() {
    const list = await this.prisma.cHINH_SACH.findMany({
      where: { TrangThai: TrangThaiChinhSachEnum.DangApDung },
      orderBy: [{ NgayApDung: 'desc' }, { MaChinhSach_ND: 'asc' }],
    });
    return list.map((item) => this.mapChinhSachItem(item));
  }

  async findActiveById(id: string) {
    const item = await this.prisma.cHINH_SACH.findFirst({
      where: {
        MaChinhSach_ND: id,
        TrangThai: TrangThaiChinhSachEnum.DangApDung,
      },
    });
    return item ? this.mapChinhSachItem(item) : null;
  }

  async findAllActiveHuyVe() {
    const list = await this.prisma.cHINH_SACH_HUY_VE.findMany({
      where: { TrangThai: TrangThaiChinhSachEnum.DangApDung },
      orderBy: [{ NgayApDung: 'desc' }, { MaChinhSach: 'asc' }],
    });
    return list.map((item) => this.mapHuyVeItem(item));
  }
}
