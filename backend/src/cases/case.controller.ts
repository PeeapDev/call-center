import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CaseService } from './case.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

@Controller('cases')
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.caseService.findAll({ status, priority, category, assignedTo });
  }

  @Get('stats')
  async getStats() {
    return this.caseService.getStats();
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.caseService.searchCases(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.caseService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateCaseDto) {
    return this.caseService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateCaseDto) {
    return this.caseService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.caseService.delete(id);
    return { message: 'Case deleted successfully' };
  }

  @Post(':id/link-call')
  async linkCall(
    @Param('id') id: string,
    @Body() callData: {
      callId: string;
      callRecordingUrl?: string;
      callDuration?: number;
      callStartTime?: Date;
      callEndTime?: Date;
    },
  ) {
    return this.caseService.linkCall(id, callData);
  }

  @Post(':id/notes')
  async addNote(
    @Param('id') id: string,
    @Body() body: { note: string; authorId: string },
  ) {
    return this.caseService.addNote(id, body.note, body.authorId);
  }
}
