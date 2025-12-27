import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CallbacksController } from './callbacks.controller';
import { CallbacksService } from './callbacks.service';
import { Callback } from './callback.entity';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Callback]),
    ScheduleModule.forRoot(),
    SmsModule,
  ],
  controllers: [CallbacksController],
  providers: [CallbacksService],
  exports: [CallbacksService],
})
export class CallbacksModule {}
