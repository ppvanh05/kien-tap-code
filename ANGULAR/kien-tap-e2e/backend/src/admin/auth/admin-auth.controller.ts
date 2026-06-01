import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminPermissionsGuard } from './admin-permissions.guard';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: { email: string; matKhau: string }) {
    return this.adminAuthService.login(dto);
  }

  @Get('me')
  @UseGuards(AdminPermissionsGuard)
  async getMe(@Req() req: any) {
    return this.adminAuthService.getProfile(req.admin.maNhanVien);
  }

  @Put('me')
  @UseGuards(AdminPermissionsGuard)
  async updateMe(
    @Req() req: any,
    @Body()
    dto: {
      HoVaTenDem?: string;
      Ten?: string;
      TenHienThi?: string;
      GioiTinh?: string;
      NgaySinh?: string | null;
      DiaChi?: string | null;
      SoDienThoai?: string;
      Email?: string;
      AnhDaiDien?: string | null;
      GhiChu?: string | null;
    },
  ) {
    return this.adminAuthService.updateProfile(req.admin.maNhanVien, dto);
  }

  @Post('me/change-password')
  @UseGuards(AdminPermissionsGuard)
  async changePassword(
    @Req() req: any,
    @Body()
    dto: {
      MatKhauCu: string;
      MatKhauMoi: string;
      XacNhanMatKhau: string;
    },
  ) {
    return this.adminAuthService.changePassword(req.admin.maNhanVien, dto);
  }
}
