import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { SmsMessage, SmsTemplate } from './sms.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmsMessage, SmsTemplate])],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule implements OnModuleInit {
  constructor(private readonly smsService: SmsService) {}

  async onModuleInit() {
    // Initialize default SMS templates when the module starts
    await this.smsService.initializeDefaultTemplates();
  }
}
