import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { DEFAULT_ROLE_PERMISSIONS } from './admin/auth/default-permissions';

const prisma = new PrismaClient();

const qtvId = 'QTV100001';
const dieuPhoiId = 'NVDP100001';
const banVeId = 'NVBV100001';
const banQuanLyId = 'BQL100001';

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);
const time = (hour: number, minute = 0) => new Date(Date.UTC(1970, 0, 1, hour, minute, 0));
const money = (value: number) => new Prisma.Decimal(value);

const lowerSeats = ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A'];
const upperSeats = ['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B'];
const allSeats = [...lowerSeats, ...upperSeats];

async function cleanupOldDemoIds() {
  const demoTicketIds = (await prisma.vE_DIEN_TU.findMany({
    where: { MaVe: { startsWith: 'VE_DEMO' } },
    select: { MaVe: true },
  })).map(item => item.MaVe);
  const demoOrderIds = (await prisma.dON_HANG.findMany({
    where: { MaDonHang: { startsWith: 'DH_DEMO' } },
    select: { MaDonHang: true },
  })).map(item => item.MaDonHang);

  await prisma.pHAN_HOI_DANH_GIA.deleteMany({ where: { MaDanhGia: { startsWith: 'DG_DEMO' } } });
  await prisma.mEDIA_DANH_GIA.deleteMany({ where: { MaDanhGia: { startsWith: 'DG_DEMO' } } });
  await prisma.dANH_GIA.deleteMany({
    where: {
      OR: [
        { MaDanhGia: { startsWith: 'DG_DEMO' } },
        { MaVe: { in: demoTicketIds } },
      ],
    },
  });
  await prisma.lICH_SU_HUY_VE.deleteMany({ where: { MaVe: { in: demoTicketIds } } });
  await prisma.lICH_SU_VE.deleteMany({ where: { MaVe: { in: demoTicketIds } } });
  await prisma.nHAT_KY_HE_THONG.deleteMany({
    where: {
      OR: [
        { MaNhatKy: { startsWith: 'NK_DEMO' } },
        { MaVe: { in: demoTicketIds } },
      ],
    },
  });
  await prisma.tHANH_TOAN.deleteMany({
    where: {
      OR: [
        { MaGiaoDich: { startsWith: 'GD_DH_DEMO' } },
        { MaDonHang: { in: demoOrderIds } },
      ],
    },
  });
  await prisma.vE_DIEN_TU.deleteMany({ where: { MaVe: { startsWith: 'VE_DEMO' } } });
  await prisma.dON_HANG.deleteMany({ where: { MaDonHang: { startsWith: 'DH_DEMO' } } });
  await prisma.gHE_CHUYEN_XE.deleteMany({
    where: {
      OR: [
        { MaLichTrinh: { startsWith: 'LT_DEMO' } },
        { MaGhe: { startsWith: 'XE_DEMO' } },
      ],
    },
  });
  await prisma.lICH_TRINH_DIEM_DUNG.deleteMany({
    where: {
      OR: [
        { MaLichTrinh: { startsWith: 'LT_DEMO' } },
        { MaDiem: { startsWith: 'DD_DEMO' } },
      ],
    },
  });
  await prisma.pHAN_CONG_CHUYEN.deleteMany({
    where: {
      OR: [
        { MaPhanCong: { startsWith: 'PC_DEMO' } },
        { MaLichTrinh: { startsWith: 'LT_DEMO' } },
      ],
    },
  });
  await prisma.lICH_TRINH.deleteMany({ where: { MaLichTrinh: { startsWith: 'LT_DEMO' } } });
  await prisma.gHE.deleteMany({ where: { MaXe: { startsWith: 'XE_DEMO' } } });
  await prisma.pHUONG_TIEN.deleteMany({ where: { MaXe: { startsWith: 'XE_DEMO' } } });
  await prisma.dIEM_DON_TRA_DUNG.deleteMany({ where: { MaDiem: { startsWith: 'DD_DEMO' } } });
  await prisma.tUYEN_XE.deleteMany({ where: { MaTuyenXe: { startsWith: 'TX_DEMO' } } });
  await prisma.tAI_XE_PHU_XE.deleteMany({ where: { MaTaiXePhuXe: { startsWith: 'TXPX_DEMO' } } });
  await prisma.tIN_TUC.deleteMany({ where: { MaTinTuc: { startsWith: 'TT_DEMO' } } });
  await prisma.cHINH_SACH.deleteMany({ where: { MaChinhSach_ND: { startsWith: 'CS_DEMO' } } });
  await prisma.tU_KHOA_HAN_CHE.deleteMany({ where: { MaTuKhoa: { startsWith: 'TK_DEMO' } } });
  await prisma.cHINH_SACH_HUY_VE.deleteMany({ where: { MaChinhSach: { startsWith: 'CS_HUY_DEMO' } } });
  await prisma.kHACH_HANG.deleteMany({ where: { MaKhachHang: { startsWith: 'KH_DEMO' } } });
}

