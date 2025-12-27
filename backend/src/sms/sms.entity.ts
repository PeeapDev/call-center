import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum SmsStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export enum SmsProvider {
  AFRICAS_TALKING = 'africas_talking',
  TWILIO = 'twilio',
  MOCK = 'mock',
}

@Entity('sms_messages')
export class SmsMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  to: string;

  @Column({ nullable: true })
  from: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: SmsStatus.PENDING,
  })
  status: SmsStatus;

  @Column({
    type: 'varchar',
    length: 30,
    default: SmsProvider.MOCK,
  })
  provider: SmsProvider;

  @Column({ nullable: true })
  externalId: string;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  relatedEntityType: string; // 'student', 'case', 'call'

  @Column({ nullable: true })
  relatedEntityId: string;

  @Column({ nullable: true })
  triggeredBy: string; // user ID who triggered the SMS

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;
}

@Entity('sms_templates')
export class SmsTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  code: string; // e.g., 'case_created', 'case_resolved', 'callback_scheduled'

  @Column({ type: 'text' })
  template: string; // Template with placeholders like {{studentName}}, {{caseNumber}}

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
