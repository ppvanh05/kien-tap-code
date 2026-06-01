import { Controller, Get, Post, Put, Body, Query, Param, UseGuards, UseFilters } from '@nestjs/common';
import { TraCuuVeService } from './tra-cuu-ve.service';
import { JwtAuthGuard, CurrentUser } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt.helper';
import { CustomerExceptionFilter } from '../customer-exception.filter';

@Controller('customer/tra-cuu-ve')
@UseFilters(CustomerExceptionFilter)
export class TraCuuVeController {
  constructor(private readonly lookupService: TraCuuVeService) {}

  // GET /customer/tra-cuu-ve/lookup → Tra cứu vé không cần đăng nhập (bằng mã vé/đơn + SĐT)
  @Get('lookup')
  async lookup(
    @Query('maDonHang') code: string,
    @Query('soDienThoai') phone: string,
  ) {
    const data = await this.lookupService.lookup(code, phone);
    return {
      success: true,
      message: 'Tra cứu thông tin vé thành công!',
      data,
    };
  }

  // GET /customer/tra-cuu-ve/history → Xem lịch sử đặt vé (cần JWT)
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@CurrentUser() user: JwtPayload) {
    const data = await this.lookupService.getHistory(user.maKhachHang);
    return { success: true, data };
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
    const data = await this.lookupService.updateInfo(maDonHang, dto);
    return {
      success: true,
      message: 'Cập nhật thông tin vé thành công!',
      data,
    };
  }

  // POST /customer/tra-cuu-ve/cancel/:maVe → Hủy vé (tính phí, hoàn tiền, giải phóng ghế)
  @Post('cancel/:maVe')
  async cancelTicket(
    @Param('maVe') maVe: string,
    @Body('lyDo') lyDo: string,
  ) {
    return this.lookupService.cancelTicket(maVe, lyDo);
  }

  // GET /customer/tra-cuu-ve/cancel-policies → Lấy danh sách chính sách hủy vé
  @Get('cancel-policies')
  async getCancelPolicies() {
    const data = await this.lookupService.getCancelPolicies();
    return {
      success: true,
      message: 'Lấy chính sách hủy vé thành công!',
      data,
    };
  }

  // PUT /customer/tra-cuu-ve/update-status/:maDonHang → Cập nhật trạng thái đơn hàng và đồng bộ trạng thái vé
  @Put('update-status/:maDonHang')
  async updateOrderStatus(
    @Param('maDonHang') maDonHang: string,
    @Body('trangThai') trangThai: string,
  ) {
    const data = await this.lookupService.updateOrderStatus(maDonHang, trangThai);
    return {
      success: true,
      message: 'Cập nhật trạng thái đơn hàng và đồng bộ trạng thái vé thành công!',
      data,
    };
  }
}
