import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AsteriskService } from './asterisk/asterisk.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly asteriskService: AsteriskService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    console.log('Asterisk env debug', {
      ASTERISK_ARI_URL: process.env.ASTERISK_ARI_URL,
      ASTERISK_ARI_USER: process.env.ASTERISK_ARI_USER,
      ASTERISK_AMI_HOST: process.env.ASTERISK_AMI_HOST,
      ASTERISK_AMI_PORT: process.env.ASTERISK_AMI_PORT,
    });

    const ariConfigured = !!(
      process.env.ASTERISK_ARI_URL &&
      process.env.ASTERISK_ARI_USER &&
      process.env.ASTERISK_ARI_PASSWORD
    );

    const amiConfigured = !!(
      process.env.ASTERISK_AMI_HOST &&
      process.env.ASTERISK_AMI_PORT &&
      process.env.ASTERISK_AMI_USER &&
      process.env.ASTERISK_AMI_PASSWORD
    );

    return {
      status: 'ok',
      service: 'backend',
      timestamp: new Date().toISOString(),
      asterisk: {
        ariConfigured,
        amiConfigured,
        ariConnected: this.asteriskService.isConnected(),
      },
    };
  }
}