async function seedEmployees() {
  const employees = [
    {
      MaNhanVien: qtvId,
      LoaiTaiKhoan: 'QuanTriVien',
      TenTruyCap: 'admin1',
      MatKhau: 'Admin@123',
      HoVaTenDem: 'Nguyen An',
      Ten: 'Ninh',
      TenHienThi: 'Nguyen An Ninh',
      SoDienThoai: '0912000111',
      Email: 'admin@txpbus.vn',
      Quyen: DEFAULT_ROLE_PERMISSIONS.QuanTriVien,
    },
    {
      MaNhanVien: dieuPhoiId,
      LoaiTaiKhoan: 'NhanVienDieuPhoi',
      TenTruyCap: 'dieuphoi1',
      MatKhau: 'Dieuphoi@123',
      HoVaTenDem: 'Nguyen Van',
      Ten: 'Dieu Phoi',
      TenHienThi: 'Nguyen Van Dieu Phoi',
      SoDienThoai: '0913000111',
      Email: 'dp1@txpbus.vn',
      Quyen: DEFAULT_ROLE_PERMISSIONS.NhanVienDieuPhoi,
    },
    {
      MaNhanVien: banVeId,
      LoaiTaiKhoan: 'NhanVienBanVe',
      TenTruyCap: 'banve1',
      MatKhau: 'Banve@123',
      HoVaTenDem: 'Phan Thu',
      Ten: 'Trang',
      TenHienThi: 'Phan Thu Trang',
      SoDienThoai: '0914000111',
      Email: 'banve1@txpbus.vn',
      Quyen: DEFAULT_ROLE_PERMISSIONS.NhanVienBanVe,
    },
    {
      MaNhanVien: banQuanLyId,
      LoaiTaiKhoan: 'BanQuanLy',
      TenTruyCap: 'quanly1',
      MatKhau: 'Quanly@123',
      HoVaTenDem: 'Hoang Anh',
      Ten: 'Tuan',
      TenHienThi: 'Hoang Anh Tuan',
      SoDienThoai: '0915000111',
      Email: 'quanly1@txpbus.vn',
      Quyen: DEFAULT_ROLE_PERMISSIONS.BanQuanLy,
    },
  ] as const;

  for (const employee of employees) {
    await prisma.nHAN_VIEN.upsert({
      where: { MaNhanVien: employee.MaNhanVien },
      update: {
        LoaiTaiKhoan: employee.LoaiTaiKhoan,
        TenTruyCap: employee.TenTruyCap,
        MatKhau: employee.MatKhau,
        HoVaTenDem: employee.HoVaTenDem,
        Ten: employee.Ten,
        TenHienThi: employee.TenHienThi,
        SoDienThoai: employee.SoDienThoai,
        Email: employee.Email,
        TrangThai: 'HoatDong',
        Quyen: employee.Quyen,
      },
      create: {
        ...employee,
        TrangThai: 'HoatDong',
      },
    });
  }

  await prisma.qUAN_TRI_VIEN.upsert({ where: { MaQuanTriVien: qtvId }, update: {}, create: { MaQuanTriVien: qtvId } });
  await prisma.nHAN_VIEN_DIEU_PHOI.upsert({ where: { MaNVDieuPhoi: dieuPhoiId }, update: {}, create: { MaNVDieuPhoi: dieuPhoiId } });
  await prisma.nHAN_VIEN_BAN_VE.upsert({ where: { MaNVBanVe: banVeId }, update: {}, create: { MaNVBanVe: banVeId } });
  await prisma.bAN_QUAN_LY.upsert({ where: { MaBanQuanLy: banQuanLyId }, update: {}, create: { MaBanQuanLy: banQuanLyId } });
}

