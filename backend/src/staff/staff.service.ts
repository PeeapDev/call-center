import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Staff } from './staff.entity';
import { StaffAttendance } from './staff-attendance.entity';
import { randomUUID } from 'crypto';
import * as QRCode from 'qrcode';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(StaffAttendance)
    private attendanceRepository: Repository<StaffAttendance>,
  ) {}

  async findAll(): Promise<Staff[]> {
    return this.staffRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Staff | null> {
    return this.staffRepository.findOne({ where: { id } });
  }

  async create(staffData: Partial<Staff>): Promise<Staff> {
    // Generate unique QR code
    const qrCodeString = `STAFF-${randomUUID()}`;
    
    // Generate QR code image (base64)
    const qrCodeImage = await QRCode.toDataURL(qrCodeString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const staff = this.staffRepository.create({
      ...staffData,
      qrCode: qrCodeString,
      qrCodeImage,
      status: staffData.status || 'active',
    });

    return this.staffRepository.save(staff);
  }

  async update(id: string, staffData: Partial<Staff>): Promise<Staff | null> {
    await this.staffRepository.update(id, staffData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.staffRepository.delete(id);
  }

  // Attendance methods
  async checkIn(qrCode: string, location?: string): Promise<StaffAttendance> {
    const staff = await this.staffRepository.findOne({ where: { qrCode } });
    if (!staff) {
      throw new Error('Invalid QR code');
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Check if already checked in today
    const existing = await this.attendanceRepository.findOne({
      where: {
        staffId: staff.id,
        date: new Date(today) as any,
      },
    });

    if (existing && existing.checkInTime) {
      throw new Error('Already checked in today');
    }

    const now = new Date();
    const checkInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    // Determine if late (assuming 9:00 AM start time)
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);

    const attendance = this.attendanceRepository.create({
      staffId: staff.id,
      date: new Date(today) as any,
      checkInTime,
      status: isLate ? 'late' : 'present',
      checkInMethod: 'qr_scan',
      location,
    });

    return this.attendanceRepository.save(attendance);
  }

  async checkOut(qrCode: string): Promise<StaffAttendance> {
    const staff = await this.staffRepository.findOne({ where: { qrCode } });
    if (!staff) {
      throw new Error('Invalid QR code');
    }

    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await this.attendanceRepository.findOne({
      where: {
        staffId: staff.id,
        date: new Date(today) as any,
      },
    });

    if (!attendance) {
      throw new Error('No check-in found for today');
    }

    if (attendance.checkOutTime) {
      throw new Error('Already checked out today');
    }

    const now = new Date();
    const checkOutTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    attendance.checkOutTime = checkOutTime;
    attendance.checkOutMethod = 'qr_scan';

    return this.attendanceRepository.save(attendance);
  }

  async getAttendanceByStaff(staffId: string, startDate?: Date, endDate?: Date): Promise<StaffAttendance[]> {
    const query: any = { staffId };
    
    if (startDate && endDate) {
      query.date = Between(startDate, endDate);
    }

    return this.attendanceRepository.find({
      where: query,
      order: { date: 'DESC' },
    });
  }

  async getTodayAttendance(): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await this.attendanceRepository.find({
      where: { date: new Date(today) as any },
      relations: ['staff'],
    });

    return attendance;
  }

  async getAttendanceStats(month?: number, year?: number): Promise<any> {
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const attendance = await this.attendanceRepository.find({
      where: {
        date: Between(startDate, endDate) as any,
      },
    });

    const stats = {
      totalDays: endDate.getDate(),
      totalStaff: await this.staffRepository.count({ where: { status: 'active' } }),
      presentCount: attendance.filter(a => a.status === 'present').length,
      lateCount: attendance.filter(a => a.status === 'late').length,
      absentCount: attendance.filter(a => a.status === 'absent').length,
      onLeaveCount: attendance.filter(a => a.status === 'on_leave').length,
    };

    return stats;
  }
}
