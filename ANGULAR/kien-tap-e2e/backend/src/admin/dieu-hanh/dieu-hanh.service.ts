import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TienIch } from '@prisma/client';

@Injectable()
export class DieuHanhService implements OnModuleInit {
  private defaultCoordinatorId = 'NVDP100001';

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultCoordinator();
  }

  // Đảm bảo có ít nhất một nhân viên điều phối để thỏa mãn khóa ngoại
  private async ensureDefaultCoordinator() {
    try {
      const coordinator = await this.prisma.nHAN_VIEN_DIEU_PHOI.findUnique({
        where: { MaNVDieuPhoi: this.defaultCoordinatorId },
      });

      if (!coordinator) {
        // Kiểm tra xem nhân viên đã tồn tại chưa
        const nv = await this.prisma.nHAN_VIEN.findUnique({
          where: { MaNhanVien: this.defaultCoordinatorId },
        });

        if (!nv) {
          await this.prisma.nHAN_VIEN.create({
            data: {
              MaNhanVien: this.defaultCoordinatorId,
              LoaiTaiKhoan: 'NhanVienDieuPhoi',
              TenTruyCap: 'dieuphoi1',
              MatKhau: 'Dieuphoi@123',
              HoVaTenDem: 'Nguyễn Văn',
              Ten: 'Điều Phối',
              TenHienThi: 'Nguyễn Văn Điều Phối',
              SoDienThoai: '0913000111',
              Email: 'dp1@txpbus.vn',
              TrangThai: 'HoatDong',
            },
          });
        }

        await this.prisma.nHAN_VIEN_DIEU_PHOI.create({
          data: {
            MaNVDieuPhoi: this.defaultCoordinatorId,
          },
        });
      }
    } catch (e) {
      console.error('Lỗi khi khởi tạo Nhân viên điều phối mặc định:', e);
    }
  }

  // ==========================================
  // 1. QUẢN LÝ TUYẾN XE
  // ==========================================
  async getRoutes() {
    return this.prisma.tUYEN_XE.findMany({
      orderBy: { MaTuyenXe: 'asc' },
    });
  }

  async getRoute(id: string) {
    return this.prisma.tUYEN_XE.findUnique({
      where: { MaTuyenXe: id },
    });
  }

  async createRoute(data: any) {
    const count = await this.prisma.tUYEN_XE.count();
    const id = `TX${100000 + count + 1}`;

    // Convert totalTime string or numeric values to DateTime for ThoiGianDiChuyenDuKien
    let thoiGianDuKien = new Date();
    thoiGianDuKien.setHours(data.estimatedHours || 0, data.estimatedMinutes || 0, 0, 0);

    return this.prisma.tUYEN_XE.create({
      data: {
        MaTuyenXe: id,
        TenTuyenXe: data.name,
        DiemKhoiHanh: data.startPoint,
        DiemDen: data.endPoint,
        KhoangCach: data.distance ? parseFloat(data.distance) : 0,
        ThoiGianDiChuyenDuKien: thoiGianDuKien,
        TrangThaiTuyenXe: (data.status === 'locked' || data.status === 'DaKhoa') ? 'DaKhoa' : 'DangHoatDong',
        MaNVDieuPhoi: this.defaultCoordinatorId,
      },
    });
  }

  async updateRoute(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.TenTuyenXe = data.name;
    if (data.startPoint !== undefined) updateData.DiemKhoiHanh = data.startPoint;
    if (data.endPoint !== undefined) updateData.DiemDen = data.endPoint;
    if (data.distance !== undefined) updateData.KhoangCach = parseFloat(data.distance);
    if (data.status !== undefined) updateData.TrangThaiTuyenXe = (data.status === 'locked' || data.status === 'DaKhoa') ? 'DaKhoa' : 'DangHoatDong';

    if (data.estimatedHours !== undefined || data.estimatedMinutes !== undefined) {
      const h = data.estimatedHours !== undefined ? data.estimatedHours : 0;
      const m = data.estimatedMinutes !== undefined ? data.estimatedMinutes : 0;
      const thoiGian = new Date();
      thoiGian.setHours(h, m, 0, 0);
      updateData.ThoiGianDiChuyenDuKien = thoiGian;
    }

    return this.prisma.tUYEN_XE.update({
      where: { MaTuyenXe: id },
      data: updateData,
    });
  }

  async deleteRoute(id: string) {
    return this.prisma.tUYEN_XE.delete({
      where: { MaTuyenXe: id },
    });
  }

  // ==========================================
  // 2. QUẢN LÝ PHƯƠNG TIỆN
  // ==========================================
  async getVehicles() {
    return this.prisma.pHUONG_TIEN.findMany({
      orderBy: { MaXe: 'asc' },
    });
  }

  async getVehicle(id: string) {
    return this.prisma.pHUONG_TIEN.findUnique({
      where: { MaXe: id },
    });
  }

  async createVehicle(data: any) {
    const count = await this.prisma.pHUONG_TIEN.count();
    const id = `XE${100000 + count + 1}`;

    return this.prisma.pHUONG_TIEN.create({
      data: {
        MaXe: id,
        TenXe: data.name,
        BienSoXe: data.licensePlate,
        LoaiXe: data.type === 'Limousine 22 phòng' ? 'Limousine_22_ph_ng' : data.type,
        SoTang: data.floors ? parseInt(data.floors) : 1,
        SoDay: data.rows ? parseInt(data.rows) : 2,
        SoGhe: data.seats ? parseInt(data.seats) : 22,
        TienIch: data.amenities ? this.formatTienIch(data.amenities) : [],
        HanDangKiem: data.registrationExpiry ? this.parseDateString(data.registrationExpiry) : new Date(),
        HanBaoHiem: data.insuranceExpiry ? this.parseDateString(data.insuranceExpiry) : new Date(),
        AnhXe: data.vehicleImage || null,
        TrangThaiPhuongTien: (data.status === 'locked' || data.status === 'DaKhoa') ? 'DaKhoa' : 'DangHoatDong',
        MaNVDieuPhoi: this.defaultCoordinatorId,
      },
    });
  }

  async updateVehicle(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.TenXe = data.name;
    if (data.licensePlate !== undefined) updateData.BienSoXe = data.licensePlate;
    if (data.type !== undefined) updateData.LoaiXe = data.type === 'Limousine 22 phòng' ? 'Limousine_22_ph_ng' : data.type;
    if (data.floors !== undefined) updateData.SoTang = parseInt(data.floors);
    if (data.rows !== undefined) updateData.SoDay = parseInt(data.rows);
    if (data.seats !== undefined) updateData.SoGhe = parseInt(data.seats);
    if (data.amenities !== undefined) updateData.TienIch = this.formatTienIch(data.amenities);
    if (data.registrationExpiry !== undefined) updateData.HanDangKiem = this.parseDateString(data.registrationExpiry);
    if (data.insuranceExpiry !== undefined) updateData.HanBaoHiem = this.parseDateString(data.insuranceExpiry);
    if (data.vehicleImage !== undefined) updateData.AnhXe = data.vehicleImage;
    if (data.status !== undefined) updateData.TrangThaiPhuongTien = (data.status === 'locked' || data.status === 'DaKhoa') ? 'DaKhoa' : 'DangHoatDong';

    return this.prisma.pHUONG_TIEN.update({
      where: { MaXe: id },
      data: updateData,
    });
  }

  async deleteVehicle(id: string) {
    return this.prisma.pHUONG_TIEN.delete({
      where: { MaXe: id },
    });
  }

  // ==========================================
  // 3. QUẢN LÝ TÀI XẾ & PHỤ XE
  // ==========================================
  async getStaff() {
    return this.prisma.tAI_XE_PHU_XE.findMany({
      orderBy: { MaTaiXePhuXe: 'asc' },
    });
  }

  async getStaffMember(id: string) {
    return this.prisma.tAI_XE_PHU_XE.findUnique({
      where: { MaTaiXePhuXe: id },
    });
  }

  async createStaffMember(data: any) {
    const count = await this.prisma.tAI_XE_PHU_XE.count();
    const id = `TXPX${100000 + count + 1}`;

    return this.prisma.tAI_XE_PHU_XE.create({
      data: {
        MaTaiXePhuXe: id,
        LoaiNhanVien: (data.role === 'driver' || data.role === 'TaiXe') ? 'TaiXe' : 'PhuXe',
        HoTen: data.name,
        NgaySinh: data.dob ? this.parseDateString(data.dob) : null,
        SoDienThoai: data.phone,
        CCCD: data.cccdNumber || null,
        LoaiBangLai: data.licenseClass || null,
        ThoiHanBangLai: data.licenseExpiry ? this.parseDateString(data.licenseExpiry) : null,
        AnhBangLai: data.licenseFront || null,
        AnhChanDung: data.avatar || null,
        AnhCCCD: data.cccdFront || null,
        TrangThaiLamViec: (data.status === 'locked' || data.status === 'DaKhoa') ? 'DaKhoa' : 'DangLamViec',
      },
    });
  }

  async updateStaffMember(id: string, data: any) {
    const updateData: any = {};
    if (data.role !== undefined) updateData.LoaiNhanVien = (data.role === 'driver' || data.role === 'TaiXe') ? 'TaiXe' : 'PhuXe';
    if (data.name !== undefined) updateData.HoTen = data.name;
    if (data.dob !== undefined) updateData.NgaySinh = data.dob ? this.parseDateString(data.dob) : null;
    if (data.phone !== undefined) updateData.SoDienThoai = data.phone;
    if (data.cccdNumber !== undefined) updateData.CCCD = data.cccdNumber;
    if (data.licenseClass !== undefined) updateData.LoaiBangLai = data.licenseClass;
    if (data.licenseExpiry !== undefined) updateData.ThoiHanBangLai = data.licenseExpiry ? this.parseDateString(data.licenseExpiry) : null;
    if (data.licenseFront !== undefined) updateData.AnhBangLai = data.licenseFront;
    if (data.avatar !== undefined) updateData.AnhChanDung = data.avatar;
    if (data.cccdFront !== undefined) updateData.AnhCCCD = data.cccdFront;
    if (data.status !== undefined) updateData.TrangThaiLamViec = (data.status === 'locked' || data.status === 'DaKhoa') ? 'DaKhoa' : 'DangLamViec';

    return this.prisma.tAI_XE_PHU_XE.update({
      where: { MaTaiXePhuXe: id },
      data: updateData,
    });
  }

  async deleteStaffMember(id: string) {
    return this.prisma.tAI_XE_PHU_XE.delete({
      where: { MaTaiXePhuXe: id },
    });
  }

  // ==========================================
  // 4. QUẢN LÝ ĐIỂM ĐÓN TRẢ DỪNG
  // ==========================================
  async getPoints() {
    return this.prisma.dIEM_DON_TRA_DUNG.findMany({
      orderBy: { MaDiem: 'asc' },
    });
  }

  async getPoint(id: string) {
    return this.prisma.dIEM_DON_TRA_DUNG.findUnique({
      where: { MaDiem: id },
    });
  }

  async createPoint(data: any) {
    const count = await this.prisma.dIEM_DON_TRA_DUNG.count();
    const id = `DDT${100000 + count + 1}`;

    let tuyenXeId = data.routeId;
    if (!tuyenXeId) {
      const firstRoute = await this.prisma.tUYEN_XE.findFirst();
      tuyenXeId = firstRoute ? firstRoute.MaTuyenXe : 'TX001';
      if (!firstRoute) {
        await this.prisma.tUYEN_XE.create({
          data: {
            MaTuyenXe: 'TX001',
            TenTuyenXe: 'Tuyến đường ảo phục vụ điểm đón',
            DiemKhoiHanh: 'Điểm khởi hành',
            DiemDen: 'Điểm đến',
            ThoiGianDiChuyenDuKien: new Date(),
            TrangThaiTuyenXe: 'DangHoatDong',
            MaNVDieuPhoi: this.defaultCoordinatorId,
          }
        });
      }
    }

    const gioCoMat = new Date();
    gioCoMat.setHours(0, 0, 0, 0);

    return this.prisma.dIEM_DON_TRA_DUNG.create({
      data: {
        MaDiem: id,
        MaTuyenXe: tuyenXeId,
        TenDiem: data.name,
        ThanhPho: data.city,
        Tinh: data.city,
        DiaChi: data.address,
        LinkGoogleMap: data.mapLink || null,
        AnhDiem: data.image || null,
        LoaiDiem: data.type === 'dung' ? 'DiemDung' : 'DiemDonTra',
        ThoiGianCoMatTruoc: 15,
        GioCanCoMat: gioCoMat,
        TrangThaiDiem: (data.status === 'locked' || data.status === 'DaKhoa') ? 'DaKhoa' : 'DangHoatDong',
        MaNVDieuPhoi: this.defaultCoordinatorId,
      },
    });
  }

  async updatePoint(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.TenDiem = data.name;
    if (data.city !== undefined) {
      updateData.ThanhPho = data.city;
      updateData.Tinh = data.city;
    }
    if (data.address !== undefined) updateData.DiaChi = data.address;
    if (data.mapLink !== undefined) updateData.LinkGoogleMap = data.mapLink;
    if (data.image !== undefined) updateData.AnhDiem = data.image;
    if (data.type !== undefined) updateData.LoaiDiem = data.type === 'dung' ? 'DiemDung' : 'DiemDonTra';
    if (data.status !== undefined) updateData.TrangThaiDiem = (data.status === 'locked' || data.status === 'DaKhoa') ? 'DaKhoa' : 'DangHoatDong';

    return this.prisma.dIEM_DON_TRA_DUNG.update({
      where: { MaDiem: id },
      data: updateData,
    });
  }

  async deletePoint(id: string) {
    return this.prisma.dIEM_DON_TRA_DUNG.delete({
      where: { MaDiem: id },
    });
  }

  // ==========================================
  // 5. QUẢN LÝ LỊCH TRÌNH
  // ==========================================
  async getSchedules() {
    return this.prisma.lICH_TRINH.findMany({
      include: {
        TUYEN_XE: true,
        PHUONG_TIEN: true,
        PHAN_CONG_CHUYEN: {
          include: {
            TAI_XE_PHU_XE: true,
          },
        },
        LICH_TRINH_DIEM_DUNG: {
          include: {
            DIEM_DON_TRA_DUNG: true,
          },
          orderBy: {
            GioDenDuKien: 'asc',
          },
        },
      },
      orderBy: { MaLichTrinh: 'desc' },
    });
  }

  async getSchedule(id: string) {
    return this.prisma.lICH_TRINH.findUnique({
      where: { MaLichTrinh: id },
      include: {
        TUYEN_XE: true,
        PHUONG_TIEN: true,
        PHAN_CONG_CHUYEN: {
          include: {
            TAI_XE_PHU_XE: true,
          },
        },
        LICH_TRINH_DIEM_DUNG: {
          include: {
            DIEM_DON_TRA_DUNG: true,
          },
          orderBy: {
            GioDenDuKien: 'asc',
          },
        },
      },
    });
  }

  async createSchedule(data: any) {
    const count = await this.prisma.lICH_TRINH.count();
    const id = `LT${100000 + count + 1}`;

    let route = await this.prisma.tUYEN_XE.findFirst({
      where: { TenTuyenXe: data.routeName },
    });
    if (!route) {
      route = await this.prisma.tUYEN_XE.findFirst();
    }
    const routeId = route ? route.MaTuyenXe : 'TX001';

    let vehicle = await this.prisma.pHUONG_TIEN.findFirst({
      where: { BienSoXe: data.vehiclePlate },
    });
    if (!vehicle) {
      vehicle = await this.prisma.pHUONG_TIEN.findFirst();
    }
    const vehicleId = vehicle ? vehicle.MaXe : 'XE001';

    const depDate = data.departureDate ? this.parseDateString(data.departureDate) : new Date();
    const depTime = data.departureTime ? this.parseTimeString(data.departureTime) : new Date();
    const checkinTime = new Date(depTime.getTime() - 15 * 60 * 1000);
    const arrTime = data.arrivalTime ? this.parseTimeString(data.arrivalTime) : new Date(depTime.getTime() + 4 * 60 * 60 * 1000);

    const newSchedule = await this.prisma.lICH_TRINH.create({
      data: {
        MaLichTrinh: id,
        NgayKhoiHanh: depDate,
        GioKhoiHanh: depTime,
        GioGoiYCoMat: checkinTime,
        GioDenDuKien: arrTime,
        GiaVeCoBan: data.basePrice || 200000,
        TrangThaiLichTrinh: data.status || 'ChoKhoiHanh',
        MaTuyenXe: routeId,
        MaXe: vehicleId,
        MaNVDieuPhoi: this.defaultCoordinatorId,
      },
    });

    if (data.driverName) {
      const driver = await this.prisma.tAI_XE_PHU_XE.findFirst({
        where: { HoTen: data.driverName, LoaiNhanVien: 'TaiXe' },
      });
      if (driver) {
        await this.prisma.pHAN_CONG_CHUYEN.create({
          data: {
            MaPhanCong: `PC${id}D`,
            MaLichTrinh: id,
            MaTaiXePhuXe: driver.MaTaiXePhuXe,
            VaiTro: 'Tài xế chính',
          },
        });
      }
    }

    if (data.assistantName) {
      const assistant = await this.prisma.tAI_XE_PHU_XE.findFirst({
        where: { HoTen: data.assistantName, LoaiNhanVien: 'PhuXe' },
      });
      if (assistant) {
        await this.prisma.pHAN_CONG_CHUYEN.create({
          data: {
            MaPhanCong: `PC${id}A`,
            MaLichTrinh: id,
            MaTaiXePhuXe: assistant.MaTaiXePhuXe,
            VaiTro: 'Phụ xe',
          },
        });
      }
    }

    if (data.pickupPoints && Array.isArray(data.pickupPoints)) {
      for (const item of data.pickupPoints) {
        if (!item.point) continue;
        const pt = await this.prisma.dIEM_DON_TRA_DUNG.findFirst({
          where: { TenDiem: item.point },
        });
        if (pt) {
          let y = depDate.getUTCFullYear();
          let m = depDate.getUTCMonth();
          let d = depDate.getUTCDate();
          if (item.date) {
            const parts = item.date.split('/');
            if (parts.length === 3) {
              y = parseInt(parts[2]);
              m = parseInt(parts[1]) - 1;
              d = parseInt(parts[0]);
            }
          }

          await this.prisma.lICH_TRINH_DIEM_DUNG.create({
            data: {
              MaLichTrinhDiemDung: `LTDD_${id}_P_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
              MaLichTrinh: id,
              MaDiem: pt.MaDiem,
              GioDenDuKien: new Date(Date.UTC(1970, 0, 1, item.hour || 0, item.minute || 0, 0)),
              Ngay: new Date(Date.UTC(y, m, d, 12, 0, 0)),
            },
          });
        }
      }
    }

    if (data.dropoffPoints && Array.isArray(data.dropoffPoints)) {
      for (const item of data.dropoffPoints) {
        if (!item.point) continue;
        const pt = await this.prisma.dIEM_DON_TRA_DUNG.findFirst({
          where: { TenDiem: item.point },
        });
        if (pt) {
          let y = depDate.getUTCFullYear();
          let m = depDate.getUTCMonth();
          let d = depDate.getUTCDate();
          if (item.date) {
            const parts = item.date.split('/');
            if (parts.length === 3) {
              y = parseInt(parts[2]);
              m = parseInt(parts[1]) - 1;
              d = parseInt(parts[0]);
            }
          }

          await this.prisma.lICH_TRINH_DIEM_DUNG.create({
            data: {
              MaLichTrinhDiemDung: `LTDD_${id}_D_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
              MaLichTrinh: id,
              MaDiem: pt.MaDiem,
              GioDenDuKien: new Date(Date.UTC(1970, 0, 1, item.hour || 0, item.minute || 0, 0)),
              Ngay: new Date(Date.UTC(y, m, d, 12, 0, 0)),
            },
          });
        }
      }
    }

    return newSchedule;
  }

  async updateSchedule(id: string, data: any) {
    const updateData: any = {};
    if (data.status !== undefined) updateData.TrangThaiLichTrinh = data.status;
    if (data.basePrice !== undefined) updateData.GiaVeCoBan = data.basePrice;

    if (data.departureDate !== undefined) {
      updateData.NgayKhoiHanh = this.parseDateString(data.departureDate);
    }
    if (data.departureTime !== undefined) {
      updateData.GioKhoiHanh = this.parseTimeString(data.departureTime);
    }
    if (data.arrivalTime !== undefined) {
      updateData.GioDenDuKien = this.parseTimeString(data.arrivalTime);
    }

    if (data.routeName !== undefined) {
      const route = await this.prisma.tUYEN_XE.findFirst({
        where: { TenTuyenXe: data.routeName },
      });
      if (route) updateData.MaTuyenXe = route.MaTuyenXe;
    }

    if (data.vehiclePlate !== undefined) {
      const vehicle = await this.prisma.pHUONG_TIEN.findFirst({
        where: { BienSoXe: data.vehiclePlate },
      });
      if (vehicle) updateData.MaXe = vehicle.MaXe;
    }

    const updated = await this.prisma.lICH_TRINH.update({
      where: { MaLichTrinh: id },
      data: updateData,
    });

    if (data.driverName !== undefined) {
      await this.prisma.pHAN_CONG_CHUYEN.deleteMany({
        where: { MaLichTrinh: id, VaiTro: 'Tài xế chính' },
      });
      if (data.driverName) {
        const driver = await this.prisma.tAI_XE_PHU_XE.findFirst({
          where: { HoTen: data.driverName, LoaiNhanVien: 'TaiXe' },
        });
        if (driver) {
          await this.prisma.pHAN_CONG_CHUYEN.create({
            data: {
              MaPhanCong: `PC${id}D`,
              MaLichTrinh: id,
              MaTaiXePhuXe: driver.MaTaiXePhuXe,
              VaiTro: 'Tài xế chính',
            },
          });
        }
      }
    }

    if (data.assistantName !== undefined) {
      await this.prisma.pHAN_CONG_CHUYEN.deleteMany({
        where: { MaLichTrinh: id, VaiTro: 'Phụ xe' },
      });
      if (data.assistantName) {
        const assistant = await this.prisma.tAI_XE_PHU_XE.findFirst({
          where: { HoTen: data.assistantName, LoaiNhanVien: 'PhuXe' },
        });
        if (assistant) {
          await this.prisma.pHAN_CONG_CHUYEN.create({
            data: {
              MaPhanCong: `PC${id}A`,
              MaLichTrinh: id,
              MaTaiXePhuXe: assistant.MaTaiXePhuXe,
              VaiTro: 'Phụ xe',
            },
          });
        }
      }
    }

    if (data.pickupPoints !== undefined || data.dropoffPoints !== undefined) {
      await this.prisma.lICH_TRINH_DIEM_DUNG.deleteMany({
        where: { MaLichTrinh: id },
      });

      const depDate = updated.NgayKhoiHanh || new Date();

      if (data.pickupPoints && Array.isArray(data.pickupPoints)) {
        for (const item of data.pickupPoints) {
          if (!item.point) continue;
          const pt = await this.prisma.dIEM_DON_TRA_DUNG.findFirst({
            where: { TenDiem: item.point },
          });
          if (pt) {
            let y = depDate.getUTCFullYear();
            let m = depDate.getUTCMonth();
            let d = depDate.getUTCDate();
            if (item.date) {
              const parts = item.date.split('/');
              if (parts.length === 3) {
                y = parseInt(parts[2]);
                m = parseInt(parts[1]) - 1;
                d = parseInt(parts[0]);
              }
            }

            await this.prisma.lICH_TRINH_DIEM_DUNG.create({
              data: {
                MaLichTrinhDiemDung: `LTDD_${id}_P_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
                MaLichTrinh: id,
                MaDiem: pt.MaDiem,
                GioDenDuKien: new Date(Date.UTC(1970, 0, 1, item.hour || 0, item.minute || 0, 0)),
                Ngay: new Date(Date.UTC(y, m, d, 12, 0, 0)),
              },
            });
          }
        }
      }

      if (data.dropoffPoints && Array.isArray(data.dropoffPoints)) {
        for (const item of data.dropoffPoints) {
          if (!item.point) continue;
          const pt = await this.prisma.dIEM_DON_TRA_DUNG.findFirst({
            where: { TenDiem: item.point },
          });
          if (pt) {
            let y = depDate.getUTCFullYear();
            let m = depDate.getUTCMonth();
            let d = depDate.getUTCDate();
            if (item.date) {
              const parts = item.date.split('/');
              if (parts.length === 3) {
                y = parseInt(parts[2]);
                m = parseInt(parts[1]) - 1;
                d = parseInt(parts[0]);
              }
            }

            await this.prisma.lICH_TRINH_DIEM_DUNG.create({
              data: {
                MaLichTrinhDiemDung: `LTDD_${id}_D_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
                MaLichTrinh: id,
                MaDiem: pt.MaDiem,
                GioDenDuKien: new Date(Date.UTC(1970, 0, 1, item.hour || 0, item.minute || 0, 0)),
                Ngay: new Date(Date.UTC(y, m, d, 12, 0, 0)),
              },
            });
          }
        }
      }
    }

    return updated;
  }

  async deleteSchedule(id: string) {
    await this.prisma.pHAN_CONG_CHUYEN.deleteMany({
      where: { MaLichTrinh: id },
    });
    await this.prisma.lICH_TRINH_DIEM_DUNG.deleteMany({
      where: { MaLichTrinh: id },
    });
    return this.prisma.lICH_TRINH.delete({
      where: { MaLichTrinh: id },
    });
  }

  private parseDateString(dateStr: string): Date {
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      return new Date(Date.UTC(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 12, 0, 0));
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date();
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0));
  }

  private parseTimeString(timeStr: string): Date {
    const parts = timeStr.split(':');
    return new Date(Date.UTC(1970, 0, 1, parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0));
  }

  private formatTienIch(amenities: string[]): TienIch[] {
    if (!amenities || !Array.isArray(amenities)) return [];
    const AMENITY_MAP: { [key: string]: TienIch } = {
      tivi: TienIch.Tivi,
      usb: TienIch.s_c__USB,
      wifi: TienIch.Wifi,
      water: TienIch.N__c__kh_n___t,
      gps: TienIch.GPS,
      aircon: TienIch.i_u_h_a,
    };
    return amenities
      .map(a => AMENITY_MAP[a.toLowerCase()])
      .filter((a): a is TienIch => !!a);
  }
}
