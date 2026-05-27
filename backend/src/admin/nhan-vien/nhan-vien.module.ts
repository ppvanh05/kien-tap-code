import { Module } from '@nestjs/common';
import { NhanVienController } from './nhan-vien.controller';
import { NhanVienService } from './nhan-vien.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NhatKyHeThongModule } from '../nhat-ky-he-thong/nhat-ky-he-thong.module';

@Module({
  imports: [PrismaModule, NhatKyHeThongModule],
  controllers: [NhanVienController],
  providers: [NhanVienService],
  exports: [NhanVienService],
})
export class NhanVienModule {}
