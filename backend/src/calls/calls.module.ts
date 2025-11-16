import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { CallsGateway } from './calls.gateway';
import { Call } from './call.entity';
import { AsteriskModule } from '../asterisk/asterisk.module';
import { FlowBuilderModule } from '../flow-builder/flow-builder.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Call]),
    AsteriskModule,
    FlowBuilderModule,
  ],
  controllers: [CallsController],
  providers: [CallsService, CallsGateway],
  exports: [CallsService, CallsGateway],
})
export class CallsModule {}
