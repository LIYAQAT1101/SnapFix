import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ArtworkService {
  constructor(private prisma: PrismaService) {}

  async createArtwork(artisanId: string, data: any) {
    const artisanProfile = await this.prisma.artisanProfile.findUnique({
      where: { userId: artisanId },
    });

    if (!artisanProfile) {
      throw new NotFoundException('Artisan profile not found');
    }

    const artwork = await this.prisma.artwork.create({
      data: {
        artisanId: artisanProfile.id,
        ...data,
      },
    });

    // Also trigger QR code generation here in reality
    return artwork;
  }

  async getArtwork(id: string) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id },
      include: {
        artisan: true,
        media: true,
        qrCode: true,
      },
    });

    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }

    return artwork;
  }
}
