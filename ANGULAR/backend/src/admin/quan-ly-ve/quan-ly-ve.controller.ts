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
} from '@nestjs/common';
import { QuanLyVeService } from './quan-ly-ve.service';

@Controller('quan-ly-ve')
export class QuanLyVeController {
  constructor(private readonly quanLyVeService: QuanLyVeService) {}

  // GET /quan-ly-ve/ve → Lấy tất cả vé
  @Get('ve')
  async getAllVe() {
    try {
      return await this.quanLyVeService.getAllVe();
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Lỗi khi lấy danh sách vé',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /quan-ly-ve/ve/:id → Lấy vé theo mã
  @Get('ve/:id')
  async getVeById(@Param('id') id: string) {
    try {
      return await this.quanLyVeService.getVeById(id);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message || 'Không tìm thấy vé',
          error: error,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // GET /quan-ly-ve/don-hang → Lấy tất cả đơn hàng
  @Get('don-hang')
  async getAllDonHang() {
    try {
      return await this.quanLyVeService.getAllDonHang();
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Lỗi khi lấy danh sách đơn hàng',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /quan-ly-ve/don-hang/:id → Lấy đơn hàng theo mã
  @Get('don-hang/:id')
  async getDonHangById(@Param('id') id: string) {
    try {
      return await this.quanLyVeService.getDonHangById(id);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message || 'Không tìm thấy đơn hàng',
          error: error,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // PATCH /quan-ly-ve/ve/:id/trang-thai → Cập nhật trạng thái vé
  @Patch('ve/:id/trang-thai')
  async updateTrangThaiVe(
    @Param('id') id: string,
    @Body() dto: { trangThai: string; maNhanVien?: string },
  ) {
    try {
      return await this.quanLyVeService.updateTrangThaiVe(id, dto.trangThai, dto.maNhanVien);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Lỗi khi cập nhật trạng thái vé',
          error: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // POST /quan-ly-ve/ve/:id/huy → Huỷ vé
  @Post('ve/:id/huy')
  async huyVe(
    @Param('id') id: string,
    @Body() dto: { lyDo: string; maNVBanVe?: string },
  ) {
    try {
      return await this.quanLyVeService.huyVe(id, dto.lyDo, dto.maNVBanVe);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Lỗi khi huỷ vé',
          error: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
