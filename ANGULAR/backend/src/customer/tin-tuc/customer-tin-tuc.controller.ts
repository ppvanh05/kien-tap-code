import { Controller, Get, Query, Param, NotFoundException, UseFilters } from '@nestjs/common';
import { CustomerTinTucService } from './customer-tin-tuc.service';
import { CustomerExceptionFilter } from '../customer-exception.filter';

@Controller('customer/tin-tuc')
@UseFilters(CustomerExceptionFilter)
export class CustomerTinTucController {
  constructor(private readonly customerTinTucService: CustomerTinTucService) {}

  @Get()
  async getPublishedNews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('loai') loai?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.customerTinTucService.getPublishedNews({
      page,
      limit,
      loai,
      search,
    });
    return {
      success: true,
      message: 'Lấy danh sách tin tức thành công!',
      data,
    };
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
    return {
      success: true,
      message: 'Lấy chi tiết tin tức thành công!',
      data,
    };
  }
}
