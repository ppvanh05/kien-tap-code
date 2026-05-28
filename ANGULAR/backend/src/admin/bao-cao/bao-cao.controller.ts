import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BaoCaoService } from './bao-cao.service';
import { AdminPermissionsGuard } from '../auth/admin-permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('bao-cao')
@UseGuards(AdminPermissionsGuard)
export class BaoCaoController {
  constructor(private readonly baoCaoService: BaoCaoService) {}

  @Get('chuyen-xe')
  @RequirePermissions('report.view')
  getBaoCaoChuyenXe(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('route') route?: string,
    @Query('licensePlate') licensePlate?: string,
    @Query('status') status?: string,
  ) {
    return this.baoCaoService.getBaoCaoChuyenXe({
      fromDate,
      toDate,
      route,
      licensePlate,
      status,
    });
  }

  @Get('hoan-huy')
  @RequirePermissions('report.view')
  getBaoCaoHoanHuy(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('nguoiHuy') nguoiHuy?: string,
  ) {
    return this.baoCaoService.getBaoCaoHoanHuy({
      fromDate,
      toDate,
      nguoiHuy,
    });
  }

  @Get('khach-hang')
  @RequirePermissions('report.view')
  getBaoCaoKhachHang(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('status') status?: string,
    @Query('searchTerm') searchTerm?: string,
  ) {
    return this.baoCaoService.getBaoCaoKhachHang({
      fromDate,
      toDate,
      status,
      searchTerm,
    });
  }

  @Get('tai-xe-phu-xe')
  @RequirePermissions('report.view')
  getBaoCaoTaiXePhuXe(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('searchTerm') searchTerm?: string,
  ) {
    return this.baoCaoService.getBaoCaoTaiXePhuXe({
      role,
      status,
      searchTerm,
    });
  }

  @Get('tuyen-xe')
  @RequirePermissions('report.view')
  getBaoCaoTuyenXe(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('route') route?: string,
    @Query('status') status?: string,
  ) {
    return this.baoCaoService.getBaoCaoTuyenXe({
      fromDate,
      toDate,
      route,
      status,
    });
  }
}
