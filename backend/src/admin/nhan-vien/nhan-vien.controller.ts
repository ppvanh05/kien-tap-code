import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NhanVienService } from './nhan-vien.service';
import { Prisma } from '@prisma/client';

@Controller('nhan-vien')
export class NhanVienController {
  constructor(private readonly nhanVienService: NhanVienService) {}

  @Get()
  async getAll() {
    try {
      return await this.nhanVienService.getAll();
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Lỗi khi lấy danh sách nhân viên',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      return await this.nhanVienService.getById(id);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message || 'Không tìm thấy nhân viên',
          error: error,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post()
  async create(@Body() dto: Prisma.NHAN_VIENUncheckedCreateInput) {
    try {
      return await this.nhanVienService.create(dto);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Lỗi khi tạo nhân viên',
          error: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Prisma.NHAN_VIENUncheckedUpdateInput,
  ) {
    try {
      return await this.nhanVienService.update(id, dto);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Lỗi khi cập nhật nhân viên',
          error: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { TrangThai: string },
  ) {
    try {
      return await this.nhanVienService.updateStatus(id, body.TrangThai);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Lỗi khi cập nhật trạng thái',
          error: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.nhanVienService.delete(id);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Lỗi khi xóa nhân viên',
          error: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
