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
import { ChinhSachService } from './chinh-sach.service';
import { Prisma } from '@prisma/client';
import { AdminPermissionsGuard } from '../auth/admin-permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('admin/chinh-sach')
@UseGuards(AdminPermissionsGuard)
export class ChinhSachController {
  constructor(private readonly chinhSachService: ChinhSachService) {}

  // ===== CHINH_SACH_HUY_VE =====

  @Get('huy-ve/all')
  @RequirePermissions('policy.view')
  getAllChinhSachHuyVe() {
    return this.chinhSachService.getAllChinhSachHuyVe();
  }

  @Get('huy-ve/:id')
  @RequirePermissions('policy.view')
  getChinhSachHuyVeById(@Param('id') id: string) {
    return this.chinhSachService.getChinhSachHuyVeById(id);
  }

  @Post('huy-ve')
  @RequirePermissions('policy.manage')
  createChinhSachHuyVe(@Body() dto: Prisma.CHINH_SACH_HUY_VEUncheckedCreateInput) {
    return this.chinhSachService.createChinhSachHuyVe(dto);
  }

  @Put('huy-ve/:id')
  @RequirePermissions('policy.manage')
  updateChinhSachHuyVe(
    @Param('id') id: string,
    @Body() dto: Prisma.CHINH_SACH_HUY_VEUncheckedUpdateInput,
  ) {
    return this.chinhSachService.updateChinhSachHuyVe(id, dto);
  }

  @Delete('huy-ve/:id')
  @RequirePermissions('policy.manage')
  deleteChinhSachHuyVe(@Param('id') id: string) {
    return this.chinhSachService.deleteChinhSachHuyVe(id);
  }

  // ===== CHINH_SACH =====

  @Get()
  @RequirePermissions('policy.view')
  getAllChinhSach() {
    return this.chinhSachService.getAllChinhSach();
  }

  @Get(':id')
  @RequirePermissions('policy.view')
  getChinhSachById(@Param('id') id: string) {
    return this.chinhSachService.getChinhSachById(id);
  }

  @Post()
  @RequirePermissions('policy.manage')
  createChinhSach(@Body() dto: Prisma.CHINH_SACHUncheckedCreateInput) {
    return this.chinhSachService.createChinhSach(dto);
  }

  @Put(':id')
  @RequirePermissions('policy.manage')
  updateChinhSach(
    @Param('id') id: string,
    @Body() dto: Prisma.CHINH_SACHUncheckedUpdateInput,
  ) {
    return this.chinhSachService.updateChinhSach(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('policy.manage')
  deleteChinhSach(@Param('id') id: string) {
    return this.chinhSachService.deleteChinhSach(id);
  }
}
