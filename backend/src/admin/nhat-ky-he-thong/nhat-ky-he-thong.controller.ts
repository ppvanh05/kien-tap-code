import { Controller, Get, Post, Body } from '@nestjs/common';
import { NhatKyHeThongService } from './nhat-ky-he-thong.service';

@Controller('nhat-ky')
export class NhatKyHeThongController {
  constructor(private readonly nhatKyService: NhatKyHeThongService) {}

  @Get()
  getAll() {
    return this.nhatKyService.getAll();
  }

  @Post()
  ghiLog(
    @Body()
    body: {
      MaKhachHang?: string;
      MaNhanVien?: string;
      LoaiThaoTac: string;
      NoiDungChiTiet: string;
      DiaChiIP?: string;
      MaVe?: string;
      TuyenXe?: string;
      TrangThai?: 'Thành công' | 'Thất bại';
      ThietBiTrinhDuyet?: string;
      TrangThaiCu?: string;
      TrangThaiMoi?: string;
      DuLieuThayDoi?: any;
    },
  ) {
    return this.nhatKyService.ghiLog(body);
  }
}
