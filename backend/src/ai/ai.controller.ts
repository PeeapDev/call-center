import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ai-chat')
  async chat(@Body() body: { message: string }) {
    return this.aiService.chat(body.message);
  }

  @Get('ai-keys')
  async getKeys() {
    return this.aiService.getKeys();
  }

  @Put('ai-keys/:keyName')
  async updateKey(
    @Param('keyName') keyName: string,
    @Body() body: { value: string },
  ) {
    return this.aiService.updateKey(keyName, body.value);
  }
}
