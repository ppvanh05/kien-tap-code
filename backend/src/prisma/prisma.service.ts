import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    
    // Đảm bảo có các dữ liệu hệ thống bắt buộc (như QTV001, NVDP001) để tránh lỗi ràng buộc khóa ngoại (Foreign Key Constraint)
    try {
      // 1. Đảm bảo NVDP100001 tồn tại trong NHAN_VIEN
      await this.nHAN_VIEN.upsert({
        where: { MaNhanVien: 'NVDP100001' },
        update: {
          Quyen: ['route.view', 'route.manage', 'vehicle.manage', 'driver.manage', 'trip.create', 'trip.assign', 'trip.update'],
        },
        create: {
          MaNhanVien: 'NVDP100001',
          LoaiTaiKhoan: 'NhanVienDieuPhoi',
          TenTruyCap: 'dieuphoi1',
          HoVaTenDem: 'Nguyễn Văn',
          Ten: 'Điều Phối',
          TrangThai: 'HoatDong',
          Quyen: ['route.view', 'route.manage', 'vehicle.manage', 'driver.manage', 'trip.create', 'trip.assign', 'trip.update'],
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
          Quyen: ['employee.view', 'employee.manage', 'role.manage', 'system.log', 'review.moderate', 'review.view', 'review.reply'],
        },
        create: {
          MaNhanVien: 'QTV100001',
          LoaiTaiKhoan: 'QuanTriVien',
          TenTruyCap: 'admin',
          HoVaTenDem: 'Quản Trị',
          Ten: 'Viên',
          TrangThai: 'HoatDong',
          Quyen: ['employee.view', 'employee.manage', 'role.manage', 'system.log', 'review.moderate', 'review.view', 'review.reply'],
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
      
      console.log('Successfully seeded system default records (NVDP100001, QTV100001).');
    } catch (e) {
      console.error('Failed to seed default records:', e);
    }
  }
}
