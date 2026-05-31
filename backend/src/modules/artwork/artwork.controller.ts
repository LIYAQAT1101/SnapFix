import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ArtworkService } from './artwork.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Artworks')
@Controller('artworks')
export class ArtworkController {
  constructor(private readonly artworkService: ArtworkService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ARTISAN)
  @ApiOperation({ summary: 'Create new artwork' })
  createArtwork(@CurrentUser() user: any, @Body() dto: any) {
    return this.artworkService.createArtwork(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get artwork by ID' })
  getArtwork(@Param('id') id: string) {
    return this.artworkService.getArtwork(id);
  }
}
