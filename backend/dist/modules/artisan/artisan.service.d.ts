import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateArtisanProfileDto } from './dto/artisan.dto';
export declare class ArtisanService {
    private prisma;
    constructor(prisma: PrismaService);
    createProfile(userId: string, dto: CreateArtisanProfileDto): Promise<{
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
    }>;
    getProfile(userId: string): Promise<{
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
    }>;
}
