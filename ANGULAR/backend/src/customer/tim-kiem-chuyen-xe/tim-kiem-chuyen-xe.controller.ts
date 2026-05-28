import { Controller, Get, Query, Param, UseFilters } from '@nestjs/common';
import { TimKiemChuyenXeService } from './tim-kiem-chuyen-xe.service';
import { CustomerExceptionFilter } from '../customer-exception.filter';

@Controller('customer/tim-kiem-chuyen-xe')
@UseFilters(CustomerExceptionFilter)
export class TimKiemChuyenXeController {
  constructor(private readonly searchService: TimKiemChuyenXeService) {}

  // GET /customer/tim-kiem-chuyen-xe/search → Tìm chuyến xe theo điểm đi, điểm đến, ngày
  @Get('search')
  async searchTrips(
    @Query('departure') departure: string,
    @Query('destination') destination: string,
    @Query('date') date: string,
  ) {
    const data = await this.searchService.searchTrips({ departure, destination, date });
    return {
      success: true,
      message: 'Tìm kiếm chuyến xe thành công!',
      data,
    };
  }

  // GET /customer/tim-kiem-chuyen-xe/detail/:id → Lấy chi tiết chuyến kèm sơ đồ ghế và danh sách đón trả
  @Get('detail/:id')
  async getTripDetail(@Param('id') id: string) {
    const data = await this.searchService.getTripDetail(id);
    return {
      success: true,
      message: 'Lấy chi tiết chuyến xe thành công!',
      data,
    };
  }
}
