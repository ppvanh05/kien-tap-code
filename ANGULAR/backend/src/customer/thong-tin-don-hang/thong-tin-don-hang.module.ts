import { Module } from '@nestjs/common';
import { ThongTinDonHangController } from './thong-tin-don-hang.controller';
import { ThongTinDonHangService } from './thong-tin-don-hang.service';

@Module({
  controllers: [ThongTinDonHangController],
  providers: [ThongTinDonHangService],
  exports: [ThongTinDonHangService],
})
export class ThongTinDonHangModule {}
