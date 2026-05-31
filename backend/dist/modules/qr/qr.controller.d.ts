import { QrService } from './qr.service';
export declare class QrController {
    private readonly qrService;
    constructor(qrService: QrService);
    verifyArtwork(verificationSlug: string, req: any, userAgent: string): Promise<{
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
