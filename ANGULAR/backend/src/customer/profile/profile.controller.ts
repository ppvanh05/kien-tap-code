import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('customer/ho-so')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // 1. GET /customer/ho-so/:id
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.profileService.getProfile(id);
  }

  // 2. PATCH /customer/ho-so/:id
  @Patch(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.profileService.updateProfile(id, data);
  }
}
