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
import { RoutingService } from './routing.service';
import { CreateRoutingRuleDto } from './dto/create-routing-rule.dto';
import { UpdateRoutingRuleDto } from './dto/update-routing-rule.dto';

@Controller('routing')
export class RoutingController {
  constructor(private readonly routingService: RoutingService) {}

  @Get()
  async findAll() {
    return this.routingService.findAll();
  }

  @Get('simulate')
  async simulate(
    @Query('callerNumber') callerNumber: string,
    @Query('ivrOption') ivrOption: string,
    @Query('callTime') callTime: string,
  ) {
    return this.routingService.simulateRouting(
      callerNumber,
      ivrOption,
      callTime,
    );
  }

  @Get('regenerate-dialplan')
  async regenerateDialplan() {
    await this.routingService.generateAsteriskDialplan();
    return { message: 'Dialplan regenerated successfully' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.routingService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateRoutingRuleDto) {
    return this.routingService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRoutingRuleDto,
  ) {
    return this.routingService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.routingService.remove(id);
    return { message: 'Rule deleted successfully' };
  }

  @Post('seed')
  async seed() {
    await this.routingService.seedDefaultRules();
    return { message: 'Default rules seeded successfully' };
  }
}
