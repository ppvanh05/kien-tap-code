import { Module } from '@nestjs/common';
import { ChinhSachController } from './chinh-sach.controller';
import { ChinhSachService } from './chinh-sach.service';

@Module({
  controllers: [ChinhSachController],
  providers: [ChinhSachService],
})
export class ChinhSachPublicModule {}
