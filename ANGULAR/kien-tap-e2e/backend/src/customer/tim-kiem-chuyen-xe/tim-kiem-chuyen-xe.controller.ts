import { Controller, Get, Query, Param, UseFilters, Post, Body } from '@nestjs/common';
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

  // POST /customer/tim-kiem-chuyen-xe/reserve → Reserve (hold) seats for a short time
  @Post('reserve')
  async reserveSeats(@Body() body: { maLichTrinh: string; seats: string[]; sessionId?: string }) {
    const data = await this.searchService.reserveSeats(body);
    return data;
  }

  // POST /customer/tim-kiem-chuyen-xe/release → Release previously held seats
  @Post('release')
  async releaseSeats(@Body() body: { maLichTrinh: string; seats: string[]; sessionId?: string }) {
    const data = await this.searchService.releaseSeats(body);
    return data;
  }

  // POST /customer/tim-kiem-chuyen-xe/finalize → Finalize seats when payment succeeds
  @Post('finalize')
  async finalizeSeats(@Body() body: { maLichTrinh: string; seats: string[]; sessionId?: string }) {
    const data = await this.searchService.finalizeSeats(body);
    return data;
  }
}
