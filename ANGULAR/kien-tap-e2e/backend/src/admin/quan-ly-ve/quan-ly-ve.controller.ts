import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { QuanLyVeService } from './quan-ly-ve.service';
import { AdminPermissionsGuard } from '../auth/admin-permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('quan-ly-ve')
@UseGuards(AdminPermissionsGuard)
export class QuanLyVeController {
  constructor(private readonly quanLyVeService: QuanLyVeService) {}

  // GET /quan-ly-ve/stats → Thống kê vé nhanh cho dashboard
  @Get('stats')
  @RequirePermissions('ticket.view')
  async getStats() {
    try {
      return await this.quanLyVeService.getStats();
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Lỗi khi lấy thống kê vé',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /quan-ly-ve → Alias lấy tất cả vé cho frontend gọi ngắn gọn
  @Get()
  @RequirePermissions('ticket.view')
  async getAllVeRoot(@Query('limit') limit?: string) {
    return this.getAllVe(limit);
  }

  // GET /quan-ly-ve/ve → Lấy tất cả vé
  @Get('ve')
  @RequirePermissions('ticket.view')
  async getAllVe(@Query('limit') limit?: string) {
    try {
      const take = limit ? parseInt(limit, 10) : undefined;
      return await this.quanLyVeService.getAllVe(take);
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
  @Get('ve/:id/huy/tinh-phi')
  @RequirePermissions('ticket.cancel')
  async tinhPhiHuyVe(@Param('id') id: string) {
    try {
      return await this.quanLyVeService.tinhPhiHuyVe(id);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Lỗi khi tính phí hủy vé',
          error: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('ve/:id')
  @RequirePermissions('ticket.view')
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
  @RequirePermissions('ticket.view')
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
  @RequirePermissions('ticket.view')
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
  @RequirePermissions('ticket.update')
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
  @Post('ve/:id/xac-nhan-thu-tien')
  @RequirePermissions('ticket.update')
  async xacNhanThuTienMat(
    @Param('id') id: string,
    @Body() dto: { maNVBanVe?: string },
  ) {
    try {
      return await this.quanLyVeService.xacNhanThuTienMat(id, dto?.maNVBanVe);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Lỗi khi xác nhận thu tiền mặt',
          error: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('ve/:id/huy')
  @RequirePermissions('ticket.cancel')
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

  // POST /quan-ly-ve/tao-don-hang → Tạo đơn hàng và vé mới
  @Post('tao-don-hang')
  @RequirePermissions('ticket.sell')
  async taoDonHangVaVe(
    @Body() dto: {
      maKhachHang?: string;
      maNVBanVe?: string;
      hoTenNguoiDi?: string;
      sdtNguoiDi?: string;
      emailNguoiDi?: string;
      maLichTrinh: string;
      maGheChuyenList: string[];
      maDiemDon?: string;
      maDiemTra?: string;
      phuongThucThanhToan: string;
      trangThai?: string;
      ghiChu?: string;
    },
  ) {
    try {
      return await this.quanLyVeService.taoDonHangVaVe(dto);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Lỗi khi tạo đơn hàng',
          error: error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
