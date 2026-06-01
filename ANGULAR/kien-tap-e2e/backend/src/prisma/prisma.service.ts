import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';
import { DEFAULT_ROLE_PERMISSIONS } from '../admin/auth/default-permissions';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    // Allow skipping automatic seeding in developer environments where the schema/data
    // may be incomplete. Set SKIP_DB_SEED=true to opt out of seeding.
    if (process.env.SKIP_DB_SEED === 'true') {
      console.log('SKIP_DB_SEED is set; skipping automatic DB seeding.');
      return;
    }
    
    // Đảm bảo có các dữ liệu hệ thống bắt buộc để tránh lỗi ràng buộc khóa ngoại (Foreign Key Constraint)
    try {
      // 1. Đảm bảo NVDP100001 tồn tại trong NHAN_VIEN
      await this.nHAN_VIEN.upsert({
        where: { MaNhanVien: 'NVDP100001' },
        update: {
          Quyen: DEFAULT_ROLE_PERMISSIONS.NhanVienDieuPhoi,
        },
        create: {
          MaNhanVien: 'NVDP100001',
          LoaiTaiKhoan: 'NhanVienDieuPhoi',
          TenTruyCap: 'dieuphoi1',
          MatKhau: 'Dieuphoi@123',
          HoVaTenDem: 'Nguyễn Văn',
          Ten: 'Điều Phối',
          TenHienThi: 'Nguyễn Văn Điều Phối',
          SoDienThoai: '0913000111',
          Email: 'dp1@txpbus.vn',
          TrangThai: 'HoatDong',
          Quyen: DEFAULT_ROLE_PERMISSIONS.NhanVienDieuPhoi,
        },
      });

      // Đảm bảo NVDP100001 tồn tại trong NHAN_VIEN_DIEU_PHOI
      await this.nHAN_VIEN_DIEU_PHOI.upsert({
        where: { MaNVDieuPhoi: 'NVDP100001' },
        update: {},
        create: {
          MaNVDieuPhoi: 'NVDP100001',
        },
      });

      // 2. Đảm bảo QTV100001 tồn tại trong NHAN_VIEN
      await this.nHAN_VIEN.upsert({
        where: { MaNhanVien: 'QTV100001' },
        update: {
          Quyen: DEFAULT_ROLE_PERMISSIONS.QuanTriVien,
        },
        create: {
          MaNhanVien: 'QTV100001',
          LoaiTaiKhoan: 'QuanTriVien',
          TenTruyCap: 'admin1',
          MatKhau: 'Admin@123',
          HoVaTenDem: 'Nguyễn An',
          Ten: 'Ninh',
          TenHienThi: 'Nguyễn An Ninh',
          SoDienThoai: '0912000111',
          Email: 'admin@txpbus.vn',
          TrangThai: 'HoatDong',
          Quyen: DEFAULT_ROLE_PERMISSIONS.QuanTriVien,
        },
      });

      // 3. Đảm bảo QTV100001 tồn tại trong QUAN_TRI_VIEN
      await this.qUAN_TRI_VIEN.upsert({
        where: { MaQuanTriVien: 'QTV100001' },
        update: {},
        create: {
          MaQuanTriVien: 'QTV100001',
        },
      });

      await this.nHAN_VIEN.updateMany({
        where: { LoaiTaiKhoan: 'QuanTriVien' },
        data: { Quyen: DEFAULT_ROLE_PERMISSIONS.QuanTriVien },
      });

      await this.nHAN_VIEN.updateMany({
        where: { LoaiTaiKhoan: 'BanQuanLy' },
        data: { Quyen: DEFAULT_ROLE_PERMISSIONS.BanQuanLy },
      });
    } catch (e) {
      console.error('Lỗi khi đảm bảo dữ liệu hệ thống:', e);
    }
  }

  // --- ID Generation Helpers ---
  private formatCode(prefix: string, width: number, value: number): string {
    return `${prefix}${String(value).padStart(width, '0')}`;
  }

  private getNumberPart(id: string | null | undefined, prefix: string): number {
    if (!id || !id.startsWith(prefix)) return 0;
    const numPart = id.slice(prefix.length).replace(/[^0-9]/g, '');
    const parsed = parseInt(numPart, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  async generateNextId(model: string, field: string, prefix: string, width: number = 6, startNumber: number = 100001): Promise<string> {
    const rows = await (this as any)[model].findMany({
      where: { [field]: { startsWith: prefix } },
      select: { [field]: true },
    });

    let maxNum = startNumber - 1;
    for (const row of rows) {
      maxNum = Math.max(maxNum, this.getNumberPart(row[field], prefix));
    }

    const nextNum = Math.max(maxNum + 1, startNumber);
    return this.formatCode(prefix, width, nextNum);
  }
}
