import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateArtisanProfileDto } from './dto/artisan.dto';

@Injectable()
export class ArtisanService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateArtisanProfileDto) {
    const existing = await this.prisma.artisanProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('Profile already exists');
    }

    return this.prisma.artisanProfile.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.artisanProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Artisan profile not found');
    }

    return profile;
  }
}
