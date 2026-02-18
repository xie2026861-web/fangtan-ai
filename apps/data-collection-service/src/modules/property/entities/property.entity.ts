import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  externalId: string;

  @Column({ type: 'varchar', length: 20 })
  source: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  propertyType: string;

  @Column({ type: 'varchar', length: 20 })
  transactionType: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 10, default: '万元' })
  priceUnit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area: number;

  @Column({ type: 'int', nullable: true })
  bedrooms: number;

  @Column({ type: 'int', nullable: true })
  bathrooms: number;

  @Column({ type: 'int', nullable: true })
  floor: number;

  @Column({ type: 'int', nullable: true })
  totalFloors: number;

  @Column({ type: 'int', nullable: true })
  yearBuilt: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  renovation: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  direction: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  district: string;

  @Column({ type: 'varchar', length: 20, default: '上海' })
  city: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'varchar', length: 20, default: 'ON_SALE' })
  status: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  agentName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  agentPhone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  agencyName: string;

  @Column({ type: 'int', default: 0 })
  viewedCount: number;

  @CreateDateColumn()
  collectedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
