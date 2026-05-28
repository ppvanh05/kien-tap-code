import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('customer/danh-gia')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
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
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: any) {
    return this.reviewService.update(id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }
}
