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
exports.QrController = void 0;
const common_1 = require("@nestjs/common");
const qr_service_1 = require("./qr.service");
const swagger_1 = require("@nestjs/swagger");
let QrController = class QrController {
    qrService;
    constructor(qrService) {
        this.qrService = qrService;
    }
    verifyArtwork(verificationSlug, req, userAgent) {
        const reqDetails = {
            ip: req.ip,
            device: userAgent,
            browser: userAgent,
        };
        return this.qrService.verify(verificationSlug, reqDetails);
    }
};
exports.QrController = QrController;
__decorate([
    (0, common_1.Get)(':verificationSlug'),
    (0, swagger_1.ApiOperation)({ summary: 'Public endpoint to verify an artwork' }),
    __param(0, (0, common_1.Param)('verificationSlug')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], QrController.prototype, "verifyArtwork", null);
exports.QrController = QrController = __decorate([
    (0, swagger_1.ApiTags)('Public Verification'),
    (0, common_1.Controller)('verify'),
    __metadata("design:paramtypes", [qr_service_1.QrService])
], QrController);
//# sourceMappingURL=qr.controller.js.map