import { Module } from '@nestjs/common';
import { TuKhoaCamController } from './tu-khoa-cam.controller';
import { TuKhoaCamService } from './tu-khoa-cam.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TuKhoaCamController],
  providers: [TuKhoaCamService],
  exports: [TuKhoaCamService],
})
export class TuKhoaCamModule {}
