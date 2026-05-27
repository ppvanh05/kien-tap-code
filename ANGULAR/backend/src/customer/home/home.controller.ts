import { Controller, Get, Query } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('customer/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  // GET /customer/home/news → Lấy tin tức đang hiển thị (Đã đăng)
  @Get('news')
  async getNews() {
    return this.homeService.getNews();
  }

  // GET /customer/home/policies → Lấy chính sách hoạt động
  @Get('policies')
  async getPolicies(@Query('loai') loai?: string) {
    return this.homeService.getPolicies(loai);
  }

  // GET /customer/home/routes → Lấy danh sách tuyến xe hoạt động
  @Get('routes')
  async getActiveRoutes() {
    return this.homeService.getActiveRoutes();
  }
}
