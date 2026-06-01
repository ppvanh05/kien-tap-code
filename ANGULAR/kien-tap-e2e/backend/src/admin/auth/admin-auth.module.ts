import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { NhatKyHeThongModule } from '../nhat-ky-he-thong/nhat-ky-he-thong.module';
import { AdminPermissionsGuard } from './admin-permissions.guard';

@Module({
  imports: [NhatKyHeThongModule],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminPermissionsGuard],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}