async function seedVehicles() {
  const vehicles = [
    { MaXe: 'XE100002', TenXe: 'Hyundai Universe Limousine', BienSoXe: '29B-567.89' },
    { MaXe: 'XE100003', TenXe: 'Thaco Mobihome Limousine', BienSoXe: '15B-888.99' },
    { MaXe: 'XE100005', TenXe: 'Fuso Rosa Limousine', BienSoXe: '30F-112.26' },
  ];

  for (const vehicle of vehicles) {
    await prisma.pHUONG_TIEN.upsert({
      where: { MaXe: vehicle.MaXe },
      update: {
        TenXe: vehicle.TenXe,
        BienSoXe: vehicle.BienSoXe,
        TrangThaiPhuongTien: 'DangHoatDong',
      },
      create: {
        ...vehicle,
        LoaiXe: 'Limousine22Phong',
        SoTang: 2,
        SoDay: 2,
        SoGhe: 22,
        TienIch: ['Tivi', 'SacUSB', 'Wifi', 'NuocKhanUot', 'GPS', 'DieuHoa'],
        HanDangKiem: date('2028-12-31'),
        HanBaoHiem: date('2028-12-31'),
        TrangThaiPhuongTien: 'DangHoatDong',
        MaNVDieuPhoi: dieuPhoiId,
      },
    });

    for (const seatName of allSeats) {
      const isUpper = seatName.endsWith('B');
      await prisma.gHE.upsert({
        where: { MaGhe: `${vehicle.MaXe}_GHE_${seatName}` },
        update: {
          SoGhe: seatName,
          TangGhe: isUpper ? 2 : 1,
          DayGhe: isUpper ? 'B' : 'A',
        },
        create: {
          MaGhe: `${vehicle.MaXe}_GHE_${seatName}`,
          MaXe: vehicle.MaXe,
          SoGhe: seatName,
          TangGhe: isUpper ? 2 : 1,
          DayGhe: isUpper ? 'B' : 'A',
        },
      });
    }
  }
}

