import { Controller, Post, Body, Get } from '@nestjs/common';
import { ChatService } from './chat.service';

class ChatMessageDto {
  message: string;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(@Body() chatMessageDto: ChatMessageDto) {
    const { message } = chatMessageDto;

    if (!message || message.trim().length === 0) {
      return {
        status: 'error',
        message: 'Message cannot be empty',
      };
    }

    try {
      const response = await this.chatService.sendMessage(message);
      return {
        status: 'ok',
        response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to process your message. Please try again.',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('status')
  getStatus() {
    return {
      status: 'ok',
      configured: this.chatService.isConfigured(),
      timestamp: new Date().toISOString(),
    };
  }
}
