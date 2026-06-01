import { Module } from '@nestjs/common';
import { BaoCaoController } from './bao-cao.controller';
import { BaoCaoService } from './bao-cao.service';

@Module({
  controllers: [BaoCaoController],
  providers: [BaoCaoService],
})
export class BaoCaoModule {}
