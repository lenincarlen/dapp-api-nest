import { RentStatus } from '../dto/create-rent.dto';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Rents {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contract_id: string;

  @Column()
  tenant_id: string;

  @Column()
  owner_id: string;

  @Column()
  property_id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  monthly_maintenance?: number;

  @Column()
  due_date: string;

  @Column({ nullable: true })
  paid_at?: string;

  @Column({ type: 'enum', enum: RentStatus, default: RentStatus.PENDING })
  status: RentStatus;

  @Column({ nullable: true })
  payment_method?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  previous_balance?: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_due: number;

  // Nuevos campos para el sistema de facturación
  @Column({ type: 'integer', default: 0 })
  days_until_due: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  late_fees: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  accumulated_balance: number;

  @Column({ nullable: true })
  next_rent_id?: string;

  @Column({ type: 'date', nullable: true })
  billing_cycle_start?: Date;

  @Column({ type: 'date', nullable: true })
  billing_cycle_end?: Date;

  @Column({ type: 'integer', default: 0 })
  days_late: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  daily_late_fee: number;
}