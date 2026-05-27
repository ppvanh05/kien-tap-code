import { Controller, Get, Query } from '@nestjs/common';
import { BaoCaoService } from './bao-cao.service';

@Controller('bao-cao')
export class BaoCaoController {
  constructor(private readonly baoCaoService: BaoCaoService) {}

  @Get('chuyen-xe')
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
