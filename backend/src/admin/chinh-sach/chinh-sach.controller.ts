import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ChinhSachService } from './chinh-sach.service';
import { Prisma } from '@prisma/client';

@Controller('chinh-sach')
export class ChinhSachController {
  constructor(private readonly chinhSachService: ChinhSachService) {}

  // ===== CHINH_SACH_HUY_VE =====

  @Get('huy-ve/all')
  getAllChinhSachHuyVe() {
    return this.chinhSachService.getAllChinhSachHuyVe();
  }

  @Get('huy-ve/:id')
  getChinhSachHuyVeById(@Param('id') id: string) {
    return this.chinhSachService.getChinhSachHuyVeById(id);
  }

  @Post('huy-ve')
  createChinhSachHuyVe(@Body() dto: Prisma.CHINH_SACH_HUY_VEUncheckedCreateInput) {
    return this.chinhSachService.createChinhSachHuyVe(dto);
  }

  @Put('huy-ve/:id')
  updateChinhSachHuyVe(
    @Param('id') id: string,
    @Body() dto: Prisma.CHINH_SACH_HUY_VEUncheckedUpdateInput,
  ) {
    return this.chinhSachService.updateChinhSachHuyVe(id, dto);
  }

  @Delete('huy-ve/:id')
  deleteChinhSachHuyVe(@Param('id') id: string) {
    return this.chinhSachService.deleteChinhSachHuyVe(id);
  }

  // ===== CHINH_SACH =====

  @Get()
  getAllChinhSach() {
    return this.chinhSachService.getAllChinhSach();
  }

  @Get(':id')
  getChinhSachById(@Param('id') id: string) {
    return this.chinhSachService.getChinhSachById(id);
  }

  @Post()
  createChinhSach(@Body() dto: Prisma.CHINH_SACHUncheckedCreateInput) {
    return this.chinhSachService.createChinhSach(dto);
  }

  @Put(':id')
  updateChinhSach(
    @Param('id') id: string,
    @Body() dto: Prisma.CHINH_SACHUncheckedUpdateInput,
  ) {
    return this.chinhSachService.updateChinhSach(id, dto);
  }

  @Delete(':id')
  deleteChinhSach(@Param('id') id: string) {
    return this.chinhSachService.deleteChinhSach(id);
  }
}
