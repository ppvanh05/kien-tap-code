import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TimKiemChuyenXeService {
  constructor(private prisma: PrismaService) {}

  // Helper to parse date string formatted as dd/mm/yyyy or yyyy-mm-dd
  private parseSearchDate(dateStr: string): Date {
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date(dateStr);
  }

  // Helper to ensure GHE_CHUYEN_XE records exist for a schedule. If not, auto-create them from vehicle GHE template.
  async checkAndInitializeSeats(scheduleId: string, vehicleId: string, basePrice: number) {
    const existing = await this.prisma.gHE_CHUYEN_XE.findMany({
      where: { MaLichTrinh: scheduleId },
    });

    if (existing.length > 0) {
      return existing;
    }

    // Fetch template seats from vehicle
    const seats = await this.prisma.gHE.findMany({
      where: { MaXe: vehicleId },
    });

    if (seats.length === 0) {
      // If vehicle has no GHE template, let's create a default 22-seat layout
      const defaultSeats = [];
      const lowerNames = ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A'];
      const upperNames = ['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B'];

      // Helper to batch create GHE templates first
      for (const name of lowerNames) {
        const gheId = `${vehicleId}_GHE_${name}`;
        await this.prisma.gHE.upsert({
          where: { MaGhe: gheId },
          update: {},
          create: {
            MaGhe: gheId,
            MaXe: vehicleId,
            SoGhe: name,
            TangGhe: 1,
            DayGhe: 'A',
          },
        });
        defaultSeats.push({ MaGhe: gheId });
      }

      for (const name of upperNames) {
        const gheId = `${vehicleId}_GHE_${name}`;
        await this.prisma.gHE.upsert({
          where: { MaGhe: gheId },
          update: {},
          create: {
            MaGhe: gheId,
            MaXe: vehicleId,
            SoGhe: name,
            TangGhe: 2,
            DayGhe: 'B',
          },
        });
        defaultSeats.push({ MaGhe: gheId });
      }

      // Now create GHE_CHUYEN_XE entries
      const created = [];
      for (const ghe of defaultSeats) {
        const gheChuyenId = `${scheduleId}_${ghe.MaGhe}`;
        const record = await this.prisma.gHE_CHUYEN_XE.create({
          data: {
            MaGheChuyen: gheChuyenId,
            NhomGhe: 'Limousine',
            GiaVe: basePrice,
            TrangThaiGhe: 'Trong',
            ThoiGianCapNhatTrangThai: new Date(),
            MaLichTrinh: scheduleId,
            MaGhe: ghe.MaGhe,
          },
        });
        created.push(record);
      }
      return created;
    }

    // Auto-create from existing vehicle GHE templates
    const created = [];
    for (const seat of seats) {
      const gheChuyenId = `${scheduleId}_${seat.MaGhe}`;
      const record = await this.prisma.gHE_CHUYEN_XE.create({
        data: {
          MaGheChuyen: gheChuyenId,
          NhomGhe: 'Limousine',
          GiaVe: basePrice,
          TrangThaiGhe: 'Trong',
          ThoiGianCapNhatTrangThai: new Date(),
          MaLichTrinh: scheduleId,
          MaGhe: seat.MaGhe,
        },
      });
      created.push(record);
    }
    return created;
  }

  // ===== SEARCH TRIPS =====
  async searchTrips(dto: { departure: string; destination: string; date: string }) {
    const searchDate = this.parseSearchDate(dto.date);
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find schedules matching date and route (insensitive search)
    const schedules = await this.prisma.lICH_TRINH.findMany({
      where: {
        NgayKhoiHanh: {
          gte: startOfDay,
          lte: endOfDay,
        },
        TrangThai: {
          notIn: ['DaHuy', 'Cancelled'],
        },
        TUYEN_XE: {
          DiemKhoiHanh: { contains: dto.departure, mode: 'insensitive' },
          DiemDen: { contains: dto.destination, mode: 'insensitive' },
        },
      },
      include: {
        TUYEN_XE: true,
        PHUONG_TIEN: true,
      },
    });

    const results = [];

    for (const schedule of schedules) {
      // Auto initialize seats if empty
      const seats = await this.checkAndInitializeSeats(
        schedule.MaLichTrinh,
        schedule.MaXe,
        schedule.GiaVeCoBan.toNumber(),
      );

      // Count available seats
      const availableSeats = seats.filter(s => s.TrangThaiGhe === 'Trong').length;

      // Only return trips that still have available seats
      if (availableSeats > 0) {
        results.push({
          MaLichTrinh: schedule.MaLichTrinh,
          NgayKhoiHanh: schedule.NgayKhoiHanh,
          GioKhoiHanh: schedule.GioKhoiHanh,
          GioGoiYCoMat: schedule.GioGoiYCoMat,
          GioDenDuKien: schedule.GioDenDuKien,
          GiaVeCoBan: schedule.GiaVeCoBan,
          TrangThai: schedule.TrangThai,
          availableSeats,
          tuyenXe: schedule.TUYEN_XE,
          phuongTien: schedule.PHUONG_TIEN,
        });
      }
    }

    return results;
  }

  // ===== GET TRIP DETAIL =====
  async getTripDetail(id: string) {
    const schedule = await this.prisma.lICH_TRINH.findUnique({
      where: { MaLichTrinh: id },
      include: {
        TUYEN_XE: true,
        PHUONG_TIEN: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Không tìm thấy chuyến xe với mã ${id}`);
    }

    // Auto initialize seats if empty
    await this.checkAndInitializeSeats(
      schedule.MaLichTrinh,
      schedule.MaXe,
      schedule.GiaVeCoBan.toNumber(),
    );

    // Fetch seats details with their layout templates
    const seats = await this.prisma.gHE_CHUYEN_XE.findMany({
      where: { MaLichTrinh: id },
      include: {
        GHE: true,
      },
      orderBy: {
        GHE: { SoGhe: 'asc' },
      },
    });

    // Fetch station timetable stops
    const stops = await this.prisma.lICH_TRINH_DIEM_DUNG.findMany({
      where: { MaLichTrinh: id },
      include: {
        DIEM_DON_TRA_DUNG: true,
      },
      orderBy: {
        ThuTuDung: 'asc',
      },
    });

    return {
      MaLichTrinh: schedule.MaLichTrinh,
      NgayKhoiHanh: schedule.NgayKhoiHanh,
      GioKhoiHanh: schedule.GioKhoiHanh,
      GioGoiYCoMat: schedule.GioGoiYCoMat,
      GioDenDuKien: schedule.GioDenDuKien,
      GiaVeCoBan: schedule.GiaVeCoBan,
      TrangThai: schedule.TrangThai,
      tuyenXe: schedule.TUYEN_XE,
      phuongTien: schedule.PHUONG_TIEN,
      gheChuyenXe: seats.map(s => ({
        MaGheChuyen: s.MaGheChuyen,
        NhomGhe: s.NhomGhe,
        GiaVe: s.GiaVe,
        TrangThaiGhe: s.TrangThaiGhe,
        ThoiGianCapNhatTrangThai: s.ThoiGianCapNhatTrangThai,
        SoGhe: s.GHE?.SoGhe,
        TangGhe: s.GHE?.TangGhe,
        DayGhe: s.GHE?.DayGhe,
      })),
      diemDungLichTrinh: stops.map(stop => ({
        MaLichTrinhDiemDung: stop.MaLichTrinhDiemDung,
        ThuTuDung: stop.ThuTuDung,
        GioDenDuKien: stop.GioDenDuKien,
        GhiChu: stop.GhiChu,
        MaDiem: stop.DIEM_DON_TRA_DUNG?.MaDiem,
        TenDiem: stop.DIEM_DON_TRA_DUNG?.TenDiem,
        DiaChi: stop.DIEM_DON_TRA_DUNG?.DiaChi,
        ThanhPho: stop.DIEM_DON_TRA_DUNG?.ThanhPho,
        Tinh: stop.DIEM_DON_TRA_DUNG?.Tinh,
        LoaiDiem: stop.DIEM_DON_TRA_DUNG?.LoaiDiem,
      })),
    };
  }
}
