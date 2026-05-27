import { Controller, Get, Query, Param } from '@nestjs/common';
import { TimKiemChuyenXeService } from './tim-kiem-chuyen-xe.service';

@Controller('customer/tim-kiem-chuyen-xe')
export class TimKiemChuyenXeController {
  constructor(private readonly searchService: TimKiemChuyenXeService) {}

  // GET /customer/tim-kiem-chuyen-xe/search → Tìm chuyến xe theo điểm đi, điểm đến, ngày
  @Get('search')
  async searchTrips(
    @Query('departure') departure: string,
    @Query('destination') destination: string,
    @Query('date') date: string,
  ) {
    return this.searchService.searchTrips({ departure, destination, date });
  }

  // GET /customer/tim-kiem-chuyen-xe/detail/:id → Lấy chi tiết chuyến kèm sơ đồ ghế và danh sách đón trả
  @Get('detail/:id')
  async getTripDetail(@Param('id') id: string) {
    return this.searchService.getTripDetail(id);
  }
}
