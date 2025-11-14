import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('staff_attendance')
export class StaffAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  staffId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time', nullable: true })
  checkInTime: string;

  @Column({ type: 'time', nullable: true })
  checkOutTime: string;

  @Column({ type: 'varchar', default: 'present' }) // present, absent, late, half_day, on_leave
  status: string;

  @Column({ type: 'varchar', default: 'qr_scan' }) // qr_scan, manual, biometric
  checkInMethod: string;

  @Column({ type: 'varchar', nullable: true })
  checkOutMethod: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  location: string; // Where they checked in

  @CreateDateColumn()
  createdAt: Date;
}
