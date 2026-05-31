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
exports.ArtisanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ArtisanService = class ArtisanService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProfile(userId, dto) {
        const existing = await this.prisma.artisanProfile.findUnique({
            where: { userId },
        });
        if (existing) {
            throw new common_1.ConflictException('Profile already exists');
        }
        return this.prisma.artisanProfile.create({
            data: {
                userId,
                ...dto,
            },
        });
    }
    async getProfile(userId) {
        const profile = await this.prisma.artisanProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Artisan profile not found');
        }
        return profile;
    }
};
exports.ArtisanService = ArtisanService;
exports.ArtisanService = ArtisanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ArtisanService);
//# sourceMappingURL=artisan.service.js.map