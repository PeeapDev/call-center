import { Module } from '@nestjs/common';
import { FlowBuilderController } from './flow-builder.controller';
import { FlowBuilderService } from './flow-builder.service';

@Module({
  controllers: [FlowBuilderController],
  providers: [FlowBuilderService],
  exports: [FlowBuilderService],
})
export class FlowBuilderModule {}
