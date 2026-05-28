import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { KhachHangService } from './khach-hang.service';
import { Prisma } from '@prisma/client';
import { AdminPermissionsGuard } from '../auth/admin-permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('khach-hang')
@UseGuards(AdminPermissionsGuard)
export class KhachHangController {
  constructor(private readonly khachHangService: KhachHangService) {}

  // POST /khach-hang → Tạo mới khách hàng
  @Post()
  @RequirePermissions('customer.manage')
  async create(@Body() dto: Prisma.KHACH_HANGCreateInput) {
    try {
      return await this.khachHangService.create(dto);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Lỗi khi tạo khách hàng',
          error: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET /khach-hang → Lấy tất cả khách hàng
  @Get()
  @RequirePermissions('customer.view')
  async getAll() {
    try {
      return await this.khachHangService.getAll();
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Lỗi khi lấy danh sách khách hàng',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /khach-hang/trang-thai/:trangThai → Lọc theo trạng thái (HoatDong | DaKhoa)
  @Get('trang-thai/:trangThai')
  @RequirePermissions('customer.view')
  async getByTrangThai(@Param('trangThai') trangThai: string) {
    try {
      return await this.khachHangService.getByTrangThai(trangThai);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Lỗi khi lọc khách hàng theo trạng thái',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /khach-hang/:id → Lấy thông tin 1 khách hàng
  @Get(':id')
  @RequirePermissions('customer.view')
  async getById(@Param('id') id: string) {
    try {
      return await this.khachHangService.getById(id);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message || 'Không tìm thấy khách hàng',
          error: error,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // GET /khach-hang/:id/ve → Lịch sử vé của khách hàng
  @Get(':id/ve')
  @RequirePermissions('customer.view')
  async getVe(@Param('id') id: string) {
    try {
      return await this.khachHangService.getVeByKhachHang(id);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Lỗi khi lấy lịch sử vé',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /khach-hang/:id/nhat-ky → Nhật ký hoạt động của khách hàng
  @Get(':id/nhat-ky')
  @RequirePermissions('customer.view')
  async getNhatKy(@Param('id') id: string) {
    try {
      return await this.khachHangService.getNhatKyByKhachHang(id);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Lỗi khi lấy nhật ký hoạt động',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // PUT /khach-hang/:id → Cập nhật thông tin cơ bản
  @Put(':id')
  @RequirePermissions('customer.manage')
  async update(@Param('id') id: string, @Body() dto: Prisma.KHACH_HANGUncheckedUpdateInput) {
    try {
      return await this.khachHangService.update(id, dto);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Lỗi khi cập nhật khách hàng',
          error: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // PATCH /khach-hang/:id/khoa → Khóa tài khoản (cần lý do)
  @Patch(':id/khoa')
  @RequirePermissions('customer.manage')
  async khoaTaiKhoan(@Param('id') id: string, @Body() dto: { LyDoKhoa: string }) {
    try {
      return await this.khachHangService.khoaTaiKhoan(id, dto);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Lỗi khi khóa tài khoản',
          error: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // PATCH /khach-hang/:id/mo-khoa → Mở khóa tài khoản
  @Patch(':id/mo-khoa')
  @RequirePermissions('customer.manage')
  async moKhoaTaiKhoan(@Param('id') id: string) {
    try {
      return await this.khachHangService.moKhoaTaiKhoan(id);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Lỗi khi mở khóa tài khoản',
          error: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
