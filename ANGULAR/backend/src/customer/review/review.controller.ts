<<<<<<< HEAD
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
=======
import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters } from '@nestjs/common';
>>>>>>> origin/nghi
import { ReviewService } from './review.service';
import { CustomerExceptionFilter } from '../customer-exception.filter';

<<<<<<< HEAD
@Controller('customer/danh-gia')
=======
@Controller('customer/reviews')
@UseFilters(CustomerExceptionFilter)
>>>>>>> origin/nghi
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
<<<<<<< HEAD
  create(@Body() createReviewDto: any) {
    return this.reviewService.create(createReviewDto);
  }

  @Get()
  async getReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('rating') rating?: string,
    @Query('hasComment') hasComment?: string,
    @Query('hasImage') hasImage?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 5;
    const ratingNum = rating ? parseInt(rating, 10) : undefined;
    
    let hasCommentBool: boolean | undefined = undefined;
    if (hasComment === 'true') hasCommentBool = true;
    if (hasComment === 'false') hasCommentBool = false;

    let hasImageBool: boolean | undefined = undefined;
    if (hasImage === 'true') hasImageBool = true;
    if (hasImage === 'false') hasImageBool = false;

    return this.reviewService.getReviews({
      page: pageNum,
      limit: limitNum,
      rating: ratingNum,
      hasComment: hasCommentBool,
      hasImage: hasImageBool,
    });
  }

  @Get('home')
  async getHomeReviews() {
    return this.reviewService.getHomeReviews();
  }

  @Get('all')
  findAll() {
    return this.reviewService.findAll();
=======
  async create(@Body() createReviewDto: any) {
    const data = await this.reviewService.create(createReviewDto);
    return {
      success: true,
      message: 'Tạo đánh giá thành công!',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.reviewService.findAll();
    return {
      success: true,
      message: 'Lấy danh sách đánh giá thành công!',
      data,
    };
>>>>>>> origin/nghi
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.reviewService.findOne(id);
    return {
      success: true,
      message: 'Lấy chi tiết đánh giá thành công!',
      data,
    };
  }

  @Patch(':id')
<<<<<<< HEAD
  update(@Param('id') id: string, @Body() updateReviewDto: any) {
    return this.reviewService.update(id, updateReviewDto);
=======
  async update(@Param('id') id: string, @Body() updateReviewDto: any) {
    const data = await this.reviewService.update(id, updateReviewDto);
    return {
      success: true,
      message: 'Cập nhật đánh giá thành công!',
      data,
    };
>>>>>>> origin/nghi
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.reviewService.remove(id);
    return {
      success: true,
      message: 'Xóa đánh giá thành công!',
      data,
    };
  }
}
