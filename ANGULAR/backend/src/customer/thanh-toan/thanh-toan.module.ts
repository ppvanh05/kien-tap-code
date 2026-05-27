import { Module } from '@nestjs/common';
import { ThanhToanController } from './thanh-toan.controller';
import { ThanhToanService } from './thanh-toan.service';

@Module({
  controllers: [ThanhToanController],
  providers: [ThanhToanService],
  exports: [ThanhToanService],
})
export class ThanhToanModule {}
