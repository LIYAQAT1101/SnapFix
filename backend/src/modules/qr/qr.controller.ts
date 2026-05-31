import { Controller, Get, Param, Req, Headers } from '@nestjs/common';
import { QrService } from './qr.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Public Verification')
@Controller('verify')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get(':verificationSlug')
  @ApiOperation({ summary: 'Public endpoint to verify an artwork' })
  verifyArtwork(
    @Param('verificationSlug') verificationSlug: string,
    @Req() req: any,
    @Headers('user-agent') userAgent: string,
  ) {
    const reqDetails = {
      ip: req.ip,
      device: userAgent,
      browser: userAgent,
    };
    return this.qrService.verify(verificationSlug, reqDetails);
  }
}
