import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { NhatKyHeThongService } from './nhat-ky-he-thong.service';
import { AdminPermissionsGuard } from '../auth/admin-permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('nhat-ky')
@UseGuards(AdminPermissionsGuard)
export class NhatKyHeThongController {
  constructor(private readonly nhatKyService: NhatKyHeThongService) {}

  @Get()
  @RequirePermissions('log.view')
  getAll() {
    return this.nhatKyService.getAll();
  }

  @Post()
  @RequirePermissions('log.view')
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
      TrangThai?: 'ThanhCong' | 'ThatBai' | 'Thành công' | 'Thất bại';
      ThietBiTrinhDuyet?: string;
      TrangThaiCu?: string;
      TrangThaiMoi?: string;
      DuLieuThayDoi?: any;
    },
  ) {
    return this.nhatKyService.ghiLog(body);
  }
}
