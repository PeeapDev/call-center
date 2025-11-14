import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('routing_rules')
export class RoutingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int', default: 5 })
  priority: number;

  @Column({ type: 'json' })
  conditions: string[];

  @Column()
  destination: string;

  @Column({ type: 'varchar', length: 50 })
  destinationType: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'int', default: 0 })
  callsRouted: number;

  @Column({ nullable: true })
  asteriskContext: string;

  @Column({ nullable: true })
  asteriskExtension: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
