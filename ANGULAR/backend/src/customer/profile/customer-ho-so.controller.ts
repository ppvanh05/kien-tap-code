import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { CustomerHoSoService } from './customer-ho-so.service';

@Controller('customer/ho-so')
export class CustomerHoSoController {
  constructor(private readonly customerHoSoService: CustomerHoSoService) {}

  // 1. GET /customer/ho-so/:id
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.customerHoSoService.getProfile(id);
  }

  // 2. PATCH /customer/ho-so/:id
  @Patch(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.customerHoSoService.updateProfile(id, data);
  }
}
