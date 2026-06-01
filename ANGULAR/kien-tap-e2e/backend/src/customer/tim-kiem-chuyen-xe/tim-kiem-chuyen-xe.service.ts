import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
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

  // ===== SEAT RESERVATION (hold) APIs =====
  // Reserve (hold) seats atomically for a short period (10 minutes)
  async reserveSeats(dto: { maLichTrinh: string; seats: string[]; sessionId?: string }) {
    if (!dto?.maLichTrinh || !Array.isArray(dto.seats) || dto.seats.length === 0) {
      throw new BadRequestException('Invalid parameters');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Re-fetch seat statuses inside transaction
        const rows = await tx.gHE_CHUYEN_XE.findMany({ where: { MaGheChuyen: { in: dto.seats } } });
        const notAvailable = rows.filter(r => r.TrangThaiGhe !== TrangThaiGhe.Trong).map(r => r.MaGheChuyen);
        if (notAvailable.length > 0) {
          return { success: false, message: 'Some seats are not available', unavailable: notAvailable };
        }

        // Mark seats as held
        await tx.gHE_CHUYEN_XE.updateMany({
          where: { MaGheChuyen: { in: dto.seats } },
          data: { TrangThaiGhe: TrangThaiGhe.GiuCho, ThoiGianCapNhatTrangThai: now },
        });

        // Create hold records
        const creates = dto.seats.map((maGhe) =>
          tx.gHE_GIU_CHO.create({
            data: {
              MaGheChuyen: maGhe,
              MaLichTrinh: dto.maLichTrinh,
              MaSession: dto.sessionId || null,
              TrangThai: 'GiuCho',
              ThoiGianHetHan: expiresAt,
            },
          }),
        );
        await Promise.all(creates);

        return { success: true, expiresAt: expiresAt.toISOString() };
      });
      return result;
    } catch (err) {
      console.error('[reserveSeats] error', err);
      throw new ConflictException('Failed to reserve seats');
    }
  }

  // Release held seats (called on user cancel or manual release)
  async releaseSeats(dto: { maLichTrinh: string; seats: string[]; sessionId?: string }) {
    if (!dto?.maLichTrinh || !Array.isArray(dto.seats) || dto.seats.length === 0) {
      throw new BadRequestException('Invalid parameters');
    }

    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      // Delete hold records for these seats (optionally filter by sessionId)
      await tx.gHE_GIU_CHO.deleteMany({ where: { MaGheChuyen: { in: dto.seats }, MaLichTrinh: dto.maLichTrinh } });

      // Set seat status back to available if they were in held state
      await tx.gHE_CHUYEN_XE.updateMany({
        where: { MaGheChuyen: { in: dto.seats }, MaLichTrinh: dto.maLichTrinh, TrangThaiGhe: TrangThaiGhe.GiuCho },
        data: { TrangThaiGhe: TrangThaiGhe.Trong, ThoiGianCapNhatTrangThai: now },
      });

      return { success: true };
    });
    return result;
  }

  // Finalize seats when payment succeeds (mark sold)
  async finalizeSeats(dto: { maLichTrinh: string; seats: string[]; sessionId?: string }) {
    if (!dto?.maLichTrinh || !Array.isArray(dto.seats) || dto.seats.length === 0) {
      throw new BadRequestException('Invalid parameters');
    }

    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      // Ensure seats are currently held or available; if already sold, fail
      const rows = await tx.gHE_CHUYEN_XE.findMany({ where: { MaGheChuyen: { in: dto.seats } } });
      const alreadySold = rows.filter(r => r.TrangThaiGhe === TrangThaiGhe.DaBan).map(r => r.MaGheChuyen);
      if (alreadySold.length > 0) {
        return { success: false, message: 'Some seats already sold', sold: alreadySold };
      }

      // Update seats to DaBan
      await tx.gHE_CHUYEN_XE.updateMany({
        where: { MaGheChuyen: { in: dto.seats }, MaLichTrinh: dto.maLichTrinh },
        data: { TrangThaiGhe: TrangThaiGhe.DaBan, ThoiGianCapNhatTrangThai: now },
      });

      // Remove any existing hold records
      await tx.gHE_GIU_CHO.deleteMany({ where: { MaGheChuyen: { in: dto.seats }, MaLichTrinh: dto.maLichTrinh } });

      return { success: true };
    });

    return result;
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

      // Now create GHE_CHUYEN_XE entries in batch
      const seatsToCreate = defaultSeats.map(ghe => ({
        MaGheChuyen: `${scheduleId}_${ghe.MaGhe}`,
        NhomGhe: 'Limousine',
        GiaVe: basePrice,
        TrangThaiGhe: TrangThaiGhe.Trong,
        ThoiGianCapNhatTrangThai: new Date(),
        MaLichTrinh: scheduleId,
        MaGhe: ghe.MaGhe,
      }));

      await this.prisma.gHE_CHUYEN_XE.createMany({
        data: seatsToCreate,
        skipDuplicates: true,
      });

      return this.prisma.gHE_CHUYEN_XE.findMany({
        where: { MaLichTrinh: scheduleId },
      });
    }

    // Auto-create from existing vehicle GHE templates in batch
    const seatsToCreate = seats.map(seat => ({
      MaGheChuyen: `${scheduleId}_${seat.SoGhe}`,
      NhomGhe: 'Limousine',
      GiaVe: basePrice,
      TrangThaiGhe: TrangThaiGhe.Trong,
      ThoiGianCapNhatTrangThai: new Date(),
      MaLichTrinh: scheduleId,
      MaGhe: seat.MaGhe,
    }));

    await this.prisma.gHE_CHUYEN_XE.createMany({
      data: seatsToCreate,
      skipDuplicates: true,
    });

    return this.prisma.gHE_CHUYEN_XE.findMany({
      where: { MaLichTrinh: scheduleId },
    });
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
        // Filter at database level to fetch only matching routes
        ...(dto.departure || dto.destination ? {
          TUYEN_XE: {
            DiemKhoiHanh: dto.departure ? { contains: dto.departure } : undefined,
            DiemDen: dto.destination ? { contains: dto.destination } : undefined,
          }
        } : {}),
      },
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

    const promises = (schedules as ScheduleWithRelations[]).map(async (schedule) => {
      // Fetch seats details with their layout templates from DB first
      let seats = await this.prisma.gHE_CHUYEN_XE.findMany({
        where: { MaLichTrinh: schedule.MaLichTrinh },
        include: {
          GHE: true,
        },
      });

      // Auto initialize seats if empty
      if (seats.length === 0) {
        await this.checkAndInitializeSeats(
          schedule.MaLichTrinh,
          schedule.MaXe,
          schedule.GiaVeCoBan.toNumber(),
        );
        seats = await this.prisma.gHE_CHUYEN_XE.findMany({
          where: { MaLichTrinh: schedule.MaLichTrinh },
          include: {
            GHE: true,
          },
        });
      }

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
        return {
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
        };
      } else {
        console.log('[searchTrips] excluded schedule (no available seats):', {
          MaLichTrinh: schedule.MaLichTrinh,
          soGheTrong: availableSeats,
        });
        return null;
      }
    });

    const resolved = await Promise.all(promises);
    const finalResults = resolved.filter((res): res is NonNullable<typeof res> => res !== null);

    console.log('[searchTrips] final results:', finalResults.length);
    if (schedules.length > 0 && finalResults.length === 0) {
      console.log(
        '[searchTrips] schedules after route filter > 0 but final results = 0 because soGheTrong <= 0 for all matched schedules',
      );
    }

    return finalResults;
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

    // Fetch seats details with their layout templates first
    let seats = await this.prisma.gHE_CHUYEN_XE.findMany({
      where: { MaLichTrinh: id },
      include: {
        GHE: true,
      },
    });

    // Auto initialize seats if empty
    if (seats.length === 0) {
      await this.checkAndInitializeSeats(
        schedule.MaLichTrinh,
        schedule.MaXe,
        schedule.GiaVeCoBan.toNumber(),
      );
      seats = await this.prisma.gHE_CHUYEN_XE.findMany({
        where: { MaLichTrinh: id },
        include: {
          GHE: true,
        },
      });
    }


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

    const diemDungLichTrinh = [
      {
        MaLichTrinhDiemDung: `PICKUP_${schedule.MaLichTrinh}`,
        ThuTuDung: 1,
        GioDenDuKien: schedule.GioKhoiHanh,
        GhiChu: 'Diem don',
        MaDiem: `PICKUP_${schedule.MaLichTrinh}`,
        TenDiem: diemKhoiHanh,
        DiaChi: diemKhoiHanh,
        ThanhPho: null,
        Tinh: null,
        LoaiDiem: 'DiemDon',
      },
      {
        MaLichTrinhDiemDung: `DROPOFF_${schedule.MaLichTrinh}`,
        ThuTuDung: 2,
        GioDenDuKien: schedule.GioDenDuKien,
        GhiChu: 'Diem tra',
        MaDiem: `DROPOFF_${schedule.MaLichTrinh}`,
        TenDiem: diemDen,
        DiaChi: diemDen,
        ThanhPho: null,
        Tinh: null,
        LoaiDiem: 'DiemTra',
      },
    ];

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
      diemDungLichTrinh,
    };
  }
}
