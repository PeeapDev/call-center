import { Controller, Post, Get, Put, Body, Param, Query } from '@nestjs/common';
import { SupportChatService } from './support-chat.service';

class CreateConversationDto {
  citizenId: string;
  citizenName: string;
  citizenEmail: string;
  initialMessage: string;
}

class SendMessageDto {
  conversationId: string;
  senderId: string;
  senderType: 'citizen' | 'staff';
  content: string;
  staffName?: string;
  staffRole?: string;
  staffNumber?: string;
}

class ClaimConversationDto {
  staffId: string;
  staffName: string;
}

@Controller('support-chat')
export class SupportChatController {
  constructor(private readonly supportChatService: SupportChatService) {}

  // Create new conversation (citizen initiates)
  @Post('conversations')
  async createConversation(@Body() dto: CreateConversationDto) {
    try {
      const conversation = await this.supportChatService.createConversation(dto);
      return {
        status: 'ok',
        conversation,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get all conversations (for staff inbox)
  @Get('conversations')
  async getConversations(@Query('status') status?: string) {
    try {
      const conversations = await this.supportChatService.getConversations(status);
      return {
        status: 'ok',
        conversations,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get conversation messages
  @Get('conversations/:id/messages')
  async getConversationMessages(@Param('id') id: string) {
    try {
      const messages = await this.supportChatService.getConversationMessages(id);
      return {
        status: 'ok',
        messages,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Send message in conversation
  @Post('messages')
  async sendMessage(@Body() dto: SendMessageDto) {
    try {
      const message = await this.supportChatService.sendMessage(dto);
      return {
        status: 'ok',
        message,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Claim conversation (staff claims waiting conversation)
  @Put('conversations/:id/claim')
  async claimConversation(
    @Param('id') id: string,
    @Body() dto: ClaimConversationDto,
  ) {
    try {
      const conversation = await this.supportChatService.claimConversation(id, dto);
      return {
        status: 'ok',
        conversation,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Resolve conversation
  @Put('conversations/:id/resolve')
  async resolveConversation(@Param('id') id: string) {
    try {
      const conversation = await this.supportChatService.resolveConversation(id);
      return {
        status: 'ok',
        conversation,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get conversation by citizen ID
  @Get('conversations/citizen/:citizenId')
  async getCitizenConversation(@Param('citizenId') citizenId: string) {
    try {
      const conversation = await this.supportChatService.getCitizenActiveConversation(citizenId);
      return {
        status: 'ok',
        conversation,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
