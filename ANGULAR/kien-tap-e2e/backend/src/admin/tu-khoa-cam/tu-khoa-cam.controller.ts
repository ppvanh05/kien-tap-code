import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TuKhoaCamService } from './tu-khoa-cam.service';
import { Prisma } from '@prisma/client';
import { AdminPermissionsGuard } from '../auth/admin-permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('tu-khoa-cam')
@UseGuards(AdminPermissionsGuard)
export class TuKhoaCamController {
  constructor(private readonly tuKhoaCamService: TuKhoaCamService) {}

  @Get()
  @RequirePermissions('review.view')
  getAll() {
    return this.tuKhoaCamService.getAll();
  }

  @Get(':id')
  @RequirePermissions('review.view')
  getById(@Param('id') id: string) {
    return this.tuKhoaCamService.getById(id);
  }

  @Post()
  @RequirePermissions('review.manage')
  create(@Body() dto: Prisma.TU_KHOA_HAN_CHEUncheckedCreateInput) {
    return this.tuKhoaCamService.create(dto);
  }

  @Put(':id')
  @RequirePermissions('review.manage')
  update(
    @Param('id') id: string,
    @Body() dto: Prisma.TU_KHOA_HAN_CHEUncheckedUpdateInput,
  ) {
    return this.tuKhoaCamService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('review.manage')
  delete(@Param('id') id: string) {
    return this.tuKhoaCamService.delete(id);
  }
}
