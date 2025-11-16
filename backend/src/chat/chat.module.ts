import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SupportChatController } from './support-chat.controller';
import { SupportChatService } from './support-chat.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [ChatController, SupportChatController],
  providers: [ChatService, SupportChatService],
  exports: [ChatService, SupportChatService],
})
export class ChatModule {}
