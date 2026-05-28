import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { ThanhToanService } from './thanh-toan.service';
import { CustomerExceptionFilter } from '../customer-exception.filter';

@Controller('customer/thanh-toan')
@UseFilters(CustomerExceptionFilter)
export class ThanhToanController {
  constructor(private readonly paymentService: ThanhToanService) {}

  // POST /customer/thanh-toan/create-transaction → Tạo giao dịch thanh toán
  @Post('create-transaction')
  async createTransaction(
    @Body() dto: { MaDonHang: string; PhuongThucThanhToan: string; SoTien: number },
  ) {
    const result = await this.paymentService.createTransaction(dto);
    return {
      success: true,
      message: 'Tạo giao dịch thanh toán thành công!',
      data: result,
    };
  }

  // POST /customer/thanh-toan/callback/success → Xử lý callback thanh toán thành công
  @Post('callback/success')
  async callbackSuccess(@Body() dto: { MaDonHang: string; MaGiaoDich: string }) {
    return this.paymentService.callbackSuccess(dto);
  }

  // POST /customer/thanh-toan/callback/failure → Xử lý callback thanh toán thất bại
  @Post('callback/failure')
  async callbackFailure(@Body() dto: { MaDonHang: string; MaGiaoDich: string }) {
    return this.paymentService.callbackFailure(dto);
  }
}
