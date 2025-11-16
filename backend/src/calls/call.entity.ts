import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CallStatus {
  INITIATED = 'initiated',
  RINGING = 'ringing',
  CONNECTED = 'connected',
  IN_QUEUE = 'in_queue',
  ENDED = 'ended',
  FAILED = 'failed',
  MISSED = 'missed',
}

export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

@Entity('calls')
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  callerName: string;

  @Column({ nullable: true })
  userId: string;

  @Column()
  direction: CallDirection;

  @Column()
  status: CallStatus;

  @Column({ type: 'text', default: 'normal' })
  priority: 'low' | 'normal' | 'high' | 'urgent';

  @Column({ nullable: true })
  ivrOption: string;

  @Column({ nullable: true })
  queueName: string;

  @Column({ nullable: true })
  assignedAgentId: string;

  @Column({ nullable: true })
  assignedAgentName: string;

  @Column({ nullable: true })
  assignedAgentExtension: string;

  @Column({ type: 'int', nullable: true })
  queuePosition: number;

  @Column({ type: 'int', nullable: true })
  estimatedWaitMinutes: number;

  @Column({ type: 'int', nullable: true })
  durationSeconds: number;

  @Column({ nullable: true })
  recordingUrl: string;

  @Column({ nullable: true })
  caseId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  endedAt: Date;
}
