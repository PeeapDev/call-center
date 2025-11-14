import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  position: string; // Agent, Supervisor, Manager, etc.

  @Column()
  department: string;

  @Column({ type: 'varchar', default: 'active' }) // active, on_leave, terminated
  status: string;

  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  emergencyContact: string;

  @Column({ nullable: true })
  emergencyPhone: string;

  // QR Code for attendance
  @Column({ unique: true })
  qrCode: string; // Unique QR code string

  @Column({ type: 'text', nullable: true })
  qrCodeImage: string; // Base64 encoded QR image

  @Column({ nullable: true })
  photo: string; // Profile photo URL

  @Column({ type: 'json', nullable: true })
  workSchedule: any; // { monday: "9:00-17:00", tuesday: "9:00-17:00" }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
