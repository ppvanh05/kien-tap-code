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
  UseGuards,
} from '@nestjs/common';
import { DieuHanhService } from './dieu-hanh.service';
import { AdminPermissionsGuard } from '../auth/admin-permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('dieu-hanh')
@UseGuards(AdminPermissionsGuard)
export class DieuHanhController {
  constructor(private readonly service: DieuHanhService) {}

  // ==========================================
  // 1. TUYẾN XE (ROUTES)
  // ==========================================
  @Get('tuyen-xe')
  @RequirePermissions('route.view')
  async getRoutes() {
    return this.service.getRoutes();
  }

  @Get('tuyen-xe/:id')
  @RequirePermissions('route.view')
  async getRoute(@Param('id') id: string) {
    return this.service.getRoute(id);
  }

  @Post('tuyen-xe')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('route.manage')
  async createRoute(@Body() data: any) {
    return this.service.createRoute(data);
  }

  @Put('tuyen-xe/:id')
  @RequirePermissions('route.manage')
  async updateRoute(@Param('id') id: string, @Body() data: any) {
    return this.service.updateRoute(id, data);
  }

  @Delete('tuyen-xe/:id')
  @RequirePermissions('route.manage')
  async deleteRoute(@Param('id') id: string) {
    return this.service.deleteRoute(id);
  }

  // ==========================================
  // 2. PHƯƠNG TIỆN (VEHICLES)
  // ==========================================
  @Get('phuong-tien')
  @RequirePermissions('vehicle.manage')
  async getVehicles() {
    return this.service.getVehicles();
  }

  @Get('phuong-tien/:id')
  @RequirePermissions('vehicle.manage')
  async getVehicle(@Param('id') id: string) {
    return this.service.getVehicle(id);
  }

  @Post('phuong-tien')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('vehicle.manage')
  async createVehicle(@Body() data: any) {
    return this.service.createVehicle(data);
  }

  @Put('phuong-tien/:id')
  @RequirePermissions('vehicle.manage')
  async updateVehicle(@Param('id') id: string, @Body() data: any) {
    return this.service.updateVehicle(id, data);
  }

  @Delete('phuong-tien/:id')
  @RequirePermissions('vehicle.manage')
  async deleteVehicle(@Param('id') id: string) {
    return this.service.deleteVehicle(id);
  }

  // ==========================================
  // 3. TÀI XẾ & PHỤ XE (STAFF)
  // ==========================================
  @Get('tai-xe-phu-xe')
  @RequirePermissions('driver.manage')
  async getStaff() {
    return this.service.getStaff();
  }

  @Get('tai-xe-phu-xe/:id')
  @RequirePermissions('driver.manage')
  async getStaffMember(@Param('id') id: string) {
    return this.service.getStaffMember(id);
  }

  @Post('tai-xe-phu-xe')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('driver.manage')
  async createStaffMember(@Body() data: any) {
    return this.service.createStaffMember(data);
  }

  @Put('tai-xe-phu-xe/:id')
  @RequirePermissions('driver.manage')
  async updateStaffMember(@Param('id') id: string, @Body() data: any) {
    return this.service.updateStaffMember(id, data);
  }

  @Delete('tai-xe-phu-xe/:id')
  @RequirePermissions('driver.manage')
  async deleteStaffMember(@Param('id') id: string) {
    return this.service.deleteStaffMember(id);
  }

  // ==========================================
  // 4. ĐIỂM ĐÓN TRẢ DỪNG (POINTS)
  // ==========================================
  @Get('diem-don-tra-dung')
  @RequirePermissions('route.manage')
  async getPoints() {
    return this.service.getPoints();
  }

  @Get('diem-don-tra-dung/:id')
  @RequirePermissions('route.manage')
  async getPoint(@Param('id') id: string) {
    return this.service.getPoint(id);
  }

  @Post('diem-don-tra-dung')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('stop.manage')
  async createPoint(@Body() data: any) {
    return this.service.createPoint(data);
  }

  @Put('diem-don-tra-dung/:id')
  @RequirePermissions('stop.manage')
  async updatePoint(@Param('id') id: string, @Body() data: any) {
    return this.service.updatePoint(id, data);
  }

  @Delete('diem-don-tra-dung/:id')
  @RequirePermissions('stop.manage')
  async deletePoint(@Param('id') id: string) {
    return this.service.deletePoint(id);
  }

  // ==========================================
  // 5. LỊCH TRÌNH (SCHEDULES)
  // ==========================================
  @Get('lich-trinh')
  @RequirePermissions('trip.create')
  async getSchedules() {
    return this.service.getSchedules();
  }

  @Get('lich-trinh/:id')
  @RequirePermissions('trip.create')
  async getSchedule(@Param('id') id: string) {
    return this.service.getSchedule(id);
  }

  @Post('lich-trinh')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('trip.create')
  async createSchedule(@Body() data: any) {
    return this.service.createSchedule(data);
  }

  @Put('lich-trinh/:id')
  @RequirePermissions('trip.update')
  async updateSchedule(@Param('id') id: string, @Body() data: any) {
    return this.service.updateSchedule(id, data);
  }

  @Delete('lich-trinh/:id')
  @RequirePermissions('trip.update')
  async deleteSchedule(@Param('id') id: string) {
    return this.service.deleteSchedule(id);
  }
}
