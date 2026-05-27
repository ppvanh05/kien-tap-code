import { Module } from '@nestjs/common';
import { KhachHangService } from './khach-hang.service';
import { KhachHangController } from './khach-hang.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KhachHangController],
  providers: [KhachHangService],
})
export class KhachHangModule {}
