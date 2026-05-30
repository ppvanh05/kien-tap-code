import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrangThaiGhe, TrangThaiLichTrinh, Prisma } from '@prisma/client';

@Injectable()
export class TimKiemChuyenXeService {
  constructor(private prisma: PrismaService) {}

  private buildSearchDayRange(dateStr?: string): {
    startDate: Date;
    endDate: Date;
    queryStartDate: Date;
    queryEndDate: Date;
    dateKey: string;
  } | null {
    if (!dateStr?.trim()) {
      return null;
    }

    if (dateStr.includes('/')) {
      const [dayRaw, monthRaw, yearRaw] = dateStr.split('/');
      const day = Number(dayRaw);
      const month = Number(monthRaw);
      const year = Number(yearRaw);
      if (!day || !month || !year) {
        return null;
      }

      const startDate = new Date(Date.UTC(year, month - 1, day));
      const endDate = new Date(Date.UTC(year, month - 1, day + 1));
      const queryStartDate = new Date(Date.UTC(year, month - 1, day - 1));
      const queryEndDate = new Date(Date.UTC(year, month - 1, day + 2));

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return null;
      }

      return {
        startDate,
        endDate,
        queryStartDate,
        queryEndDate,
        dateKey: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
      };
    }

    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    const year = parsed.getUTCFullYear();
    const month = parsed.getUTCMonth() + 1;
    const day = parsed.getUTCDate();
    const startDate = new Date(Date.UTC(year, month - 1, day));
    const endDate = new Date(Date.UTC(year, month - 1, day + 1));
    const queryStartDate = new Date(Date.UTC(year, month - 1, day - 1));
    const queryEndDate = new Date(Date.UTC(year, month - 1, day + 2));

