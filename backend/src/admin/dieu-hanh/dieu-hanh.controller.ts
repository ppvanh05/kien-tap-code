import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { DieuHanhService } from './dieu-hanh.service';

@Controller('dieu-hanh')
export class DieuHanhController {
  constructor(private readonly service: DieuHanhService) {}

  // ==========================================
  // 1. TUYẾN XE (ROUTES)
  // ==========================================
  @Get('tuyen-xe')
  async getRoutes() {
    return this.service.getRoutes();
  }

  @Get('tuyen-xe/:id')
  async getRoute(@Param('id') id: string) {
    return this.service.getRoute(id);
  }

  @Post('tuyen-xe')
  @HttpCode(HttpStatus.CREATED)
  async createRoute(@Body() data: any) {
    return this.service.createRoute(data);
  }

  @Put('tuyen-xe/:id')
  async updateRoute(@Param('id') id: string, @Body() data: any) {
    return this.service.updateRoute(id, data);
  }

  @Delete('tuyen-xe/:id')
  async deleteRoute(@Param('id') id: string) {
    return this.service.deleteRoute(id);
  }

  // ==========================================
  // 2. PHƯƠNG TIỆN (VEHICLES)
  // ==========================================
  @Get('phuong-tien')
  async getVehicles() {
    return this.service.getVehicles();
  }

  @Get('phuong-tien/:id')
  async getVehicle(@Param('id') id: string) {
    return this.service.getVehicle(id);
  }

  @Post('phuong-tien')
  @HttpCode(HttpStatus.CREATED)
  async createVehicle(@Body() data: any) {
    return this.service.createVehicle(data);
  }

  @Put('phuong-tien/:id')
  async updateVehicle(@Param('id') id: string, @Body() data: any) {
    return this.service.updateVehicle(id, data);
  }

  @Delete('phuong-tien/:id')
  async deleteVehicle(@Param('id') id: string) {
    return this.service.deleteVehicle(id);
  }

  // ==========================================
  // 3. TÀI XẾ & PHỤ XE (STAFF)
  // ==========================================
  @Get('tai-xe-phu-xe')
  async getStaff() {
    return this.service.getStaff();
  }

  @Get('tai-xe-phu-xe/:id')
  async getStaffMember(@Param('id') id: string) {
    return this.service.getStaffMember(id);
  }

  @Post('tai-xe-phu-xe')
  @HttpCode(HttpStatus.CREATED)
  async createStaffMember(@Body() data: any) {
    return this.service.createStaffMember(data);
  }

  @Put('tai-xe-phu-xe/:id')
  async updateStaffMember(@Param('id') id: string, @Body() data: any) {
    return this.service.updateStaffMember(id, data);
  }

  @Delete('tai-xe-phu-xe/:id')
  async deleteStaffMember(@Param('id') id: string) {
    return this.service.deleteStaffMember(id);
  }

  // ==========================================
  // 4. ĐIỂM ĐÓN TRẢ DỪNG (POINTS)
  // ==========================================
  @Get('diem-don-tra-dung')
  async getPoints() {
    return this.service.getPoints();
  }

  @Get('diem-don-tra-dung/:id')
  async getPoint(@Param('id') id: string) {
    return this.service.getPoint(id);
  }

  @Post('diem-don-tra-dung')
  @HttpCode(HttpStatus.CREATED)
  async createPoint(@Body() data: any) {
    return this.service.createPoint(data);
  }

  @Put('diem-don-tra-dung/:id')
  async updatePoint(@Param('id') id: string, @Body() data: any) {
    return this.service.updatePoint(id, data);
  }

  @Delete('diem-don-tra-dung/:id')
  async deletePoint(@Param('id') id: string) {
    return this.service.deletePoint(id);
  }

  // ==========================================
  // 5. LỊCH TRÌNH (SCHEDULES)
  // ==========================================
  @Get('lich-trinh')
  async getSchedules() {
    return this.service.getSchedules();
  }

  @Get('lich-trinh/:id')
  async getSchedule(@Param('id') id: string) {
    return this.service.getSchedule(id);
  }

  @Post('lich-trinh')
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(@Body() data: any) {
    return this.service.createSchedule(data);
  }

  @Put('lich-trinh/:id')
  async updateSchedule(@Param('id') id: string, @Body() data: any) {
    return this.service.updateSchedule(id, data);
  }

  @Delete('lich-trinh/:id')
  async deleteSchedule(@Param('id') id: string) {
    return this.service.deleteSchedule(id);
  }
}
