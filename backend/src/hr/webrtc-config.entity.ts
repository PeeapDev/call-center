import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('webrtc_config')
export class WebRTCConfig {
  @PrimaryColumn()
  id: string;

  @Column({ default: 'stun:stun.l.google.com:19302' })
  stunServer: string;

  @Column({ nullable: true })
  turnServer: string;

  @Column({ nullable: true })
  turnUsername: string;

  @Column({ nullable: true })
  turnPassword: string;

  @Column({ default: 'ws://localhost:8088/ws' })
  asteriskWsUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}