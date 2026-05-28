import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
<<<<<<< HEAD
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
=======
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
>>>>>>> origin/nghi
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
