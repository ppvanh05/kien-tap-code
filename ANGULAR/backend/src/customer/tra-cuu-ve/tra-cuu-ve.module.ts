import { Module } from '@nestjs/common';
import { TraCuuVeController } from './tra-cuu-ve.controller';
import { TraCuuVeService } from './tra-cuu-ve.service';

@Module({
  controllers: [TraCuuVeController],
  providers: [TraCuuVeService],
  exports: [TraCuuVeService],
})
export class TraCuuVeModule {}
