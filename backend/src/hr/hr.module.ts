import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { WebRTCService } from './webrtc.service';
import { User } from './user.entity';
import { AgentStatus } from './agent-status.entity';
import { WebRTCConfig } from './webrtc-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AgentStatus, WebRTCConfig]),
  ],
  controllers: [HrController],
  providers: [HrService, WebRTCService],
  exports: [HrService, WebRTCService],
})
export class HrModule {}
