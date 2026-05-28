import { Module } from '@nestjs/common';
import { CustomerTinTucService } from './customer-tin-tuc.service';
import { CustomerTinTucController } from './customer-tin-tuc.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerTinTucController],
  providers: [CustomerTinTucService],
})
export class CustomerTinTucModule {}
