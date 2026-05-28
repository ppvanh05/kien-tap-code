import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { CustomerTinTucService } from './customer-tin-tuc.service';

@Controller('customer/tin-tuc')
export class CustomerTinTucController {
  constructor(private readonly customerTinTucService: CustomerTinTucService) {}

  @Get()
  async getPublishedNews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('loai') loai?: string,
    @Query('search') search?: string,
  ) {
    return this.customerTinTucService.getPublishedNews({
      page,
      limit,
      loai,
      search,
    });
  }

  @Get('home')
  async getHomeNews() {
    // Return 3 latest published news for home page
    return this.customerTinTucService.getHomeNews();
  }

  @Get(':id')
  async getNewsById(@Param('id') id: string) {
    const data = await this.customerTinTucService.getNewsById(id);
    if (!data) {
      throw new NotFoundException(`News article with ID ${id} not found or not published.`);
    }
    return data;
  }
}
