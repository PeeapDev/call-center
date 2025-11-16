import { Module } from '@nestjs/common';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { WebRTCService } from './webrtc.service';

@Module({
  controllers: [HrController],
  providers: [HrService, WebRTCService],
  exports: [HrService, WebRTCService],
})
export class HrModule {}
