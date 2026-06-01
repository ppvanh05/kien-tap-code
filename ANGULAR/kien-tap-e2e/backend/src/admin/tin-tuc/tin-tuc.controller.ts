import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TinTucService } from './tin-tuc.service';
import { Prisma } from '@prisma/client';
import { AdminPermissionsGuard } from '../auth/admin-permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('tin-tuc')
@UseGuards(AdminPermissionsGuard)
export class TinTucController {
  constructor(private readonly tinTucService: TinTucService) {}

  // GET /tin-tuc → Lấy tất cả tin tức
  @Get()
  @RequirePermissions('news.view')
  getAll() {
    return this.tinTucService.getAll();
  }

  // GET /tin-tuc/trang-thai/:trangThai → Lọc theo trạng thái
  @Get('trang-thai/:trangThai')
  @RequirePermissions('news.view')
  getByTrangThai(@Param('trangThai') trangThai: string) {
    return this.tinTucService.getByTrangThai(trangThai);
  }

  // GET /tin-tuc/loai/:loai → Lọc theo loại tin tức
  @Get('loai/:loai')
  @RequirePermissions('news.view')
  getByLoai(@Param('loai') loai: string) {
    return this.tinTucService.getByLoai(loai);
  }

  // GET /tin-tuc/:id → Lấy 1 tin tức theo mã
  @Get(':id')
  @RequirePermissions('news.view')
  getById(@Param('id') id: string) {
    return this.tinTucService.getById(id);
  }

  // POST /tin-tuc → Tạo mới tin tức
  @Post()
  @RequirePermissions('news.manage')
  create(@Body() dto: Prisma.TIN_TUCUncheckedCreateInput) {
    return this.tinTucService.create(dto);
  }

  // PUT /tin-tuc/:id → Cập nhật toàn bộ tin tức
  @Put(':id')
  @RequirePermissions('news.manage')
  update(@Param('id') id: string, @Body() dto: Prisma.TIN_TUCUncheckedUpdateInput) {
    return this.tinTucService.update(id, dto);
  }

  // PATCH /tin-tuc/:id/trang-thai → Chỉ cập nhật trạng thái
  @Patch(':id/trang-thai')
  @RequirePermissions('news.manage')
  updateTrangThai(
    @Param('id') id: string,
    @Body('trangThai') trangThai: string,
  ) {
    return this.tinTucService.updateTrangThai(id, trangThai);
  }

  // DELETE /tin-tuc/:id → Xóa tin tức
  @Delete(':id')
  @RequirePermissions('news.manage')
  delete(@Param('id') id: string) {
    return this.tinTucService.delete(id);
  }
}
