import { Controller, Post, Body } from '@nestjs/common';
import { ThongTinDonHangService } from './thong-tin-don-hang.service';

@Controller('customer/thong-tin-don-hang')
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
    return this.orderService.holdSeats(dto);
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
    return this.orderService.createOrder(dto);
  }
}
