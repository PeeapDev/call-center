import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsStatus } from './sms.entity';

class SendSmsDto {
  to: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

class SendFromTemplateDto {
  templateCode: string;
  to: string;
  variables: Record<string, string>;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

class CreateTemplateDto {
  name: string;
  code: string;
  template: string;
  description?: string;
}

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  // Send SMS directly
  @Post('send')
  async sendSms(@Body() dto: SendSmsDto) {
    try {
      const sms = await this.smsService.sendSms(dto);
      return { status: 'ok', sms };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Send SMS from template
  @Post('send-template')
  async sendFromTemplate(@Body() dto: SendFromTemplateDto) {
    try {
      const sms = await this.smsService.sendFromTemplate(dto);
      if (!sms) {
        return { status: 'error', message: 'Template not found or inactive' };
      }
      return { status: 'ok', sms };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Get SMS history
  @Get('messages')
  async getMessages(
    @Query('status') status?: SmsStatus,
    @Query('relatedEntityType') relatedEntityType?: string,
    @Query('relatedEntityId') relatedEntityId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    try {
      const result = await this.smsService.findAllMessages({
        status,
        relatedEntityType,
        relatedEntityId,
        limit: limit ? parseInt(String(limit)) : undefined,
        offset: offset ? parseInt(String(offset)) : undefined,
      });
      return { status: 'ok', ...result };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Get SMS stats
  @Get('stats')
  async getStats() {
    try {
      const stats = await this.smsService.getStats();
      return { status: 'ok', stats };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Template CRUD
  @Post('templates')
  async createTemplate(@Body() dto: CreateTemplateDto) {
    try {
      const template = await this.smsService.createTemplate(dto);
      return { status: 'ok', template };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('templates')
  async getTemplates() {
    try {
      const templates = await this.smsService.findAllTemplates();
      return { status: 'ok', templates };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: string) {
    try {
      const template = await this.smsService.findTemplateById(id);
      if (!template) {
        return { status: 'error', message: 'Template not found' };
      }
      return { status: 'ok', template };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Put('templates/:id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTemplateDto>,
  ) {
    try {
      const template = await this.smsService.updateTemplate(id, dto);
      return { status: 'ok', template };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string) {
    try {
      await this.smsService.deleteTemplate(id);
      return { status: 'ok', message: 'Template deleted' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Initialize default templates
  @Post('init-templates')
  async initTemplates() {
    try {
      await this.smsService.initializeDefaultTemplates();
      return { status: 'ok', message: 'Default templates initialized' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