async function seedRoutesAndStops() {
  const routes = [
    {
      MaTuyenXe: 'TX100002',
      TenTuyenXe: 'Ha Noi - Quang Ninh',
      DiemKhoiHanh: 'Ha Noi',
      DiemDen: 'Quang Ninh',
      KhoangCach: 180,
      ThoiGianDiChuyenDuKien: time(2, 30),
      stops: [
        { MaDiem: 'DDT100003', TenDiem: 'Ben xe My Dinh', ThanhPho: 'Ha Noi', Tinh: 'Ha Noi', DiaChi: '20 Pham Hung, Nam Tu Liem' },
        { MaDiem: 'DDT100004', TenDiem: 'Ben xe Bai Chay', ThanhPho: 'Ha Long', Tinh: 'Quang Ninh', DiaChi: 'Duong Ha Long, Bai Chay' },
      ],
    },
    {
      MaTuyenXe: 'TX100003',
      TenTuyenXe: 'Hai Phong - Quang Ninh',
      DiemKhoiHanh: 'Hai Phong',
      DiemDen: 'Quang Ninh',
      KhoangCach: 75,
      ThoiGianDiChuyenDuKien: time(1, 45),
      stops: [
        { MaDiem: 'DDT100001', TenDiem: 'Ben xe Thuong Ly', ThanhPho: 'Hai Phong', Tinh: 'Hai Phong', DiaChi: '52 Ha Ly, Hong Bang' },
        { MaDiem: 'DDT100004', TenDiem: 'Ben xe Bai Chay', ThanhPho: 'Ha Long', Tinh: 'Quang Ninh', DiaChi: 'Duong Ha Long, Bai Chay' },
      ],
    },
    {
      MaTuyenXe: 'TX100004',
      TenTuyenXe: 'Ha Noi - SaPa',
      DiemKhoiHanh: 'Ha Noi',
      DiemDen: 'SaPa',
      KhoangCach: 320,
      ThoiGianDiChuyenDuKien: time(5, 30),
      stops: [
        { MaDiem: 'DDT100003', TenDiem: 'Ben xe My Dinh', ThanhPho: 'Ha Noi', Tinh: 'Ha Noi', DiaChi: '20 Pham Hung, Nam Tu Liem' },
        { MaDiem: 'DDT100007', TenDiem: 'Nha tho da SaPa', ThanhPho: 'SaPa', Tinh: 'Lao Cai', DiaChi: 'Trung tam SaPa' },
      ],
    },
  ];

  for (const route of routes) {
    await prisma.tUYEN_XE.upsert({
      where: { MaTuyenXe: route.MaTuyenXe },
      update: {
        TenTuyenXe: route.TenTuyenXe,
        DiemKhoiHanh: route.DiemKhoiHanh,
        DiemDen: route.DiemDen,
        KhoangCach: route.KhoangCach,
        ThoiGianDiChuyenDuKien: route.ThoiGianDiChuyenDuKien,
        TrangThaiTuyenXe: 'DangHoatDong',
        MaNVDieuPhoi: dieuPhoiId,
      },
      create: {
        MaTuyenXe: route.MaTuyenXe,
        TenTuyenXe: route.TenTuyenXe,
        DiemKhoiHanh: route.DiemKhoiHanh,
        DiemDen: route.DiemDen,
        KhoangCach: route.KhoangCach,
        ThoiGianDiChuyenDuKien: route.ThoiGianDiChuyenDuKien,
        TrangThaiTuyenXe: 'DangHoatDong',
        MaNVDieuPhoi: dieuPhoiId,
      },
    });

    for (const stop of route.stops) {
      await prisma.dIEM_DON_TRA_DUNG.upsert({
        where: { MaDiem: stop.MaDiem },
        update: {
          MaTuyenXe: route.MaTuyenXe,
          TenDiem: stop.TenDiem,
          ThanhPho: stop.ThanhPho,
          Tinh: stop.Tinh,
          DiaChi: stop.DiaChi,
          TrangThaiDiem: 'DangHoatDong',
          MaNVDieuPhoi: dieuPhoiId,
        },
        create: {
          ...stop,
          MaTuyenXe: route.MaTuyenXe,
          LoaiDiem: 'DiemDonTra',
          TrangThaiDiem: 'DangHoatDong',
          MaNVDieuPhoi: dieuPhoiId,
          GioCanCoMat: time(0, 15),
          ThoiGianCoMatTruoc: 15,
        },
      });
    }
  }
}

