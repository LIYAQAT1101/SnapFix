import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) {}

  async generateQr(artworkId: string) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id: artworkId },
    });

    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }

    // In a real scenario, use a QR generation library like 'qrcode'
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://artiq.com/verify/${artwork.verificationSlug}`;

    return this.prisma.qrCode.create({
      data: {
        artworkId: artwork.id,
        qrImageUrl,
      },
    });
  }

  async verify(verificationSlug: string, reqDetails: any) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { verificationSlug },
      include: {
        artisan: true,
        media: true,
        qrCode: true,
      },
    });

    if (!artwork) {
      throw new NotFoundException('Invalid or counterfeit product');
    }

    if (artwork.qrCode) {
      await this.prisma.qrCode.update({
        where: { id: artwork.qrCode.id },
        data: {
          scanCount: { increment: 1 },
          lastScanned: new Date(),
        },
      });

      await this.prisma.scanLog.create({
        data: {
          qrCodeId: artwork.qrCode.id,
          ipAddress: reqDetails.ip,
          device: reqDetails.device,
          browser: reqDetails.browser,
        },
      });
    }

    return {
      status: 'AUTHENTIC',
      artwork: {
        name: artwork.name,
        category: artwork.category,
        description: artwork.description,
        materialUsed: artwork.materialUsed,
        handmadeHours: artwork.handmadeHours,
        heritageInfo: artwork.heritageInfo,
        giTagStatus: artwork.giTagStatus,
      },
      artisan: {
        fullName: artwork.artisan.fullName,
        district: artwork.artisan.district,
        isVerified: artwork.artisan.isVerified,
      },
      media: artwork.media,
    };
  }
}
