import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('price_statistics')
export class PriceStatistics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  district: string;

  @Column({ type: 'varchar', length: 20, default: '上海' })
  city: string;

  @Column({ type: 'varchar', length: 50 })
  propertyType: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  avgPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  minPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  maxPrice: number;

  @Column({ type: 'int' })
  count: number;

  @CreateDateColumn()
  recordedAt: Date;
}
