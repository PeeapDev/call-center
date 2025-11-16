import { Module } from '@nestjs/common';
import { FlowBuilderController } from './flow-builder.controller';
import { FlowBuilderService } from './flow-builder.service';
import { HrModule } from '../hr/hr.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [HrModule, MediaModule],
  controllers: [FlowBuilderController],
  providers: [FlowBuilderService],
  exports: [FlowBuilderService],
})
export class FlowBuilderModule {}
