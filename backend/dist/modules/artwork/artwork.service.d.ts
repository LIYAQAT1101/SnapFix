import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ArtworkService {
    private prisma;
    constructor(prisma: PrismaService);
    createArtwork(artisanId: string, data: any): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        materialUsed: string;
        handmadeHours: number;
        originDistrict: string;
        heritageInfo: string;
        giTagStatus: boolean;
        price: number | null;
        verificationSlug: string;
        artisanId: string;
    }>;
    getArtwork(id: string): Promise<{
        qrCode: {
            id: string;
            createdAt: Date;
            artworkId: string;
            qrImageUrl: string;
            scanCount: number;
            lastScanned: Date | null;
            expiresAt: Date | null;
        } | null;
        artisan: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            phone: string;
            address: string;
            district: string;
            aadhaarNumber: string | null;
            panNumber: string | null;
            craftCategory: string;
            userId: string;
            verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
            rejectionReason: string | null;
            isVerified: boolean;
            aadhaarUrl: string | null;
            panUrl: string | null;
            selfieUrl: string | null;
            workshopImages: string[];
        };
        media: {
            type: string;
            id: string;
            createdAt: Date;
            artworkId: string;
            url: string;
        }[];
    } & {
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        materialUsed: string;
        handmadeHours: number;
        originDistrict: string;
        heritageInfo: string;
        giTagStatus: boolean;
        price: number | null;
        verificationSlug: string;
        artisanId: string;
    }>;
}
