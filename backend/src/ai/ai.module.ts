import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/ai-training',
    }),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
