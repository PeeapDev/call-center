import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CallbacksService } from './callbacks.service';
import { CallbackStatus, CallbackPriority } from './callback.entity';

class CreateCallbackDto {
  phoneNumber: string;
  callerName?: string;
  studentId?: string;
  caseId?: string;
  scheduledDate: string;
  scheduledTime?: string;
  reason?: string;
  notes?: string;
  priority?: CallbackPriority;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdByAgentId: string;
  createdByAgentName: string;
}

class RecordAttemptDto {
  agentId: string;
  agentName: string;
  result: 'answered' | 'no_answer' | 'busy' | 'failed';
  notes?: string;
  duration?: number;
}

class CompleteCallbackDto {
  agentId: string;
  agentName: string;
  outcome: string;
  notes?: string;
}

@Controller('callbacks')
export class CallbacksController {
  constructor(private readonly callbacksService: CallbacksService) {}

  @Post()
  async createCallback(@Body() dto: CreateCallbackDto) {
    try {
      const callback = await this.callbacksService.createCallback({
        ...dto,
        scheduledDate: new Date(dto.scheduledDate),
      });
      return { status: 'ok', callback };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get()
  async findAll(
    @Query('status') status?: CallbackStatus,
    @Query('assignedAgentId') assignedAgentId?: string,
    @Query('date') date?: string,
    @Query('priority') priority?: CallbackPriority,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    try {
      const result = await this.callbacksService.findAll({
        status,
        assignedAgentId,
        date: date ? new Date(date) : undefined,
        priority,
        limit: limit ? parseInt(String(limit)) : undefined,
        offset: offset ? parseInt(String(offset)) : undefined,
      });
      return { status: 'ok', ...result };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('today')
  async getTodaysCallbacks(@Query('agentId') agentId?: string) {
    try {
      const callbacks = await this.callbacksService.getTodaysCallbacks(agentId);
      return { status: 'ok', callbacks };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('upcoming')
  async getUpcomingCallbacks(@Query('agentId') agentId?: string) {
    try {
      const callbacks = await this.callbacksService.getUpcomingCallbacks(agentId);
      return { status: 'ok', callbacks };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get('stats')
  async getStats() {
    try {
      const stats = await this.callbacksService.getStats();
      return { status: 'ok', stats };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      const callback = await this.callbacksService.findById(id);
      if (!callback) {
        return { status: 'error', message: 'Callback not found' };
      }
      return { status: 'ok', callback };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Put(':id')
  async updateCallback(@Param('id') id: string, @Body() dto: Partial<CreateCallbackDto>) {
    try {
      const updateData: any = { ...dto };
      if (dto.scheduledDate) {
        updateData.scheduledDate = new Date(dto.scheduledDate);
      }
      const callback = await this.callbacksService.updateCallback(id, updateData);
      return { status: 'ok', callback };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Post(':id/attempt')
  async recordAttempt(@Param('id') id: string, @Body() dto: RecordAttemptDto) {
    try {
      const callback = await this.callbacksService.recordAttempt(id, dto);
      return { status: 'ok', callback };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Post(':id/complete')
  async completeCallback(@Param('id') id: string, @Body() dto: CompleteCallbackDto) {
    try {
      const callback = await this.callbacksService.completeCallback(id, dto);
      return { status: 'ok', callback };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Post(':id/cancel')
  async cancelCallback(@Param('id') id: string, @Body() dto: { reason?: string }) {
    try {
      const callback = await this.callbacksService.cancelCallback(id, dto.reason);
      return { status: 'ok', callback };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Post(':id/assign')
  async assignToAgent(
    @Param('id') id: string,
    @Body() dto: { agentId: string; agentName: string },
  ) {
    try {
      const callback = await this.callbacksService.assignToAgent(id, dto.agentId, dto.agentName);
      return { status: 'ok', callback };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Post(':id/reschedule')
  async reschedule(
    @Param('id') id: string,
    @Body() dto: { scheduledDate: string; scheduledTime?: string },
  ) {
    try {
      const callback = await this.callbacksService.reschedule(
        id,
        new Date(dto.scheduledDate),
        dto.scheduledTime,
      );
      return { status: 'ok', callback };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
