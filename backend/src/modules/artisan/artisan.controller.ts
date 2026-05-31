import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ArtisanService } from './artisan.service';
import { CreateArtisanProfileDto } from './dto/artisan.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Artisans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('artisans')
export class ArtisanController {
  constructor(private readonly artisanService: ArtisanService) {}

  @Post('profile')
  @Roles(Role.ARTISAN)
  @ApiOperation({ summary: 'Create artisan profile' })
  createProfile(
    @CurrentUser() user: any,
    @Body() dto: CreateArtisanProfileDto,
  ) {
    return this.artisanService.createProfile(user.id, dto);
  }

  @Get('profile')
  @Roles(Role.ARTISAN)
  @ApiOperation({ summary: 'Get current artisan profile' })
  getProfile(@CurrentUser() user: any) {
    return this.artisanService.getProfile(user.id);
  }
}
