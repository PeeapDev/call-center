import { Controller, Post, Get, Put, Delete, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  // AI Config / Training Documents
  @Get('ai-config/documents')
  async getDocuments() {
    return this.aiService.getDocuments();
  }

  @Post('ai-config/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title: string; description: string },
  ) {
    return this.aiService.uploadDocument(file, body.title, body.description);
  }

  @Delete('ai-config/documents/:id')
  async deleteDocument(@Param('id') id: string) {
    return this.aiService.deleteDocument(id);
  }

  @Get('ai-config/context')
  async getTrainingContext() {
    return this.aiService.getTrainingContext();
  }
}
