import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('call_tasks')
export class CallTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  scriptId: string;

  @Column({ type: 'simple-array', nullable: true })
  customerIds: string[];

  @Column({ type: 'int', default: 0 })
  totalCustomers: number;

  @Column({ type: 'int', default: 0 })
  completedCalls: number;

  @Column({ type: 'int', default: 0 })
  successfulCalls: number;

  @Column({ type: 'int', default: 0 })
  failedCalls: number;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string;

  @Column({ type: 'int', default: 1 })
  priority: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
