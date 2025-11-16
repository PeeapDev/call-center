import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { CallsService } from './calls.service';
import { InitiateCallDto, CallResponseDto, CallStatusDto } from './dto/initiate-call.dto';
import { ClaimCallDto } from './dto/claim-call.dto';
import { Call } from './call.entity';

@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post('initiate')
  async initiateCall(@Body() initiateCallDto: InitiateCallDto): Promise<CallResponseDto> {
    return this.callsService.initiateCall(initiateCallDto);
  }

  @Get(':id/status')
  async getCallStatus(@Param('id') id: string): Promise<CallStatusDto> {
    return this.callsService.getCallStatus(id);
  }

  @Post(':id/end')
  async endCall(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    return this.callsService.endCall(id);
  }

  @Get('agents/available')
  async getAvailableAgents(@Query('queue') queue?: string): Promise<any[]> {
    return this.callsService.getAvailableAgents(queue);
  }

  @Get()
  async getAllCalls(@Query('limit') limit?: number): Promise<Call[]> {
    return this.callsService.getAllCalls(limit);
  }

  @Get('active')
  async getActiveCalls(): Promise<{ status: string; calls: Call[] }> {
    const calls = await this.callsService.getActiveCalls();
    return { status: 'ok', calls };
  }

  @Get('active/waiting')
  async getWaitingCalls(): Promise<Call[]> {
    return this.callsService.getWaitingCalls();
  }

  @Post(':id/claim')
  async claimCall(
    @Param('id') id: string,
    @Body() claimCallDto: ClaimCallDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.callsService.claimCall(id, claimCallDto.agentName, claimCallDto.agentExtension);
  }
}
