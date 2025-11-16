import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  FlowTemplate,
  getAllTemplates,
  getDefaultTemplate,
  getTemplateById,
  validateTemplate,
} from './flow-templates';
import { MediaService } from '../media/media.service';
import { HrService } from '../hr/hr.service';

@Injectable()
export class FlowBuilderService {
  private activeFlowId: string = 'simple-four-option'; // Default
  private customFlows: Map<string, FlowTemplate> = new Map();

  constructor(
    private readonly mediaService: MediaService,
    private readonly hrService: HrService,
  ) {}

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
  async processIvrInput(currentNodeId: string, input: string): Promise<{ nextNode: string; message: string; audioUrl?: string }> {
    const currentNode = this.getNodeFromActiveFlow(currentNodeId);

    // If it's a menu node, find the option
    if (currentNode.options) {
      const option = currentNode.options.find((opt: any) => opt.key === input);
      if (option) {
        const nextNode = this.getNodeFromActiveFlow(option.nextNode);
        const audioUrl = nextNode.audioSubcategory ? await this.getAudioUrlForSubcategory(nextNode.audioSubcategory) : undefined;
        return {
          nextNode: option.nextNode,
          message: nextNode.message,
          audioUrl,
        };
      }
    }

    // If it has a direct next node
    if (currentNode.nextNode) {
      const nextNode = this.getNodeFromActiveFlow(currentNode.nextNode);
      const audioUrl = nextNode.audioSubcategory ? await this.getAudioUrlForSubcategory(nextNode.audioSubcategory) : undefined;
      return {
        nextNode: currentNode.nextNode,
        message: nextNode.message,
        audioUrl,
      };
    }

    throw new BadRequestException('Invalid input or no next node available');
  }

  /**
   * Get audio URL for a subcategory
   */
  private async getAudioUrlForSubcategory(subcategory: string): Promise<string | undefined> {
    // Get media files for this subcategory
    const mediaResult = await this.mediaService.list('ivr', subcategory);
    if (mediaResult.status === 'ok' && mediaResult.media.length > 0) {
      // Return the first (most recent) audio file for this subcategory
      const media = mediaResult.media[0];
      return `/media/${media.filename}`;
    }
    return undefined;
  }

  /**
   * Get node with resolved audio URL
   */
  async getNodeWithAudio(nodeId: string): Promise<any> {
    const node = this.getNodeFromActiveFlow(nodeId);
    if (node.audioSubcategory) {
      node.audioUrl = await this.getAudioUrlForSubcategory(node.audioSubcategory);
    }
    return node;
  }

  /**
   * Process agent node - find available agent
   */
  async processAgentNode(nodeId: string, callId?: string): Promise<{ agent: any; nextNode: string }> {
    const node = this.getNodeFromActiveFlow(nodeId);

    if (node.type !== 'agent') {
      throw new BadRequestException('Node is not an agent type');
    }

    const assignedAgents = node.assignedAgents || [];
    if (assignedAgents.length === 0) {
      // No agents assigned - continue to next node for fallback logic
      return {
        agent: null,
        nextNode: node.nextNode || 'end',
      };
    }

    // Try to find an available agent
    const availableAgent = await this.hrService.getNextAvailableAgent(assignedAgents);

    if (availableAgent) {
      // Mark agent as busy if we have a call ID
      if (callId) {
        await this.hrService.markAgentBusy(availableAgent.id, callId);
      }

      return {
        agent: availableAgent,
        nextNode: node.nextNode || 'end',
      };
    }

    // No available agents - continue to next node for fallback logic
    // (e.g., condition node that checks queue time)
    return {
      agent: null,
      nextNode: node.nextNode || 'end',
    };
  }

  /**
   * Process condition node
   */
  async processConditionNode(nodeId: string, context?: any): Promise<string> {
    const node = this.getNodeFromActiveFlow(nodeId);

    if (node.type !== 'condition') {
      throw new BadRequestException('Node is not a condition type');
    }

    const conditionType = node.conditionType;
    const conditionValue = node.conditionValue;

    let result = false;

    switch (conditionType) {
      case 'agent_available':
        if (conditionValue && conditionValue.agentIds) {
          const availableAgent = await this.hrService.getNextAvailableAgent(conditionValue.agentIds);
          result = !!availableAgent;
        }
        break;

      case 'time_check':
        if (conditionValue) {
          const now = new Date();
          const currentHour = now.getHours();

          if (conditionValue.startHour !== undefined && conditionValue.endHour !== undefined) {
            result = currentHour >= conditionValue.startHour && currentHour <= conditionValue.endHour;
          }
        }
        break;

      case 'queue_time':
        if (conditionValue && context?.queueStartTime) {
          const queueStartTime = new Date(context.queueStartTime);
          const now = new Date();
          const queueTimeMinutes = (now.getTime() - queueStartTime.getTime()) / (1000 * 60);

          if (conditionValue.thresholdMinutes !== undefined) {
            result = queueTimeMinutes >= conditionValue.thresholdMinutes;
          }
        }
        break;

      case 'custom':
        // Custom condition logic can be implemented here
        result = conditionValue?.result || false;
        break;

      default:
        result = false;
    }

    // Return appropriate next node based on condition result
    // Use trueNode/falseNode from conditionValue if available, otherwise use options
    if (result) {
      return conditionValue?.trueNode || node.options?.find((opt: any) => opt.key === 'true')?.nextNode || node.nextNode || 'end';
    } else {
      return conditionValue?.falseNode || node.options?.find((opt: any) => opt.key === 'false')?.nextNode || 'queue-general';
    }
  }

  /**
   * Get all available agents for flow configuration
   */
  async getAvailableAgentsForFlow(): Promise<any[]> {
    try {
      const agents = await this.hrService.getUsers({ accountType: 'agent' });
      const agentIds = agents.map(a => a.id).filter(id => id && typeof id === 'string');
      const agentsWithStatus = await this.hrService.getAgentsWithStatus(agentIds);

      return agentsWithStatus;
    } catch (error) {
      console.error('Error in getAvailableAgentsForFlow:', error);
      throw error;
    }
  }
}
