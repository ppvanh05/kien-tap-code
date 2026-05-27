import { Controller, Get, Put, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('customer/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /customer/profile/:id → Xem thông tin tài khoản (cần JWT)
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.profileService.getProfile(id);
  }

  // PUT /customer/profile/:id → Cập nhật thông tin tài khoản (cần JWT)
  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body()
    dto: {
      HoTenKhachHang?: string;
      Email?: string;
      AnhDaiDien?: string;
      GioiTinh?: string;
      NgaySinh?: string;
    },
  ) {
    return this.profileService.updateProfile(id, dto);
  }

  // POST /customer/profile/:id/change-password → Đổi mật khẩu có xác thực OTP (cần JWT)
  @Post(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body()
    dto: {
      MatKhauCu: string;
      MatKhauMoi: string;
      otp: string;
    },
  ) {
    return this.profileService.changePassword(id, dto);
  }
}
