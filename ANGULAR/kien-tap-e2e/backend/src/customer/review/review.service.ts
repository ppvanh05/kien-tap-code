import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NhatKyHeThongService } from '../../admin/nhat-ky-he-thong/nhat-ky-he-thong.service';

const MA_DANH_GIA_PREFIX = 'DG';
const MA_DANH_GIA_WIDTH = 6;
const MA_DANH_GIA_START = 100001;
const MA_DANH_GIA_MAX_ATTEMPTS = 5;

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService
  ) {}

  private parseMaDanhGiaNumber(id: string | null | undefined): number {
    if (!id || !id.startsWith(MA_DANH_GIA_PREFIX)) {
      return 0;
    }
    const numPart = id.slice(MA_DANH_GIA_PREFIX.length).replace(/[^0-9]/g, '');
    const parsed = parseInt(numPart, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private formatMaDanhGia(value: number): string {
    return `${MA_DANH_GIA_PREFIX}${String(value).padStart(MA_DANH_GIA_WIDTH, '0')}`;
  }

  private async generateNextMaDanhGia(tx: Prisma.TransactionClient): Promise<string> {
    const rows = await tx.dANH_GIA.findMany({
      where: { MaDanhGia: { startsWith: MA_DANH_GIA_PREFIX } },
      select: { MaDanhGia: true },
    });

    let maxNum = MA_DANH_GIA_START - 1;
    for (const row of rows) {
      maxNum = Math.max(maxNum, this.parseMaDanhGiaNumber(row.MaDanhGia));
    }

    const nextNum = Math.max(maxNum + 1, MA_DANH_GIA_START);
    return this.formatMaDanhGia(nextNum);
  }

  private isMaDanhGiaUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      Array.isArray(error.meta?.target) &&
      (error.meta.target as string[]).includes('MaDanhGia')
    );
  }

  async create(createReviewDto: any) {
    const { MaVe, MaKhachHang, SoSao, NoiDungDanhGia, mediaUrls } = createReviewDto;

    // --- Validation rules ---
    const fieldErrors: Record<string, string> = {};

    // Rating validation
    if (SoSao === undefined || SoSao === null || typeof SoSao !== 'number' || SoSao < 1 || SoSao > 5) {
      fieldErrors.SoSao = 'Số sao không hợp lệ. Vui lòng chọn 1-5 sao.';
    }

    // Content validation (required and length)
    const content = (NoiDungDanhGia || '').toString().trim();
    if (!content) {
      fieldErrors.NoiDungDanhGia = 'Nội dung nhận xét không được bỏ trống.';
    } else if (content.length < 10) {
      fieldErrors.NoiDungDanhGia = 'Nội dung quá ngắn. Vui lòng nhập ít nhất 10 ký tự.';
    } else if (content.length > 2000) {
      fieldErrors.NoiDungDanhGia = 'Nội dung quá dài. Vui lòng giới hạn dưới 2000 ký tự.';
    }

    // Ensure ticket exists and business rules (one review per ticket, within 7 days after trip end)
    const ticket = await this.prisma.vE_DIEN_TU.findUnique({
      where: { MaVe: MaVe },
      include: { LICH_TRINH: true },
    });

    if (!ticket) {
      throw new BadRequestException('Không tìm thấy vé tương ứng để đánh giá.');
    }

    // Check existing review for this ticket
    const existingReviewCount = await this.prisma.dANH_GIA.count({ where: { MaVe: MaVe } });
    if (existingReviewCount > 0) {
      fieldErrors.NoiDungDanhGia = 'Mỗi vé chỉ được phép gửi một đánh giá duy nhất.';
    }

    // Check 7-day window from end of trip
    const schedule = ticket.LICH_TRINH;
    if (schedule) {
      // Determine trip end datetime: use GioDenDuKien fallback to GioKhoiHanh
      const dateStr = schedule.NgayKhoiHanh ? schedule.NgayKhoiHanh : null;
      const timeStr = schedule.GioDenDuKien || schedule.GioKhoiHanh || null;
      if (dateStr && timeStr) {
        try {
          const [y, m, d] = dateStr.toString().split('-').map(Number);
          const [hh, mm] = timeStr.toString().split(':').map(Number);
          const endDate = new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
          const now = new Date();
          const diffMs = now.getTime() - endDate.getTime();
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
          if (diffMs < 0) {
            fieldErrors.NoiDungDanhGia = 'Chuyến đi chưa kết thúc, chưa thể đánh giá.';
          } else if (diffMs > sevenDaysMs) {
            fieldErrors.NoiDungDanhGia = 'Thời hạn đánh giá đã hết (hết 07 ngày kể từ khi kết thúc chuyến đi).';
          }
        } catch (e) {
          // ignore parsing errors
        }
      }
    }

    // Check forbidden keywords and links
    const forbidden = await this.prisma.tU_KHOA_HAN_CHE.findMany({ where: {} });
    const forbiddenList = (forbidden || []).map(f => (f.NoiDungTuKhoa || '').toString().toLowerCase()).filter(Boolean);
    const contentLower = content.toLowerCase();
    // URL detection
    const urlRegex = /(https?:\/\/|www\.)[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?/i;
    if (urlRegex.test(contentLower)) {
      fieldErrors.NoiDungDanhGia = 'Nội dung chứa liên kết không hợp lệ.';
    }
    for (const kw of forbiddenList) {
      if (kw && contentLower.includes(kw)) {
        fieldErrors.NoiDungDanhGia = 'Nội dung vi phạm chính sách nội dung.';
        break;
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw new BadRequestException({ message: 'Dữ liệu nhập không hợp lệ', fieldErrors });
    }

    let result: Awaited<ReturnType<typeof this.createReviewInTransaction>> | undefined;

    for (let attempt = 1; attempt <= MA_DANH_GIA_MAX_ATTEMPTS; attempt++) {
      try {
        result = await this.prisma.$transaction(async (tx) =>
          this.createReviewInTransaction(tx, {
            MaVe,
            MaKhachHang,
            SoSao,
            NoiDungDanhGia,
            mediaUrls,
          }),
        );
        break;
      } catch (error) {
        if (this.isMaDanhGiaUniqueConstraintError(error) && attempt < MA_DANH_GIA_MAX_ATTEMPTS) {
          continue;
        }
        throw error;
      }
    }

    if (!result) {
      throw new Error('Không thể tạo mã đánh giá duy nhất sau nhiều lần thử.');
    }

    await this.nhatKyService.ghiLog({
      MaKhachHang: MaKhachHang,
      MaVe: MaVe,
      LoaiThaoTac: 'Đánh giá dịch vụ',
      NoiDungChiTiet: `Khách hàng đánh giá chuyến xe với ${SoSao} sao.`,
      TrangThai: 'Thành công',
    });

    return result;
  }

  private async createReviewInTransaction(
    tx: Prisma.TransactionClient,
    input: {
      MaVe: string;
      MaKhachHang: string;
      SoSao: number;
      NoiDungDanhGia: string;
      mediaUrls?: string[];
    },
  ) {
    const { MaVe, MaKhachHang, SoSao, NoiDungDanhGia, mediaUrls } = input;

    const generatedMaDanhGia = await this.generateNextMaDanhGia(tx);
    console.log('Generated MaDanhGia:', generatedMaDanhGia);

    const newReview = await tx.dANH_GIA.create({
      data: {
        MaDanhGia: generatedMaDanhGia,
        SoSao,
        NoiDungDanhGia,
        ThoiGianDanhGia: new Date(),
        TrangThaiPhanHoi: 'ChuaPhanHoi',
        KHACH_HANG: {
          connect: { MaKhachHang: MaKhachHang },
        },
        VE_DIEN_TU: {
          connect: { MaVe: MaVe },
        },
      },
    });

    if (mediaUrls && mediaUrls.length > 0) {
      const mediaData = mediaUrls.map((url) => ({
        MaDanhGia: newReview.MaDanhGia,
        DuongDanFile: url,
      }));
      await tx.mEDIA_DANH_GIA.createMany({
        data: mediaData,
      });
    }

    const ticket = await tx.vE_DIEN_TU.findUnique({ where: { MaVe: MaVe } });
    if (ticket && ticket.MaDonHang) {
      await tx.dON_HANG.update({
        where: { MaDonHang: ticket.MaDonHang },
        data: { TrangThaiDonHang: 'DaDanhGia' },
      });

      await tx.vE_DIEN_TU.updateMany({
        where: { MaDonHang: ticket.MaDonHang },
        data: { TrangThaiVe: 'DaDanhGia' },
      });
    }

    return newReview;
  }

  async getReviews(params: {
    page: number;
    limit: number;
    rating?: number;
    hasComment?: boolean;
    hasImage?: boolean;
  }) {
    console.time('getReviews');
    const { page, limit, rating, hasComment, hasImage } = params;

    const where: Prisma.DANH_GIAWhereInput = {};

    if (rating !== undefined) {
      where.SoSao = rating;
    }

    if (hasComment === true) {
      where.NoiDungDanhGia = {
        not: null,
        notIn: [''],
      };
    } else if (hasComment === false) {
      where.OR = [{ NoiDungDanhGia: null }, { NoiDungDanhGia: '' }];
    }

    if (hasImage === true) {
      where.MEDIA_DANH_GIA = {
        some: {},
      };
    } else if (hasImage === false) {
      where.MEDIA_DANH_GIA = {
        none: {},
      };
    }

    const commentWhere: Prisma.DANH_GIAWhereInput = {
      AND: [{ NoiDungDanhGia: { not: null } }, { NOT: { NoiDungDanhGia: '' } }],
    };

    const formatAvg = (value: number | null | undefined) =>
      value != null ? parseFloat(value.toFixed(1)) : 0;

    const [
      statsAgg,
      ratingGroups,
      commentCount,
      imageCount,
      totalItems,
      items,
    ] = await Promise.all([
      this.prisma.dANH_GIA.aggregate({
        _count: { _all: true },
        _avg: {
          SoSao: true,
          DiemAnToan: true,
          DiemSachSe: true,
          DiemThaiDo: true,
          DiemDungGio: true,
          DiemThongTin: true,
          DiemTienNghi: true,
        },
      }),
      this.prisma.dANH_GIA.groupBy({
        by: ['SoSao'],
        _count: { _all: true },
      }),
      this.prisma.dANH_GIA.count({ where: commentWhere }),
      this.prisma.dANH_GIA.count({
        where: { MEDIA_DANH_GIA: { some: {} } },
      }),
      this.prisma.dANH_GIA.count({ where }),
      this.prisma.dANH_GIA.findMany({
        where,
        orderBy: {
          ThoiGianDanhGia: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          KHACH_HANG: {
            select: {
              HoTenKhachHang: true,
              AnhDaiDien: true,
            },
          },
          MEDIA_DANH_GIA: {
            select: {
              DuongDanFile: true,
            },
          },
          VE_DIEN_TU: {
            select: {
              LICH_TRINH: {
                select: {
                  TUYEN_XE: {
                    select: {
                      TenTuyenXe: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const totalReviews = statsAgg._count._all;
    const averageOverall = formatAvg(statsAgg._avg.SoSao);

    const criteriaAverage = {
      anToan: formatAvg(statsAgg._avg.DiemAnToan),
      sachSe: formatAvg(statsAgg._avg.DiemSachSe),
      thaiDoNhanVien: formatAvg(statsAgg._avg.DiemThaiDo),
      dungGio: formatAvg(statsAgg._avg.DiemDungGio),
      thongTinDayDu: formatAvg(statsAgg._avg.DiemThongTin),
      tienNghi: formatAvg(statsAgg._avg.DiemTienNghi),
    };

    const ratingCountMap = Object.fromEntries(
      ratingGroups.map((group) => [group.SoSao, group._count._all]),
    );

    const ratingCount = {
      five: ratingCountMap[5] ?? 0,
      four: ratingCountMap[4] ?? 0,
      three: ratingCountMap[3] ?? 0,
      two: ratingCountMap[2] ?? 0,
      one: ratingCountMap[1] ?? 0,
    };

    const totalPages = Math.ceil(totalItems / limit);

    const formattedItems = items.map((item) => ({
      id: item.MaDanhGia,
      author: item.KHACH_HANG?.HoTenKhachHang || 'Khách hàng',
      avatar: item.KHACH_HANG?.AnhDaiDien || 'asset/images/customer/avatar_placeholder.png',
      date: item.ThoiGianDanhGia,
      rating: item.SoSao,
      content: item.NoiDungDanhGia || '',
      images: item.MEDIA_DANH_GIA?.map((m) => m.DuongDanFile).filter(Boolean) || [],
      route: item.VE_DIEN_TU?.LICH_TRINH?.TUYEN_XE?.TenTuyenXe || 'Tuyến xe liên tỉnh',
      diemAnToan: item.DiemAnToan,
      diemSachSe: item.DiemSachSe,
      diemThaiDo: item.DiemThaiDo,
      diemDungGio: item.DiemDungGio,
      diemThongTin: item.DiemThongTin,
      diemTienNghi: item.DiemTienNghi,
    }));

    console.timeEnd('getReviews');

    return {
      summary: {
        averageOverall,
        totalReviews,
        criteriaAverage,
        ratingCount,
        commentCount,
        imageCount,
      },
      items: formattedItems,
      meta: {
        currentPage: page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  async getHomeReviews() {
    const items = await this.prisma.dANH_GIA.findMany({
      where: {
        SoSao: 5,
      },
      orderBy: {
        ThoiGianDanhGia: 'desc',
      },
      take: 5,
      include: {
        KHACH_HANG: {
          select: {
            HoTenKhachHang: true,
            AnhDaiDien: true,
          },
        },
        VE_DIEN_TU: {
          select: {
            LICH_TRINH: {
              select: {
                TUYEN_XE: {
                  select: {
                    TenTuyenXe: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return items.map((item) => ({
      id: item.MaDanhGia,
      author: item.KHACH_HANG?.HoTenKhachHang || 'Khách hàng',
      avatar: item.KHACH_HANG?.AnhDaiDien || 'asset/images/customer/user.png',
      date: item.ThoiGianDanhGia,
      rating: item.SoSao,
      content: item.NoiDungDanhGia || '',
      route: item.VE_DIEN_TU?.LICH_TRINH?.TUYEN_XE?.TenTuyenXe || 'Tuyến xe liên tỉnh',
    }));
  }

  async findAll() {
    return this.prisma.dANH_GIA.findMany({
      include: {
        MEDIA_DANH_GIA: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.dANH_GIA.findUnique({
      where: { MaDanhGia: id },
      include: {
        MEDIA_DANH_GIA: true,
      },
    });
  }

  async update(id: string, updateReviewDto: any) {
    const { mediaUrls, ...reviewData } = updateReviewDto;

    const updatedReview = await this.prisma.dANH_GIA.update({
      where: { MaDanhGia: id },
      data: reviewData,
    });

    if (mediaUrls !== undefined) {
      await this.prisma.mEDIA_DANH_GIA.deleteMany({
        where: { MaDanhGia: id },
      });

      if (mediaUrls.length > 0) {
        const mediaData = mediaUrls.map((url) => ({
          MaDanhGia: id,
          DuongDanFile: url,
        }));
        await this.prisma.mEDIA_DANH_GIA.createMany({
          data: mediaData,
        });
      }
    }

    return updatedReview;
  }

  async remove(id: string) {
    return this.prisma.dANH_GIA.delete({
      where: { MaDanhGia: id },
    });
  }
}
