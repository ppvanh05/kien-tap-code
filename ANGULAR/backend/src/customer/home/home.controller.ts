import { Controller, Get, Query, UseFilters } from '@nestjs/common';
import { HomeService } from './home.service';
import { CustomerExceptionFilter } from '../customer-exception.filter';

@Controller('customer/home')
@UseFilters(CustomerExceptionFilter)
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  // GET /customer/home/news → Lấy tin tức đang hiển thị (Đã đăng)
  @Get('news')
  async getNews() {
    const data = await this.homeService.getNews();
    return {
      success: true,
      message: 'Lấy tin tức thành công!',
      data,
    };
  }

  // GET /customer/home/policies → Lấy chính sách hoạt động
  @Get('policies')
  async getPolicies(@Query('loai') loai?: string) {
    const data = await this.homeService.getPolicies(loai);
    return {
      success: true,
      message: 'Lấy chính sách thành công!',
      data,
    };
  }

  // GET /customer/home/routes → Lấy danh sách tuyến xe hoạt động
  @Get('routes')
  async getActiveRoutes() {
    const data = await this.homeService.getActiveRoutes();
    return {
      success: true,
      message: 'Lấy danh sách tuyến xe thành công!',
      data,
    };
  }
}
