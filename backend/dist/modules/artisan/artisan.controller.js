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
exports.ArtisanController = void 0;
const common_1 = require("@nestjs/common");
const artisan_service_1 = require("./artisan.service");
const artisan_dto_1 = require("./dto/artisan.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const auth_guard_2 = require("../../common/guards/auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let ArtisanController = class ArtisanController {
    artisanService;
    constructor(artisanService) {
        this.artisanService = artisanService;
    }
    createProfile(user, dto) {
        return this.artisanService.createProfile(user.id, dto);
    }
    getProfile(user) {
        return this.artisanService.getProfile(user.id);
    }
};
exports.ArtisanController = ArtisanController;
__decorate([
    (0, common_1.Post)('profile'),
    (0, roles_decorator_1.Roles)(client_1.Role.ARTISAN),
    (0, swagger_1.ApiOperation)({ summary: 'Create artisan profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, artisan_dto_1.CreateArtisanProfileDto]),
    __metadata("design:returntype", void 0)
], ArtisanController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, roles_decorator_1.Roles)(client_1.Role.ARTISAN),
    (0, swagger_1.ApiOperation)({ summary: 'Get current artisan profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ArtisanController.prototype, "getProfile", null);
exports.ArtisanController = ArtisanController = __decorate([
    (0, swagger_1.ApiTags)('Artisans'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_2.RolesGuard),
    (0, common_1.Controller)('artisans'),
    __metadata("design:paramtypes", [artisan_service_1.ArtisanService])
], ArtisanController);
//# sourceMappingURL=artisan.controller.js.map