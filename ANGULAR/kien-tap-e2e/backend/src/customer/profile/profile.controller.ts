import { Controller, Get, Put, Post, Param, Body, Query, UseGuards, UseFilters } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard, CurrentUser } from '../auth/jwt-auth.guard';
import { CustomerExceptionFilter } from '../customer-exception.filter';

@Controller('customer/profile')
@UseGuards(JwtAuthGuard)
@UseFilters(CustomerExceptionFilter)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
  ) {}

  // POST /customer/profile/send-otp → Gửi OTP đổi mật khẩu (từ JWT)
  @Post('send-otp')
  async sendOtpFromToken(@CurrentUser() user: any) {
    const customer = await this.profileService.getProfile(user.maKhachHang);
    return this.authService.sendOtp({
      SoDienThoai: customer.SoDienThoai,
      MucDich: 'DoiMatKhau',
    });
  }

  // GET /customer/profile/history → Xem lịch sử mua vé của khách hàng từ JWT token
  @Get('history')
  async getHistoryFromToken(
    @CurrentUser() user: any,
    @Query('trangThai') trangThai?: string,
    @Query('sortByDate') sortByDate?: 'asc' | 'desc',
  ) {
    const data = await this.profileService.getBookingHistory(user.maKhachHang, trangThai, sortByDate);
    return {
      success: true,
      message: 'Lấy lịch sử đặt vé thành công!',
      data,
    };
  }

  // GET /customer/profile → Xem thông tin tài khoản của mình từ JWT token
  @Get()
  async getProfileFromToken(@CurrentUser() user: any) {
    const data = await this.profileService.getProfile(user.maKhachHang);
    return {
      success: true,
      message: 'Lấy thông tin tài khoản thành công!',
      data,
    };
  }

  // PUT /customer/profile → Cập nhật thông tin tài khoản của mình từ JWT token
  @Put()
  async updateProfileFromToken(
    @CurrentUser() user: any,
    @Body()
    dto: {
      HoTenKhachHang?: string;
      Email?: string;
      AnhDaiDien?: string;
      GioiTinh?: string;
      NgaySinh?: string;
    },
  ) {
    const data = await this.profileService.updateProfile(user.maKhachHang, dto);
    return {
      success: true,
      message: 'Cập nhật tài khoản thành công!',
      data,
    };
  }

  // POST /customer/profile/change-password → Đổi mật khẩu từ JWT token
  @Post('change-password')
  async changePasswordFromToken(
    @CurrentUser() user: any,
    @Body()
    dto: {
      MatKhauCu: string;
      MatKhauMoi: string;
      XacNhanMatKhauMoi: string;
    },
  ) {
    return this.profileService.changePassword(user.maKhachHang, dto);
  }

  // GET /customer/profile/:id → Xem thông tin tài khoản bằng ID (cần JWT)
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    const data = await this.profileService.getProfile(id);
    return {
      success: true,
      message: 'Lấy thông tin tài khoản thành công!',
      data,
    };
  }

  // PUT /customer/profile/:id → Cập nhật thông tin tài khoản bằng ID (cần JWT)
  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    const data = await this.profileService.updateProfile(id, dto);
    return {
      success: true,
      message: 'Cập nhật tài khoản thành công!',
      data,
    };
  }


}
