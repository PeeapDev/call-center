import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SupportChatController } from './support-chat.controller';
import { SupportChatService } from './support-chat.service';

@Module({
  controllers: [ChatController, SupportChatController],
  providers: [ChatService, SupportChatService],
  exports: [ChatService, SupportChatService],
})
export class ChatModule {}