async function seedSchedules() {
  const schedules = [
    { MaLichTrinh: 'LT100001', MaTuyenXe: 'TX100002', MaXe: 'XE100002', NgayKhoiHanh: '2026-05-30', GioKhoiHanh: time(8, 30), GioDenDuKien: time(11, 0), GiaVeCoBan: 220000, stops: ['DDT100003', 'DDT100004'] },
    { MaLichTrinh: 'LT100005', MaTuyenXe: 'TX100002', MaXe: 'XE100003', NgayKhoiHanh: '2026-05-30', GioKhoiHanh: time(14, 30), GioDenDuKien: time(17, 0), GiaVeCoBan: 240000, stops: ['DDT100003', 'DDT100004'] },
    { MaLichTrinh: 'LT100006', MaTuyenXe: 'TX100003', MaXe: 'XE100005', NgayKhoiHanh: '2026-05-29', GioKhoiHanh: time(9, 0), GioDenDuKien: time(10, 45), GiaVeCoBan: 180000, stops: ['DDT100001', 'DDT100004'] },
    { MaLichTrinh: 'LT100007', MaTuyenXe: 'TX100004', MaXe: 'XE100003', NgayKhoiHanh: '2026-05-31', GioKhoiHanh: time(22, 0), GioDenDuKien: time(3, 30), GiaVeCoBan: 350000, stops: ['DDT100003', 'DDT100007'] },
  ];

  for (const schedule of schedules) {
    await prisma.lICH_TRINH.upsert({
      where: { MaLichTrinh: schedule.MaLichTrinh },
      update: {
        NgayKhoiHanh: date(schedule.NgayKhoiHanh),
        GioKhoiHanh: schedule.GioKhoiHanh,
        GioGoiYCoMat: new Date(schedule.GioKhoiHanh.getTime() - 15 * 60 * 1000),
        GioDenDuKien: schedule.GioDenDuKien,
        GiaVeCoBan: money(schedule.GiaVeCoBan),
        TrangThaiLichTrinh: 'ChoKhoiHanh',
        MaTuyenXe: schedule.MaTuyenXe,
        MaXe: schedule.MaXe,
        MaNVDieuPhoi: dieuPhoiId,
      },
      create: {
        MaLichTrinh: schedule.MaLichTrinh,
        NgayKhoiHanh: date(schedule.NgayKhoiHanh),
        GioKhoiHanh: schedule.GioKhoiHanh,
        GioGoiYCoMat: new Date(schedule.GioKhoiHanh.getTime() - 15 * 60 * 1000),
        GioDenDuKien: schedule.GioDenDuKien,
        GiaVeCoBan: money(schedule.GiaVeCoBan),
        TrangThaiLichTrinh: 'ChoKhoiHanh',
        MaTuyenXe: schedule.MaTuyenXe,
        MaXe: schedule.MaXe,
        MaNVDieuPhoi: dieuPhoiId,
      },
    });

    for (const [index, maDiem] of schedule.stops.entries()) {
      await prisma.lICH_TRINH_DIEM_DUNG.upsert({
        where: { MaLichTrinhDiemDung: `${schedule.MaLichTrinh}_STOP_${index + 1}` },
        update: {
          MaDiem: maDiem,
          ThuTuDung: index + 1,
          GioDenDuKien: index === 0 ? schedule.GioKhoiHanh : schedule.GioDenDuKien,
        },
        create: {
          MaLichTrinhDiemDung: `${schedule.MaLichTrinh}_STOP_${index + 1}`,
          MaLichTrinh: schedule.MaLichTrinh,
          MaDiem: maDiem,
          ThuTuDung: index + 1,
          GioDenDuKien: index === 0 ? schedule.GioKhoiHanh : schedule.GioDenDuKien,
          GhiChu: index === 0 ? 'Diem don chinh' : 'Diem tra chinh',
        },
      });
    }

    const usedSeatIds = (await prisma.vE_DIEN_TU.findMany({
      where: { MaLichTrinh: schedule.MaLichTrinh },
      select: { MaGheChuyen: true },
    })).map(item => item.MaGheChuyen);
    await prisma.gHE_CHUYEN_XE.deleteMany({
      where: {
        MaLichTrinh: schedule.MaLichTrinh,
        MaGheChuyen: { notIn: usedSeatIds },
        NOT: { MaGhe: { contains: '_GHE_' } },
      },
    });

    for (const seatName of allSeats) {
      const maGhe = `${schedule.MaXe}_GHE_${seatName}`;
      await prisma.gHE_CHUYEN_XE.upsert({
        where: { MaGheChuyen: `${schedule.MaLichTrinh}_${maGhe}` },
        update: {
          NhomGhe: 'Limousine',
          GiaVe: money(schedule.GiaVeCoBan),
        },
        create: {
          MaGheChuyen: `${schedule.MaLichTrinh}_${maGhe}`,
          NhomGhe: 'Limousine',
          GiaVe: money(schedule.GiaVeCoBan),
          TrangThaiGhe: 'Trong',
          ThoiGianCapNhatTrangThai: new Date(),
          MaLichTrinh: schedule.MaLichTrinh,
          MaGhe: maGhe,
        },
      });
    }

    const ticketsInSchedule = await prisma.vE_DIEN_TU.findMany({
      where: { MaLichTrinh: schedule.MaLichTrinh },
      select: { MaVe: true, MaGheChuyen: true, TrangThaiVe: true },
      orderBy: { MaVe: 'asc' },
    });
    const occupiedSeatIds = new Set(
      ticketsInSchedule
        .map(ticket => ticket.MaGheChuyen)
        .filter(maGheChuyen => maGheChuyen.includes('_GHE_')),
    );
    let seatCursor = 0;

    for (const ticket of ticketsInSchedule.filter(item => !item.MaGheChuyen.includes('_GHE_'))) {
      let replacementSeat = '';
      while (seatCursor < allSeats.length) {
        const candidate = `${schedule.MaLichTrinh}_${schedule.MaXe}_GHE_${allSeats[seatCursor]}`;
        seatCursor += 1;
        if (!occupiedSeatIds.has(candidate)) {
          replacementSeat = candidate;
          break;
        }
      }
      if (!replacementSeat) continue;
      occupiedSeatIds.add(replacementSeat);
      await prisma.vE_DIEN_TU.update({
        where: { MaVe: ticket.MaVe },
        data: {
          MaGheChuyen: replacementSeat,
          MaXe: schedule.MaXe,
        },
      });
    }

    await prisma.gHE_CHUYEN_XE.deleteMany({
      where: {
        MaLichTrinh: schedule.MaLichTrinh,
        NOT: { MaGhe: { contains: '_GHE_' } },
      },
    });
    await prisma.gHE_CHUYEN_XE.updateMany({
      where: { MaLichTrinh: schedule.MaLichTrinh },
      data: {
        TrangThaiGhe: 'Trong',
        ThoiGianCapNhatTrangThai: new Date(),
      },
    });

    const activeTickets = await prisma.vE_DIEN_TU.findMany({
      where: {
        MaLichTrinh: schedule.MaLichTrinh,
        TrangThaiVe: { not: 'DaHuy' },
      },
      select: { MaGheChuyen: true },
    });
    for (const ticket of activeTickets) {
      await prisma.gHE_CHUYEN_XE.update({
        where: { MaGheChuyen: ticket.MaGheChuyen },
        data: {
          TrangThaiGhe: 'DaBan',
          ThoiGianCapNhatTrangThai: new Date(),
        },
      });
    }
  }
}

