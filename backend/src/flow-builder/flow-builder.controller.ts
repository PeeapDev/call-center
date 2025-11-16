import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { FlowBuilderService } from './flow-builder.service';
import type { FlowTemplate } from './flow-templates';

@Controller('flow-builder')
export class FlowBuilderController {
  constructor(private readonly flowBuilderService: FlowBuilderService) {}

  /**
   * Get all available flow templates
   */
  @Get('templates')
  getAllTemplates(): FlowTemplate[] {
    return this.flowBuilderService.getAllTemplates();
  }

  /**
   * Get a specific template by ID
   */
  @Get('templates/:id')
  getTemplate(@Param('id') id: string): FlowTemplate {
    return this.flowBuilderService.getTemplateById(id);
  }

  /**
   * Get the current active flow
   */
  @Get('active')
  getActiveFlow(): FlowTemplate {
    return this.flowBuilderService.getActiveFlow();
  }

  /**
   * Set a template as the active flow
   */
  @Post('active/:templateId')
  setActiveFlow(@Param('templateId') templateId: string): { success: boolean; message: string } {
    return this.flowBuilderService.setActiveFlow(templateId);
  }

  /**
   * Create a custom flow from template
   */
  @Post('custom')
  createCustomFlow(@Body() template: FlowTemplate): { success: boolean; template: FlowTemplate } {
    return this.flowBuilderService.createCustomFlow(template);
  }

  /**
   * Update existing custom flow
   */
  @Put('custom/:id')
  updateCustomFlow(
    @Param('id') id: string,
    @Body() template: FlowTemplate,
  ): { success: boolean; template: FlowTemplate } {
    return this.flowBuilderService.updateCustomFlow(id, template);
  }

  /**
   * Validate a flow template
   */
  @Post('validate')
  validateTemplate(@Body() template: FlowTemplate): { valid: boolean; errors: string[] } {
    return this.flowBuilderService.validateTemplate(template);
  }
}
