import { Controller, Get, Post, Put, Body, Query, Param, UseGuards } from '@nestjs/common';
import { TraCuuVeService } from './tra-cuu-ve.service';
import { JwtAuthGuard, CurrentUser } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt.helper';

@Controller('customer/tra-cuu-ve')
export class TraCuuVeController {
  constructor(private readonly lookupService: TraCuuVeService) {}

  // GET /customer/tra-cuu-ve/lookup → Tra cứu vé không cần đăng nhập (bằng mã vé/đơn + SĐT)
  @Get('lookup')
  async lookup(
    @Query('code') code: string,
    @Query('phone') phone: string,
  ) {
    return this.lookupService.lookup(code, phone);
  }

  // GET /customer/tra-cuu-ve/history → Xem lịch sử đặt vé (cần JWT)
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@CurrentUser() user: JwtPayload) {
    return this.lookupService.getHistory(user.maKhachHang);
  }

  // PUT /customer/tra-cuu-ve/update-info/:maDonHang → Sửa thông tin vé (tối đa 2 lần, trước khởi hành 2 tiếng)
  @Put('update-info/:maDonHang')
  async updateInfo(
    @Param('maDonHang') maDonHang: string,
    @Body()
    dto: {
      HoTenNguoiDi: string;
      SdtNguoiDi: string;
      EmailNguoiDi?: string;
      MaDiemDon: string;
      MaDiemTra: string;
    },
  ) {
    return this.lookupService.updateInfo(maDonHang, dto);
  }

  // POST /customer/tra-cuu-ve/cancel/:maVe → Hủy vé (tính phí, hoàn tiền, giải phóng ghế)
  @Post('cancel/:maVe')
  async cancelTicket(
    @Param('maVe') maVe: string,
    @Body('lyDo') lyDo: string,
  ) {
    return this.lookupService.cancelTicket(maVe, lyDo);
  }
}
