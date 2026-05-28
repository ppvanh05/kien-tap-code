import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('customer/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /customer/auth/send-otp → Gửi mã OTP xác thực
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: { SoDienThoai: string; MucDich: string }) {
    return this.authService.sendOtp(dto);
  }

  // POST /customer/auth/verify-otp → Xác thực mã OTP
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: { SoDienThoai: string; otp: string; MucDich: string }) {
    return this.authService.verifyOtp(dto);
  }

  // POST /customer/auth/register → Đăng ký tài khoản mới
  @Post('register')
  async register(
    @Body()
    dto: {
      HoTenKhachHang: string;
      SoDienThoai: string;
      Email?: string;
      MatKhau: string;
      GioiTinh?: string;
      NgaySinh?: string;
      otp?: string;
    },
  ) {
    return this.authService.register(dto);
  }

  // POST /customer/auth/login → Đăng nhập tài khoản
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: { phoneOrEmail: string; MatKhau: string }) {
    return this.authService.login(dto);
  }

  // POST /customer/auth/forgot-password → Gửi OTP quên mật khẩu
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: { SoDienThoai: string }) {
    return this.authService.forgotPassword(dto);
  }

  // POST /customer/auth/reset-password → Đặt lại mật khẩu mới
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: { SoDienThoai: string; otp: string; MatKhauMoi: string },
  ) {
    return this.authService.resetPassword(dto);
  }
}
