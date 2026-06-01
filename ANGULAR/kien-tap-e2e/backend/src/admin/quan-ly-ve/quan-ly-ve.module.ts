import { Module } from '@nestjs/common';
import { QuanLyVeService } from './quan-ly-ve.service';
import { QuanLyVeController } from './quan-ly-ve.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NhatKyHeThongModule } from '../nhat-ky-he-thong/nhat-ky-he-thong.module';

@Module({
  imports: [PrismaModule, NhatKyHeThongModule],
  controllers: [QuanLyVeController],
  providers: [QuanLyVeService],
})
export class QuanLyVeModule {}
