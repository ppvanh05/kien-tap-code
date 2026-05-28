import { Controller, Post, Body, HttpCode, HttpStatus, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomerExceptionFilter } from '../customer-exception.filter';

@Controller('customer/auth')
@UseFilters(CustomerExceptionFilter)
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
  async verifyOtp(@Body() dto: { SoDienThoai: string; otp: string; MucDich: string; markUsed?: boolean }) {
    return this.authService.verifyOtp(dto);
  }

  @Post('check-phone')
  @HttpCode(HttpStatus.OK)
  async checkPhone(@Body() dto: { SoDienThoai: string }) {
    const exists = await this.authService.checkPhoneExists(dto.SoDienThoai);
    return { exists };
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
    const result = await this.authService.register(dto);
    return {
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      data: result,
    };
  }

  // POST /customer/auth/login → Đăng nhập tài khoản
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: { phoneOrEmail: string; MatKhau: string }) {
    const result = await this.authService.login(dto);
    return {
      success: true,
      message: 'Đăng nhập thành công!',
      data: result,
    };
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
