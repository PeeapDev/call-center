import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

export type SenderType = 'citizen' | 'staff';

@Entity('support_messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @Column()
  senderId: string;

  @Column({
    type: 'enum',
    enum: ['citizen', 'staff'],
  })
  senderType: SenderType;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  staffName: string;

  @Column({ nullable: true })
  staffRole: string;

  @Column({ nullable: true })
  staffNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;
}