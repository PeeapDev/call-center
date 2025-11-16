import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ default: 'citizen' }) // Target audience: 'citizen', 'agent', 'all'
  targetGroup: string;

  @Column({ default: 'info' }) // Type: 'info', 'warning', 'urgent'
  type: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: string; // User ID who created the announcement

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;
}
