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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtworkController = void 0;
const common_1 = require("@nestjs/common");
const artwork_service_1 = require("./artwork.service");
const auth_guard_1 = require("../../common/guards/auth.guard");
const auth_guard_2 = require("../../common/guards/auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let ArtworkController = class ArtworkController {
    artworkService;
    constructor(artworkService) {
        this.artworkService = artworkService;
    }
    createArtwork(user, dto) {
        return this.artworkService.createArtwork(user.id, dto);
    }
    getArtwork(id) {
        return this.artworkService.getArtwork(id);
    }
};
exports.ArtworkController = ArtworkController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_2.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ARTISAN),
    (0, swagger_1.ApiOperation)({ summary: 'Create new artwork' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ArtworkController.prototype, "createArtwork", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get artwork by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ArtworkController.prototype, "getArtwork", null);
exports.ArtworkController = ArtworkController = __decorate([
    (0, swagger_1.ApiTags)('Artworks'),
    (0, common_1.Controller)('artworks'),
    __metadata("design:paramtypes", [artwork_service_1.ArtworkService])
], ArtworkController);
//# sourceMappingURL=artwork.controller.js.map