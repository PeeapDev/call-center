import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  FlowTemplate,
  getAllTemplates,
  getDefaultTemplate,
  getTemplateById,
  validateTemplate,
} from './flow-templates';

@Injectable()
export class FlowBuilderService {
  private activeFlowId: string = 'simple-four-option'; // Default
  private customFlows: Map<string, FlowTemplate> = new Map();

  /**
   * Get all available templates (built-in + custom)
   */
  getAllTemplates(): FlowTemplate[] {
    const builtIn = getAllTemplates();
    const custom = Array.from(this.customFlows.values());
    return [...builtIn, ...custom];
  }

  /**
   * Get template by ID (checks both built-in and custom)
   */
  getTemplateById(id: string): FlowTemplate {
    // Check built-in templates first
    const builtIn = getTemplateById(id);
    if (builtIn) {
      return builtIn;
    }

    // Check custom flows
    const custom = this.customFlows.get(id);
    if (custom) {
      return custom;
    }

    throw new NotFoundException(`Template with ID "${id}" not found`);
  }

  /**
   * Get the currently active flow
   */
  getActiveFlow(): FlowTemplate {
    return this.getTemplateById(this.activeFlowId);
  }

  /**
   * Set a template as the active flow
   */
  setActiveFlow(templateId: string): { success: boolean; message: string } {
    try {
      // Verify template exists
      const template = this.getTemplateById(templateId);

      // Validate template
      const validation = validateTemplate(template);
      if (!validation.valid) {
        throw new BadRequestException(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      this.activeFlowId = templateId;

      return {
        success: true,
        message: `Flow template "${template.name}" is now active`,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Create a custom flow (clone from template or create new)
   */
  createCustomFlow(template: FlowTemplate): { success: boolean; template: FlowTemplate } {
    // Validate template
    const validation = validateTemplate(template);
    if (!validation.valid) {
      throw new BadRequestException(`Template validation failed: ${validation.errors.join(', ')}`);
    }

    // Generate unique ID if not provided
    if (!template.id || template.id.startsWith('simple-') || template.id.startsWith('advanced-') || template.id.startsWith('emergency-')) {
      template.id = `custom-${Date.now()}`;
    }

    // Check if ID already exists
    if (this.customFlows.has(template.id)) {
      throw new BadRequestException(`Custom flow with ID "${template.id}" already exists`);
    }

    // Save custom flow
    this.customFlows.set(template.id, template);

    return {
      success: true,
      template,
    };
  }

  /**
   * Update existing custom flow
   */
  updateCustomFlow(id: string, template: FlowTemplate): { success: boolean; template: FlowTemplate } {
    // Check if flow exists
    if (!this.customFlows.has(id)) {
      throw new NotFoundException(`Custom flow with ID "${id}" not found`);
    }

    // Validate template
    const validation = validateTemplate(template);
    if (!validation.valid) {
      throw new BadRequestException(`Template validation failed: ${validation.errors.join(', ')}`);
    }

    // Ensure ID matches
    template.id = id;

    // Update flow
    this.customFlows.set(id, template);

    return {
      success: true,
      template,
    };
  }

  /**
   * Delete custom flow
   */
  deleteCustomFlow(id: string): { success: boolean; message: string } {
    if (!this.customFlows.has(id)) {
      throw new NotFoundException(`Custom flow with ID "${id}" not found`);
    }

    // Don't allow deleting active flow
    if (this.activeFlowId === id) {
      throw new BadRequestException('Cannot delete the currently active flow. Set a different flow as active first.');
    }

    this.customFlows.delete(id);

    return {
      success: true,
      message: `Custom flow "${id}" deleted successfully`,
    };
  }

  /**
   * Validate template structure
   */
  validateTemplate(template: FlowTemplate): { valid: boolean; errors: string[] } {
    return validateTemplate(template);
  }

  /**
   * Get flow node by ID from active flow
   */
  getNodeFromActiveFlow(nodeId: string): any {
    const activeFlow = this.getActiveFlow();
    const node = activeFlow.nodes.find((n) => n.id === nodeId);

    if (!node) {
      throw new NotFoundException(`Node "${nodeId}" not found in active flow`);
    }

    return node;
  }

  /**
   * Process IVR input and get next node
   */
  processIvrInput(currentNodeId: string, input: string): { nextNode: string; message: string } {
    const currentNode = this.getNodeFromActiveFlow(currentNodeId);

    // If it's a menu node, find the option
    if (currentNode.options) {
      const option = currentNode.options.find((opt: any) => opt.key === input);
      if (option) {
        const nextNode = this.getNodeFromActiveFlow(option.nextNode);
        return {
          nextNode: option.nextNode,
          message: nextNode.message,
        };
      }
    }

    // If it has a direct next node
    if (currentNode.nextNode) {
      const nextNode = this.getNodeFromActiveFlow(currentNode.nextNode);
      return {
        nextNode: currentNode.nextNode,
        message: nextNode.message,
      };
    }

    throw new BadRequestException('Invalid input or no next node available');
  }
}
