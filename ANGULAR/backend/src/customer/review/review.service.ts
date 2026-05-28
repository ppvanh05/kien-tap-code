import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: any) {
    const { MaVe, MaKhachHang, SoSao, NoiDungDanhGia, mediaUrls } = createReviewDto;

    const generatedMaDanhGia = `DG${Date.now().toString().slice(-8)}`;

    const newReview = await this.prisma.dANH_GIA.create({
      data: {
        MaDanhGia: generatedMaDanhGia,
        SoSao,
        NoiDungDanhGia,
        ThoiGianDanhGia: new Date(),
        TrangThaiPhanHoi: 'ChuaPhanHoi', // Trạng thái mặc định
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
      await this.prisma.mEDIA_DANH_GIA.createMany({
        data: mediaData,
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
    const { page, limit, rating, hasComment, hasImage } = params;

    // 1. Get all reviews to compute summary statistics
    const allReviews = await this.prisma.dANH_GIA.findMany({
      include: {
        MEDIA_DANH_GIA: true,
      },
    });

    const totalReviews = allReviews.length;
    const averageOverall = totalReviews > 0 
      ? parseFloat((allReviews.reduce((sum, r) => sum + r.SoSao, 0) / totalReviews).toFixed(1)) 
      : 0;

    const getAverage = (arr: any[], key: string) => {
      const valid = arr.filter((r) => r[key] !== null && r[key] !== undefined);
      if (valid.length === 0) return 0;
      const sum = valid.reduce((s, r) => s + r[key], 0);
      return parseFloat((sum / valid.length).toFixed(1));
    };

    const criteriaAverage = {
      anToan: getAverage(allReviews, 'DiemAnToan'),
      sachSe: getAverage(allReviews, 'DiemSachSe'),
      thaiDoNhanVien: getAverage(allReviews, 'DiemThaiDo'),
      dungGio: getAverage(allReviews, 'DiemDungGio'),
      thongTinDayDu: getAverage(allReviews, 'DiemThongTin'),
      tienNghi: getAverage(allReviews, 'DiemTienNghi'),
    };

    const ratingCount = {
      five: allReviews.filter((r) => r.SoSao === 5).length,
      four: allReviews.filter((r) => r.SoSao === 4).length,
      three: allReviews.filter((r) => r.SoSao === 3).length,
      two: allReviews.filter((r) => r.SoSao === 2).length,
      one: allReviews.filter((r) => r.SoSao === 1).length,
    };

    const commentCount = allReviews.filter(
      (r) => r.NoiDungDanhGia && r.NoiDungDanhGia.trim() !== '',
    ).length;
    
    const imageCount = allReviews.filter(
      (r) => r.MEDIA_DANH_GIA && r.MEDIA_DANH_GIA.length > 0,
    ).length;

    // 2. Build where filter for paginated list
    const where: any = {};

    if (rating !== undefined) {
      where.SoSao = rating;
    }

    if (hasComment === true) {
      where.NoiDungDanhGia = {
        not: null,
        notIn: [''],
      };
    } else if (hasComment === false) {
      where.OR = [
        { NoiDungDanhGia: null },
        { NoiDungDanhGia: '' },
      ];
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

    const totalItems = await this.prisma.dANH_GIA.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    const items = await this.prisma.dANH_GIA.findMany({
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
    });

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
