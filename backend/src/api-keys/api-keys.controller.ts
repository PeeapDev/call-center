import { Controller, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ChatService } from '../chat/chat.service';

class UpdateApiKeyDto {
  value: string;
}

@Controller('api-keys')
export class ApiKeysController {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly chatService: ChatService,
  ) {}

  @Get()
  async getAllKeys() {
    try {
      const keys = await this.apiKeysService.getAllApiKeys();
      return {
        status: 'ok',
        keys,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Put(':name')
  async updateKey(@Param('name') name: string, @Body() dto: UpdateApiKeyDto) {
    try {
      const result = await this.apiKeysService.updateApiKey(name, dto.value);

      // If updating DeepSeek key, reinitialize the chat service
      if (name === 'DEEPSEEK_API_KEY') {
        this.chatService.updateApiKey(dto.value);
      }

      return result;
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Delete(':name')
  async deleteKey(@Param('name') name: string) {
    try {
      const result = await this.apiKeysService.deleteApiKey(name);

      // If deleting DeepSeek key, disable the chat service
      if (name === 'DEEPSEEK_API_KEY') {
        this.chatService.updateApiKey('');
      }

      return result;
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