async function seedCustomersAndTickets() {
  const customers = [
    { MaKhachHang: 'KH100011', HoTenKhachHang: 'Nguyen Van Hung', SoDienThoai: '0901000001', Email: 'hung.nguyen@example.com', GioiTinh: 'Nam' },
    { MaKhachHang: 'KH100012', HoTenKhachHang: 'Tran Thi Mai', SoDienThoai: '0901000002', Email: 'mai.tran@example.com', GioiTinh: 'Nu' },
  ] as const;

  for (const customer of customers) {
    await prisma.kHACH_HANG.upsert({
      where: { MaKhachHang: customer.MaKhachHang },
      update: {
        HoTenKhachHang: customer.HoTenKhachHang,
        SoDienThoai: customer.SoDienThoai,
        Email: customer.Email,
        TrangThaiTaiKhoan: 'HoatDong',
      },
      create: {
        ...customer,
        MatKhau: 'Khachhang@123',
        NgaySinh: date('1995-01-01'),
        TrangThaiTaiKhoan: 'HoatDong',
        NgayDangKy: new Date(),
      },
    });
  }

  const tickets = [
    {
      MaDonHang: 'DH10000011',
      MaVe: 'VE100011',
      MaKhachHang: 'KH100011',
      HoTenNguoiDi: 'Nguyen Van Hung',
      SdtNguoiDi: '0901000001',
      EmailNguoiDi: 'hung.nguyen@example.com',
      MaLichTrinh: 'LT100001',
      MaXe: 'XE100002',
      SoGhe: '1A',
      MaDiemDon: 'DDT100003',
      MaDiemTra: 'DDT100004',
      GiaVe: 220000,
      TrangThaiVe: 'ChoKhoiHanh',
      TrangThaiThanhToan: 'ThanhCong',
      PhuongThucThanhToan: 'TienMat',
    },
    {
      MaDonHang: 'DH10000012',
      MaVe: 'VE100012',
      MaKhachHang: 'KH100012',
      HoTenNguoiDi: 'Tran Thi Mai',
      SdtNguoiDi: '0901000002',
      EmailNguoiDi: 'mai.tran@example.com',
      MaLichTrinh: 'LT100001',
      MaXe: 'XE100002',
      SoGhe: '2A',
      MaDiemDon: 'DDT100003',
      MaDiemTra: 'DDT100004',
      GiaVe: 220000,
      TrangThaiVe: 'ChoThanhToan',
      TrangThaiThanhToan: null,
      PhuongThucThanhToan: 'TienMat',
    },
  ] as const;

  for (const ticket of tickets) {
    const maGheChuyen = `${ticket.MaLichTrinh}_${ticket.MaXe}_GHE_${ticket.SoGhe}`;
    await prisma.dON_HANG.upsert({
      where: { MaDonHang: ticket.MaDonHang },
      update: {
        MaKhachHang: ticket.MaKhachHang,
        MaNVBanVe: banVeId,
        HoTenNguoiDi: ticket.HoTenNguoiDi,
        SdtNguoiDi: ticket.SdtNguoiDi,
        EmailNguoiDi: ticket.EmailNguoiDi,
        SoLuongVeDaDat: 1,
        TongGiaVe: money(ticket.GiaVe),
        PhuongThucThanhToan: ticket.PhuongThucThanhToan,
        TrangThaiDonHang: ticket.TrangThaiVe,
      },
      create: {
        MaDonHang: ticket.MaDonHang,
        MaKhachHang: ticket.MaKhachHang,
        MaNVBanVe: banVeId,
        HoTenNguoiDi: ticket.HoTenNguoiDi,
        SdtNguoiDi: ticket.SdtNguoiDi,
        EmailNguoiDi: ticket.EmailNguoiDi,
        ThoiGianDat: new Date(),
        SoLuongVeDaDat: 1,
        TongGiaVe: money(ticket.GiaVe),
        PhuongThucThanhToan: ticket.PhuongThucThanhToan,
        TrangThaiDonHang: ticket.TrangThaiVe,
      },
    });

    await prisma.vE_DIEN_TU.upsert({
      where: { MaVe: ticket.MaVe },
      update: {
        GiaVe: money(ticket.GiaVe),
        TrangThaiVe: ticket.TrangThaiVe,
        MaGheChuyen: maGheChuyen,
        MaDiemDon: ticket.MaDiemDon,
        MaDiemTra: ticket.MaDiemTra,
      },
      create: {
        MaVe: ticket.MaVe,
        GiaVe: money(ticket.GiaVe),
        TrangThaiVe: ticket.TrangThaiVe,
        SoLanDaSua: 0,
        ThoiGianXuatVe: new Date(),
        MaQRVe: ticket.MaVe,
        MaDonHang: ticket.MaDonHang,
        MaLichTrinh: ticket.MaLichTrinh,
        MaXe: ticket.MaXe,
        MaGheChuyen: maGheChuyen,
        MaDiemDon: ticket.MaDiemDon,
        MaDiemTra: ticket.MaDiemTra,
      },
    });

    await prisma.gHE_CHUYEN_XE.update({
      where: { MaGheChuyen: maGheChuyen },
      data: {
        TrangThaiGhe: 'DaBan',
        ThoiGianCapNhatTrangThai: new Date(),
      },
    });

    if (ticket.TrangThaiThanhToan) {
      const transactionId = ticket.MaDonHang.replace('DH', 'GD');
      await prisma.tHANH_TOAN.upsert({
        where: { MaGiaoDich: transactionId },
        update: {
          SoTien: money(ticket.GiaVe),
          TrangThaiGiaoDich: ticket.TrangThaiThanhToan,
          PhuongThucThanhToan: ticket.PhuongThucThanhToan,
        },
        create: {
          MaGiaoDich: transactionId,
          MaDonHang: ticket.MaDonHang,
          LoaiGiaoDich: 'ThanhToan',
          PhuongThucThanhToan: ticket.PhuongThucThanhToan,
          SoTien: money(ticket.GiaVe),
          ThoiGianGiaoDich: new Date(),
          TrangThaiGiaoDich: ticket.TrangThaiThanhToan,
          LichSuHoanTien: '',
        },
      });
    }
  }
}

