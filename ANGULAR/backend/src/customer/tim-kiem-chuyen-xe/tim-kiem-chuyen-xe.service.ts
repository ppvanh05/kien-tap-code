import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrangThaiGhe, TrangThaiLichTrinh } from '@prisma/client';

@Injectable()
export class TimKiemChuyenXeService {
  constructor(private prisma: PrismaService) {}

  // Helper to parse date string formatted as dd/mm/yyyy or yyyy-mm-dd
  private parseSearchDate(dateStr?: string): Date | null {
    if (!dateStr) return null;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      const parsed = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    const parsed = new Date(dateStr);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
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

  private matchLocation(value?: string | null, keyword?: string): boolean {
    if (!keyword?.trim()) return true;
    return this.normalizeSearchText(value).includes(this.normalizeSearchText(keyword));
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
            TrangThaiGhe: TrangThaiGhe.C_n_Tr_ng,
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
          TrangThaiGhe: TrangThaiGhe.C_n_Tr_ng,
          ThoiGianCapNhatTrangThai: new Date(),
          MaLichTrinh: scheduleId,
          MaGhe: seat.MaGhe,
        },
      });
      created.push(record);
    }
    return created;
  }

  private removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }

  // ===== SEARCH TRIPS =====
  async searchTrips(dto: { departure?: string; destination?: string; date?: string }) {
    const searchDate = this.parseSearchDate(dto.date);
    const where: any = {
      TrangThaiLichTrinh: {
        notIn: ['DaKhoa'],
      },
    };

    if (searchDate) {
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.NgayKhoiHanh = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const departure = dto.departure?.trim();
    const destination = dto.destination?.trim();

    // Find schedules matching date
    const schedules = await this.prisma.lICH_TRINH.findMany({
      where: {
        NgayKhoiHanh: {
          gte: startOfDay,
          lte: endOfDay,
        },
<<<<<<< HEAD
        TrangThaiLichTrinh: {
          notIn: [TrangThaiLichTrinh.DaKhoa],
        },
        TUYEN_XE: {
          DiemKhoiHanh: { contains: dto.departure, mode: 'insensitive' },
          DiemDen: { contains: dto.destination, mode: 'insensitive' },
=======
        TrangThai: {
          notIn: ['DaKhoa'],
>>>>>>> origin/nghi
        },
      },
      where,
      include: {
        TUYEN_XE: true,
        PHUONG_TIEN: true,
      },
    });
    const filteredSchedules = schedules.filter(schedule =>
      this.matchLocation(schedule.TUYEN_XE?.DiemKhoiHanh, departure) &&
      this.matchLocation(schedule.TUYEN_XE?.DiemDen, destination),
    );

    const cleanDeparture = this.removeAccents(dto.departure || '').toLowerCase().trim();
    const cleanDestination = this.removeAccents(dto.destination || '').toLowerCase().trim();

    // Filter in-memory for 100% case- and accent-insensitive matching
    const matchedSchedules = schedules.filter(schedule => {
      const dbDep = this.removeAccents(schedule.TUYEN_XE?.DiemKhoiHanh || '').toLowerCase().trim();
      const dbDest = this.removeAccents(schedule.TUYEN_XE?.DiemDen || '').toLowerCase().trim();
      return dbDep.includes(cleanDeparture) && dbDest.includes(cleanDestination);
    });

    const results = [];

<<<<<<< HEAD
    for (const schedule of filteredSchedules) {
=======
    for (const schedule of matchedSchedules) {
>>>>>>> origin/nghi
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
      const availableSeats = seats.filter(s => s.TrangThaiGhe === TrangThaiGhe.C_n_Tr_ng).length;

      // Fetch stops
      const stops = await this.prisma.lICH_TRINH_DIEM_DUNG.findMany({
        where: { MaLichTrinh: schedule.MaLichTrinh },
        include: {
          DIEM_DON_TRA_DUNG: true,
        },
        orderBy: {
          ThuTuDung: 'asc',
        },
      });

      // Only return trips that still have available seats
      if (availableSeats > 0) {
        results.push({
          MaLichTrinh: schedule.MaLichTrinh,
          NgayKhoiHanh: schedule.NgayKhoiHanh,
          GioKhoiHanh: schedule.GioKhoiHanh,
          GioGoiYCoMat: schedule.GioGoiYCoMat,
          GioDenDuKien: schedule.GioDenDuKien,
          GiaVeCoBan: schedule.GiaVeCoBan,
          TrangThai: schedule.TrangThaiLichTrinh,
          availableSeats,
          tuyenXe: schedule.TUYEN_XE,
          phuongTien: schedule.PHUONG_TIEN,
          gheChuyenXe: seats.map(s => ({
            MaGheChuyen: s.MaGheChuyen,
            NhomGhe: s.NhomGhe,
            GiaVe: s.GiaVe,
            TrangThaiGhe: s.TrangThaiGhe,
            ThoiGianCapNhatTrangThai: s.ThoiGianCapNhatTrangThai,
<<<<<<< HEAD
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
            ThoiGianCoMatTruoc: stop.DIEM_DON_TRA_DUNG?.ThoiGianCoMatTruoc,
            GioCanCoMat: stop.DIEM_DON_TRA_DUNG?.GioCanCoMat,
=======
            SoGhe: s.GHE?.SoGhe,
            TangGhe: s.GHE?.TangGhe,
            DayGhe: s.GHE?.DayGhe,
>>>>>>> origin/nghi
          })),
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
      }));

    const finalStops = [...mappedStops, ...extraStops];

    return {
      MaLichTrinh: schedule.MaLichTrinh,
      NgayKhoiHanh: schedule.NgayKhoiHanh,
      GioKhoiHanh: schedule.GioKhoiHanh,
      GioGoiYCoMat: schedule.GioGoiYCoMat,
      GioDenDuKien: schedule.GioDenDuKien,
      GiaVeCoBan: schedule.GiaVeCoBan,
      TrangThai: schedule.TrangThaiLichTrinh,
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
<<<<<<< HEAD
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
        ThoiGianCoMatTruoc: stop.DIEM_DON_TRA_DUNG?.ThoiGianCoMatTruoc,
        GioCanCoMat: stop.DIEM_DON_TRA_DUNG?.GioCanCoMat,
      })),
=======
      diemDungLichTrinh: finalStops,
>>>>>>> origin/nghi
    };
  }
}
