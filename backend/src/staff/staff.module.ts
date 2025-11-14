import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { Staff } from './staff.entity';
import { StaffAttendance } from './staff-attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, StaffAttendance])],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
