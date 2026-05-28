import { Module } from '@nestjs/common';
import { ChinhSachService } from './chinh-sach.service';
import { ChinhSachController } from './chinh-sach.controller';

@Module({
  controllers: [ChinhSachController],
  providers: [ChinhSachService],
})
export class ChinhSachModule {}