async function seedContentAndLogs() {
  await prisma.cHINH_SACH_HUY_VE.upsert({
    where: { MaChinhSach: 'CSH100001' },
    update: {
      TrangThai: 'DangApDung',
      GioiHanGioTruocKhoiHanh: 12,
      TyLePhiHuy: 0.1,
    },
    create: {
      MaChinhSach: 'CSH100001',
      TenChinhSach: 'Chinh sach huy ve tieu chuan',
      GioiHanGioTruocKhoiHanh: 12,
      TyLePhiHuy: 0.1,
      MoTa: 'Cho phep huy ve truoc gio khoi hanh toi thieu 12 gio, phi huy 10%.',
      TrangThai: 'DangApDung',
      NgayApDung: date('2026-05-01'),
    },
  });

  await prisma.cHINH_SACH.upsert({
    where: { MaChinhSach_ND: 'CS100011' },
    update: {
      TieuDe: 'Quy dinh doi tra ve',
      NoiDung: 'Ve co the doi hoac huy theo chinh sach huy ve dang ap dung.',
      TrangThai: 'DangApDung',
    },
    create: {
      MaChinhSach_ND: 'CS100011',
      TieuDe: 'Quy dinh doi tra ve',
      LoaiChinhSach: 'ChinhSachHuyVe',
      NoiDung: 'Ve co the doi hoac huy theo chinh sach huy ve dang ap dung.',
      NgayApDung: date('2026-05-01'),
      TrangThai: 'DangApDung',
      MaQuanTriVien: qtvId,
    },
  });

  await prisma.tIN_TUC.upsert({
    where: { MaTinTuc: 'TT100011' },
    update: {
      TieuDe: 'TXP mo them chuyen Ha Noi - Quang Ninh',
      TrangThai: 'DaDang',
      NoiBat: true,
    },
    create: {
      MaTinTuc: 'TT100011',
      TieuDe: 'TXP mo them chuyen Ha Noi - Quang Ninh',
      AnhBia: null,
      LoaiTinTuc: 'ThongBao',
      MoTaNgan: 'Tang cuong chuyen cuoi tuan phuc vu nhu cau di lai.',
      NoiDungChiTiet: 'Lich trinh Ha Noi - Quang Ninh duoc bo sung trong thang 5/2026.',
      NgayDang: new Date(),
      TrangThai: 'DaDang',
      MaQuanTriVien: qtvId,
      NoiBat: true,
    },
  });

  await prisma.nHAT_KY_HE_THONG.upsert({
    where: { MaNhatKy: 'NK100011' },
    update: {
      NoiDungChiTiet: 'Cap nhat du lieu mau theo ID that tren Supabase',
      ThoiGian: new Date(),
      TrangThai: 'ThanhCong',
    },
    create: {
      MaNhatKy: 'NK100011',
      MaNhanVien: banVeId,
      LoaiThaoTac: 'Quan ly ve',
      NoiDungChiTiet: 'Cap nhat du lieu mau theo ID that tren Supabase',
      ThoiGian: new Date(),
      TrangThai: 'ThanhCong',
      DiaChiIP: '127.0.0.1',
      ThietBiTrinhDuyet: 'Seed data',
      DuLieuThayDoi: [],
      MaVe: 'VE100011',
    },
  });
}

async function main() {
  await cleanupOldDemoIds();
  await seedEmployees();
  await seedVehicles();
  await seedRoutesAndStops();
  await seedSchedules();
  await seedCustomersAndTickets();
  await seedContentAndLogs();

  const counts = {
    khachHang: await prisma.kHACH_HANG.count(),
    tuyenXe: await prisma.tUYEN_XE.count(),
    phuongTien: await prisma.pHUONG_TIEN.count(),
    lichTrinh: await prisma.lICH_TRINH.count(),
    gheChuyenXe: await prisma.gHE_CHUYEN_XE.count(),
    donHang: await prisma.dON_HANG.count(),
    ve: await prisma.vE_DIEN_TU.count(),
  };

  console.log('Seed data completed:', counts);
}

main()
  .catch(error => {
    console.error('Seed data failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
