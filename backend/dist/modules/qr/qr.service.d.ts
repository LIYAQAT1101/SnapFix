import { PrismaService } from '../../common/prisma/prisma.service';
export declare class QrService {
    private prisma;
    constructor(prisma: PrismaService);
    generateQr(artworkId: string): Promise<{
        id: string;
        createdAt: Date;
        artworkId: string;
        qrImageUrl: string;
        scanCount: number;
        lastScanned: Date | null;
        expiresAt: Date | null;
    }>;
    verify(verificationSlug: string, reqDetails: any): Promise<{
        status: string;
        artwork: {
            name: string;
            category: string;
            description: string;
            materialUsed: string;
            handmadeHours: number;
            heritageInfo: string;
            giTagStatus: boolean;
        };
        artisan: {
            fullName: string;
            district: string;
            isVerified: boolean;
        };
        media: {
            type: string;
            id: string;
            createdAt: Date;
            artworkId: string;
            url: string;
        }[];
    }>;
}
