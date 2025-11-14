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
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async findAll() {
    return this.staffService.findAll();
  }

  @Get('stats')
  async getStats(@Query('month') month?: number, @Query('year') year?: number) {
    return this.staffService.getAttendanceStats(month, year);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateStaffDto) {
    return this.staffService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateStaffDto) {
    return this.staffService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.staffService.delete(id);
    return { message: 'Staff deleted successfully' };
  }

  // Attendance endpoints
  @Post('attendance/check-in')
  async checkIn(@Body() body: { qrCode: string; location?: string }) {
    return this.staffService.checkIn(body.qrCode, body.location);
  }

  @Post('attendance/check-out')
  async checkOut(@Body() body: { qrCode: string }) {
    return this.staffService.checkOut(body.qrCode);
  }

  @Get('attendance/today')
  async getTodayAttendance() {
    return this.staffService.getTodayAttendance();
  }

  @Get(':id/attendance')
  async getAttendance(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.staffService.getAttendanceByStaff(id, start, end);
  }
}
