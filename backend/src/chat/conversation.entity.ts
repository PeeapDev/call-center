import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';

export type ConversationStatus = 'waiting' | 'active' | 'resolved';

@Entity('support_conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  citizenId: string;

  @Column()
  citizenName: string;

  @Column()
  citizenEmail: string;

  @Column({
    type: 'enum',
    enum: ['waiting', 'active', 'resolved'],
    default: 'waiting',
  })
  status: ConversationStatus;

  @Column({ nullable: true })
  assignedToId: string;

  @Column({ nullable: true })
  assignedToName: string;

  @Column({ nullable: true })
  lastMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];
}