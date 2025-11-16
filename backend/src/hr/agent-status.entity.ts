import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AgentStatusType {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
  BREAK = 'break',
}

@Entity('agent_status')
@Index(['agentId'])
@Index(['status'])
export class AgentStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  agentId: string;

  @Column({
    type: 'enum',
    enum: AgentStatusType,
    default: AgentStatusType.OFFLINE,
  })
  status: AgentStatusType;

  @Column({ nullable: true })
  currentCallId?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActivity: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}