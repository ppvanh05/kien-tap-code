import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, LoaiTinTucEnum, TrangThaiTinTucEnum } from '@prisma/client';

@Injectable()
export class CustomerTinTucService {
  private readonly logger = new Logger(CustomerTinTucService.name);

  constructor(private prisma: PrismaService) {}

  async getPublishedNews(params: {
    page?: number;
    limit?: number;
    loai?: string;
    search?: string;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TIN_TUCWhereInput = {
      TrangThai: TrangThaiTinTucEnum.DaDang,
    };

    if (params.loai && params.loai.trim() !== '') {
      const loaiSearch = params.loai.trim().toLowerCase();
      
      // Map case-insensitive input to exact Prisma Enum values
      const enumMap: Record<string, LoaiTinTucEnum> = {
        'thongbao': LoaiTinTucEnum.ThongBao,
        'sukien': LoaiTinTucEnum.SuKien,
        'khuyenmai': LoaiTinTucEnum.KhuyenMai,
        'tintucchung': LoaiTinTucEnum.TinTucChung,
        'tuyendung': LoaiTinTucEnum.TuyenDung,
        'huongdan': LoaiTinTucEnum.HuongDan,
        // Fallback for 'tintuc' if frontend sends it
        'tintuc': LoaiTinTucEnum.TinTucChung
      };

      if (enumMap[loaiSearch]) {
        where.LoaiTinTuc = enumMap[loaiSearch];
      }
    }

    if (params.search && params.search.trim() !== '') {
      const searchKeyword = params.search.trim();
      where.OR = [
        { TieuDe: { contains: searchKeyword, mode: 'insensitive' } },
        { MoTaNgan: { contains: searchKeyword, mode: 'insensitive' } },
      ];
    }

    const featuredNews = await this.prisma.tIN_TUC.findFirst({
      where: {
        ...where,
        NoiBat: true,
      },
      orderBy: { NgayDang: 'desc' },
    });

    const totalItems = await this.prisma.tIN_TUC.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    const items = await this.prisma.tIN_TUC.findMany({
      where,
      orderBy: { NgayDang: 'desc' },
      skip,
      take: limit,
    });

    // Map PascalCase for Frontend compatibility
    const mappedItems = items.map(item => ({
      MaTinTuc: item.MaTinTuc,
      TieuDe: item.TieuDe,
      AnhBia: item.AnhBia,
      LoaiTinTuc: item.LoaiTinTuc,
      MoTaNgan: item.MoTaNgan,
      NgayDang: item.NgayDang
    }));

    const mappedFeatured = featuredNews ? {
      MaTinTuc: featuredNews.MaTinTuc,
      TieuDe: featuredNews.TieuDe,
      AnhBia: featuredNews.AnhBia,
      LoaiTinTuc: featuredNews.LoaiTinTuc,
      MoTaNgan: featuredNews.MoTaNgan,
      NgayDang: featuredNews.NgayDang
    } : null;

    return {
      featuredNews: mappedFeatured,
      items: mappedItems,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  async getNewsById(id: string) {
    const news = await this.prisma.tIN_TUC.findFirst({
      where: {
        MaTinTuc: id,
        TrangThai: TrangThaiTinTucEnum.DaDang,
      },
    });

    if (!news) {
      return null;
    }

    const relatedNews = await this.prisma.tIN_TUC.findMany({
      where: {
        TrangThai: TrangThaiTinTucEnum.DaDang,
        LoaiTinTuc: news.LoaiTinTuc,
        NOT: { MaTinTuc: id },
      },
      orderBy: { NgayDang: 'desc' },
      take: 3,
    });

    const latestNews = await this.prisma.tIN_TUC.findMany({
      where: {
        TrangThai: TrangThaiTinTucEnum.DaDang,
        NOT: { MaTinTuc: id },
      },
      orderBy: { NgayDang: 'desc' },
      take: 3,
    });

    return {
      news,
      relatedNews,
      latestNews,
    };
  }
  async getHomeNews() {
    const news = await this.prisma.tIN_TUC.findMany({
      where: { TrangThai: TrangThaiTinTucEnum.DaDang },
      orderBy: { NgayDang: 'desc' },
      take: 3,
      select: {
        MaTinTuc: true,
        TieuDe: true,
        AnhBia: true,
        MoTaNgan: true,
        LoaiTinTuc: true,
        NgayDang: true,
      },
    });
    return news;
  }
}