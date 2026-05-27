import { Module } from '@nestjs/common';
import { DieuHanhController } from './dieu-hanh.controller';
import { DieuHanhService } from './dieu-hanh.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DieuHanhController],
  providers: [DieuHanhService],
  exports: [DieuHanhService],
})
export class DieuHanhModule {}