    return {
      startDate,
      endDate,
      queryStartDate,
      queryEndDate,
      dateKey: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
    };
  }

  private toDateKeyFromDbDate(date: Date): string {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  private matchesSearchDate(
    ngayKhoiHanh: Date,
    dayRange: { startDate: Date; endDate: Date; dateKey: string },
  ): boolean {
    const dateKey = this.toDateKeyFromDbDate(ngayKhoiHanh);
    const inUtcRange = ngayKhoiHanh >= dayRange.startDate && ngayKhoiHanh < dayRange.endDate;
    return dateKey === dayRange.dateKey || inUtcRange;
  }

  private normalizeSearchText(value?: string | null): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }

  private matchRoutePoint(stored?: string | null, keyword?: string): boolean {
    if (!keyword?.trim()) {
      return true;
    }

    const normalizedStored = this.normalizeSearchText(stored);
    const normalizedKeyword = this.normalizeSearchText(keyword);

    return (
      normalizedStored === normalizedKeyword ||
      normalizedStored.includes(normalizedKeyword) ||
      normalizedKeyword.includes(normalizedStored)
    );
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
        const gheId = name;
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
        const gheId = name;
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
            TrangThaiGhe: TrangThaiGhe.Trong,
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
      const gheChuyenId = `${scheduleId}_${seat.SoGhe}`;
      const record = await this.prisma.gHE_CHUYEN_XE.create({
        data: {
          MaGheChuyen: gheChuyenId,
          NhomGhe: 'Limousine',
          GiaVe: basePrice,
          TrangThaiGhe: TrangThaiGhe.Trong,
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
  async searchTrips(dto: { departure?: string; destination?: string; date?: string }) {
    const dayRange = this.buildSearchDayRange(dto.date);

console.log('[searchTrips] raw params:', {
      departure: dto.departure,
      destination: dto.destination,
      date: dto.date,
    });
    console.log('[searchTrips] startDate:', dayRange?.startDate?.toISOString());
    console.log('[searchTrips] endDate:', dayRange?.endDate?.toISOString());
    console.log('[searchTrips] dateKey:', dayRange?.dateKey);

    const schedulesByDate = await this.prisma.lICH_TRINH.findMany({
      where: {
        ...(dayRange
          ? {
              NgayKhoiHanh: {
                gte: dayRange.queryStartDate,
                lt: dayRange.queryEndDate,
              },
            }
          : {}),
        TrangThaiLichTrinh: {
          notIn: [TrangThaiLichTrinh.DaKhoa],
        },
      },
    }
      include: {
        TUYEN_XE: true,
        PHUONG_TIEN: true,
      },
    });

    const schedulesMatchingDate = dayRange
      ? schedulesByDate.filter((schedule) => this.matchesSearchDate(schedule.NgayKhoiHanh, dayRange))
      : schedulesByDate;

    console.log('[searchTrips] schedules by date (prisma):', schedulesByDate.length);
    console.log('[searchTrips] schedules by date (matched):', schedulesMatchingDate.length);
    schedulesMatchingDate.forEach((schedule) => {
      console.log('[searchTrips] schedule route:', {
        MaLichTrinh: schedule.MaLichTrinh,
        NgayKhoiHanh: schedule.NgayKhoiHanh.toISOString(),
        NgayKhoiHanhKey: this.toDateKeyFromDbDate(schedule.NgayKhoiHanh),
        DiemKhoiHanh: schedule.TUYEN_XE?.DiemKhoiHanh,
        DiemDen: schedule.TUYEN_XE?.DiemDen,
      });
    });

    const schedules = schedulesMatchingDate.filter((schedule) => {
      const departureMatch = this.matchRoutePoint(schedule.TUYEN_XE?.DiemKhoiHanh, dto.departure);
      const destinationMatch = this.matchRoutePoint(schedule.TUYEN_XE?.DiemDen, dto.destination);
      return departureMatch && destinationMatch;
    });

    console.log('[searchTrips] schedules after route filter:', schedules.length);

    type ScheduleWithRelations = Prisma.LICH_TRINHGetPayload<{
      include: {
        TUYEN_XE: true;
        PHUONG_TIEN: true;
      };
    }>;

    const results = [];

    for (const schedule of schedules as ScheduleWithRelations[]) {
      // Auto initialize seats if empty
      await this.checkAndInitializeSeats(
        schedule.MaLichTrinh,
        schedule.MaXe,
        schedule.GiaVeCoBan.toNumber(),
      );

      // Fetch seats details with their layout templates from DB
      const seats = await this.prisma.gHE_CHUYEN_XE.findMany({
        where: { MaLichTrinh: schedule.MaLichTrinh },
        include: {
          GHE: true,
        },
        orderBy: {
          GHE: { SoGhe: 'asc' },
        },
      });

      // Sort seats numerically by deck and name to match odds-left/evens-right layout
      seats.sort((a, b) => {
        const deckA = a.GHE?.TangGhe || 1;
        const deckB = b.GHE?.TangGhe || 1;
        if (deckA !== deckB) {
          return deckA - deckB;
        }
        const numA = parseInt(a.GHE?.SoGhe?.replace(/[^0-9]/g, '') || '0', 10);
        const numB = parseInt(b.GHE?.SoGhe?.replace(/[^0-9]/g, '') || '0', 10);
        return numA - numB;
      });

      // Count available seats
      const availableSeats = seats.filter(s => s.TrangThaiGhe === TrangThaiGhe.Trong).length;

      console.log('[searchTrips] seat summary:', {
        MaLichTrinh: schedule.MaLichTrinh,
        totalSeats: seats.length,
        availableSeats,
      });

      // Only return trips that still have available seats
      if (availableSeats > 0) {
        results.push({
          maLichTrinh: schedule.MaLichTrinh,
          gioKhoiHanh: schedule.GioKhoiHanh,
          gioDenDuKien: schedule.GioDenDuKien,
          giaVeCoBan: schedule.GiaVeCoBan.toNumber(),
          trangThaiLichTrinh: schedule.TrangThaiLichTrinh,
          diemKhoiHanh: schedule.TUYEN_XE.DiemKhoiHanh,
          diemDen: schedule.TUYEN_XE.DiemDen,
          tenTuyen: schedule.TUYEN_XE.TenTuyenXe,
          bienSoXe: schedule.PHUONG_TIEN.BienSoXe,
          loaiXe: schedule.PHUONG_TIEN.LoaiXe,
          soGhe: schedule.PHUONG_TIEN.SoGhe,
          soGheTrong: availableSeats,
          seats: seats.map(s => ({
            maGheChuyen: s.MaGheChuyen,
            soGhe: s.GHE?.SoGhe,
            tangGhe: s.GHE?.TangGhe,
            trangThaiGhe: s.TrangThaiGhe,
            giaVe: s.GiaVe.toNumber(),
          })),
        });
      } else {
        console.log('[searchTrips] excluded schedule (no available seats):', {
          MaLichTrinh: schedule.MaLichTrinh,
          soGheTrong: availableSeats,
        });
      }
    }

    console.log('[searchTrips] final results:', results.length);
    if (schedules.length > 0 && results.length === 0) {
      console.log(
        '[searchTrips] schedules after route filter > 0 but final results = 0 because soGheTrong <= 0 for all matched schedules',
      );
    }

    return results;
  }

  // ===== GET TRIP DETAIL =====
  async getTripDetail(id: string) {
    type ScheduleWithRelations = Prisma.LICH_TRINHGetPayload<{
      include: {
        TUYEN_XE: true;
        PHUONG_TIEN: true;
      };
    }>;

    const schedule = await this.prisma.lICH_TRINH.findUnique({
      where: { MaLichTrinh: id },
      include: {
        TUYEN_XE: true,
        PHUONG_TIEN: true,
      },
    }) as ScheduleWithRelations;

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


    // Sort seats numerically by deck and name to match odds-left/evens-right layout
    seats.sort((a, b) => {
      const deckA = a.GHE?.TangGhe || 1;
      const deckB = b.GHE?.TangGhe || 1;
      if (deckA !== deckB) {
        return deckA - deckB;
      }
      const numA = parseInt(a.GHE?.SoGhe?.replace(/[^0-9]/g, '') || '0', 10);
      const numB = parseInt(b.GHE?.SoGhe?.replace(/[^0-9]/g, '') || '0', 10);
      return numA - numB;
    });

    const availableSeats = seats.filter((s) => s.TrangThaiGhe === TrangThaiGhe.Trong).length;

    const diemKhoiHanh = schedule.TUYEN_XE.DiemKhoiHanh;
    const diemDen = schedule.TUYEN_XE.DiemDen;

    // Fetch station timetable stops from database
    const stops = await this.prisma.lICH_TRINH_DIEM_DUNG.findMany({
      where: { MaLichTrinh: id },
      include: {
        DIEM_DON_TRA_DUNG: true,
      },
      orderBy: {
        ThuTuDung: 'asc',
      },
    });

    // Also fetch all route stops from DIEM_DON_TRA_DUNG
    const routeStops = await this.prisma.dIEM_DON_TRA_DUNG.findMany({
      where: { MaTuyenXe: schedule.MaTuyenXe },
    });

    const mappedStops = stops.map(stop => ({
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
      ThoiGianCoMatTruoc: stop.DIEM_DON_TRA_DUNG?.ThoiGianCoMatTruoc,
      GioCanCoMat: stop.DIEM_DON_TRA_DUNG?.GioCanCoMat,
    }));

    // Find any routeStops that are not in mappedStops and merge them
    const existingMaDiems = new Set(mappedStops.map(s => s.MaDiem));
    const extraStops = routeStops
      .filter(rs => !existingMaDiems.has(rs.MaDiem))
      .map((rs, index) => ({
        MaLichTrinhDiemDung: `EXTRA_${rs.MaDiem}`,
        ThuTuDung: mappedStops.length + index + 1,
        GioDenDuKien: schedule.GioKhoiHanh, // Fallback to departure time
        GhiChu: rs.LoaiDiem === 'DiemDonTra' ? 'Diem don/tra' : 'Diem dung',
        MaDiem: rs.MaDiem,
        TenDiem: rs.TenDiem,
        DiaChi: rs.DiaChi,
        ThanhPho: rs.ThanhPho,
        Tinh: rs.Tinh,
        LoaiDiem: rs.LoaiDiem,
        ThoiGianCoMatTruoc: rs.ThoiGianCoMatTruoc,
        GioCanCoMat: rs.GioCanCoMat,
      }));

    const finalStops = [...mappedStops, ...extraStops];

    const pickupPoints = [{ tenDiem: diemKhoiHanh }];
    const dropoffPoints = [{ tenDiem: diemDen }];

    const mappedSeats = seats.map((s) => ({
      maGheChuyen: s.MaGheChuyen,
      soGhe: s.GHE?.SoGhe,
      tangGhe: s.GHE?.TangGhe,
      dayGhe: s.GHE?.DayGhe,
      trangThaiGhe: s.TrangThaiGhe,
      giaVe: s.GiaVe.toNumber(),
    }));

    return {
      MaLichTrinh: schedule.MaLichTrinh,
      maLichTrinh: schedule.MaLichTrinh,
      NgayKhoiHanh: schedule.NgayKhoiHanh,
      GioKhoiHanh: schedule.GioKhoiHanh,
      gioKhoiHanh: schedule.GioKhoiHanh,
      GioGoiYCoMat: schedule.GioGoiYCoMat,
      gioGoiYCoMat: schedule.GioGoiYCoMat,
      GioDenDuKien: schedule.GioDenDuKien,
      gioDenDuKien: schedule.GioDenDuKien,
      GiaVeCoBan: schedule.GiaVeCoBan,
      giaVeCoBan: schedule.GiaVeCoBan.toNumber(),
      TrangThai: schedule.TrangThaiLichTrinh,
      tenTuyen: schedule.TUYEN_XE.TenTuyenXe,
      diemKhoiHanh,
      diemDen,
      bienSoXe: schedule.PHUONG_TIEN.BienSoXe,
      loaiXe: schedule.PHUONG_TIEN.LoaiXe,
      soGhe: schedule.PHUONG_TIEN.SoGhe,
      soGheTrong: availableSeats,
      pickupPoints,
      dropoffPoints,
      gheChuyenXe: seats.map((s) => ({
        MaGheChuyen: s.MaGheChuyen,
        NhomGhe: s.NhomGhe,
        GiaVe: s.GiaVe,
        TrangThaiGhe: s.TrangThaiGhe,
        ThoiGianCapNhatTrangThai: s.ThoiGianCapNhatTrangThai,
        SoGhe: s.GHE?.SoGhe,
        TangGhe: s.GHE?.TangGhe,
        DayGhe: s.GHE?.DayGhe,
      })),
      seats: mappedSeats,
      diemDungLichTrinh: finalStops,
    };
  }
}