import {
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ChinhSachService } from './chinh-sach.service';

@Controller('chinh-sach')
export class ChinhSachController {
  constructor(private readonly chinhSachService: ChinhSachService) {}

  @Get('huy-ve/all')
  async getAllActiveHuyVe() {
    const data = await this.chinhSachService.findAllActiveHuyVe();
    return { success: true, data };
  }

  @Get()
  async getAllActive() {
    const data = await this.chinhSachService.findAllActive();
    return { success: true, data };
  }

  @Get(':id')
  async getActiveById(@Param('id') id: string) {
    const data = await this.chinhSachService.findActiveById(id);
    if (!data) {
      throw new NotFoundException(
        `Chính sách ${id} không tồn tại hoặc không còn áp dụng.`,
      );
    }
    return { success: true, data };
  }
}
