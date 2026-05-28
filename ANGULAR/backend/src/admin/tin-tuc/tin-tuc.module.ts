import { Module } from '@nestjs/common';
import { TinTucService } from './tin-tuc.service';
import { TinTucController } from './tin-tuc.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NhatKyHeThongModule } from '../nhat-ky-he-thong/nhat-ky-he-thong.module';

@Module({
  imports: [PrismaModule, NhatKyHeThongModule],
  controllers: [TinTucController],
  providers: [TinTucService],
})
export class TinTucModule {}
