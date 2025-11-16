import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AccountType {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  AGENT = 'agent',
  ANALYST = 'analyst',
  AUDITOR = 'auditor',
  CITIZEN = 'citizen',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.AGENT,
  })
  accountType: AccountType;

  @Column({ nullable: true })
  userCategory: string;

  @Column({ nullable: true })
  extension: string;

  @Column({ type: 'json', nullable: true })
  skills: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  sipUsername: string;

  @Column({ nullable: true })
  sipPassword: string;

  @Column({ nullable: true })
  sipExtension: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}