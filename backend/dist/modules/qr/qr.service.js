"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let QrService = class QrService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateQr(artworkId) {
        const artwork = await this.prisma.artwork.findUnique({
            where: { id: artworkId },
        });
        if (!artwork) {
            throw new common_1.NotFoundException('Artwork not found');
        }
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://artiq.com/verify/${artwork.verificationSlug}`;
        return this.prisma.qrCode.create({
            data: {
                artworkId: artwork.id,
                qrImageUrl,
            },
        });
    }
    async verify(verificationSlug, reqDetails) {
        const artwork = await this.prisma.artwork.findUnique({
            where: { verificationSlug },
            include: {
                artisan: true,
                media: true,
                qrCode: true,
            },
        });
        if (!artwork) {
            throw new common_1.NotFoundException('Invalid or counterfeit product');
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
};
exports.QrService = QrService;
exports.QrService = QrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QrService);
//# sourceMappingURL=qr.service.js.map