import { Module } from '@nestjs/common';
import { CustomerHoSoController } from './customer-ho-so.controller';
import { CustomerHoSoService } from './customer-ho-so.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerHoSoController],
  providers: [CustomerHoSoService],
  exports: [CustomerHoSoService],
})
export class CustomerHoSoModule {}
