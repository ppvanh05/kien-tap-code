import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { ThongTinDonHangService } from './thong-tin-don-hang.service';
import { CustomerExceptionFilter } from '../customer-exception.filter';

@Controller('customer/thong-tin-don-hang')
@UseFilters(CustomerExceptionFilter)
export class ThongTinDonHangController {
  constructor(private readonly orderService: ThongTinDonHangService) {}

  // POST /customer/thong-tin-don-hang/hold-seats → Giữ ghế tạm thời 15 phút
  @Post('hold-seats')
  async holdSeats(
    @Body()
    dto: {
      MaLichTrinh: string;
      DanhSachMaGheChuyen: string[];
      MaKhachHang?: string;
    },
  ) {
    const data = await this.orderService.holdSeats(dto);
    return {
      success: true,
      message: 'Giữ ghế thành công!',
      data,
    };
  }

  // POST /customer/thong-tin-don-hang/create-order → Tạo đơn hàng kèm vé điện tử
  @Post('create-order')
  async createOrder(
    @Body()
    dto: {
      MaKhachHang: string;
      MaLichTrinh: string;
      DanhSachMaGheChuyen: string[];
      HoTenNguoiDi: string;
      SdtNguoiDi: string;
      EmailNguoiDi?: string;
      MaDiemDon: string;
      MaDiemTra: string;
      PhuongThucThanhToan: string;
    },
  ) {
    const data = await this.orderService.createOrder(dto);
    return {
      success: true,
      message: 'Tạo đơn đặt vé thành công!',
      data,
    };
  }
}
