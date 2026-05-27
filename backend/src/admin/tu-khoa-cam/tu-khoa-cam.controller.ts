import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { TuKhoaCamService } from './tu-khoa-cam.service';
import { Prisma } from '@prisma/client';

@Controller('tu-khoa-cam')
export class TuKhoaCamController {
  constructor(private readonly tuKhoaCamService: TuKhoaCamService) {}

  @Get()
  getAll() {
    return this.tuKhoaCamService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.tuKhoaCamService.getById(id);
  }

  @Post()
  create(@Body() dto: Prisma.TU_KHOA_HAN_CHEUncheckedCreateInput) {
    return this.tuKhoaCamService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Prisma.TU_KHOA_HAN_CHEUncheckedUpdateInput,
  ) {
    return this.tuKhoaCamService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tuKhoaCamService.delete(id);
  }
}
