import { Module } from '@nestjs/common';
import { TimKiemChuyenXeController } from './tim-kiem-chuyen-xe.controller';
import { TimKiemChuyenXeService } from './tim-kiem-chuyen-xe.service';

@Module({
  controllers: [TimKiemChuyenXeController],
  providers: [TimKiemChuyenXeService],
  exports: [TimKiemChuyenXeService],
})
export class TimKiemChuyenXeModule {}
