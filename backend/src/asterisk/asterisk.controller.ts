import { Controller, Get } from '@nestjs/common';
import { AsteriskService } from './asterisk.service';

@Controller('asterisk')
export class AsteriskController {
  constructor(private readonly asteriskService: AsteriskService) {}

  @Get('info')
  async getInfo() {
    try {
      const info = await this.asteriskService.getAsteriskInfo();
      return {
        status: 'ok',
        connected: this.asteriskService.isConnected(),
        info,
      };
    } catch (error) {
      return {
        status: 'error',
        connected: this.asteriskService.isConnected(),
        error: error.message,
      };
    }
  }

  @Get('channels')
  async getChannels() {
    try {
      const channels = await this.asteriskService.getChannels();
      return {
        status: 'ok',
        count: channels.length,
        channels,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  @Get('status')
  getStatus() {
    return {
      connected: this.asteriskService.isConnected(),
      timestamp: new Date().toISOString(),
    };
  }
}
