import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type NotificationType = 'call' | 'chat' | 'system';
export type NotificationStatus = 'unread' | 'read';

@Entity('admin_notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['call', 'chat', 'system'],
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ type: 'json', nullable: true })
  payload: any;

  @Column({
    type: 'enum',
    enum: ['unread', 'read'],
    default: 'unread',
  })
  status: NotificationStatus;

  @CreateDateColumn()
  createdAt: Date;
}