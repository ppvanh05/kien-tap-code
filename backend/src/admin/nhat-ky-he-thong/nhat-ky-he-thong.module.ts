import { Module, Global } from '@nestjs/common';
import { NhatKyHeThongController } from './nhat-ky-he-thong.controller';
import { NhatKyHeThongService } from './nhat-ky-he-thong.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Global() // Để là Global module để các module khác import thoải mái mà không cần khai báo lại
@Module({
  imports: [PrismaModule],
  controllers: [NhatKyHeThongController],
  providers: [NhatKyHeThongService],
  exports: [NhatKyHeThongService],
})
export class NhatKyHeThongModule {}
