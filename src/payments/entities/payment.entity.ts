import { PaymentStatus } from '../dto/create-payment.dto';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contract_id: string;

  @Column()
  rent_id: string;

  @Column()
  tenant_id: string;

  @Column()
  owner_id: string;

  @Column()
  property_id: string;

  @Column({ nullable: true })
  stripe_session_id: string | null;

  @Column({ nullable: true })
  stripe_payment_intent: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  fee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  net_amount: number;

  @Column()
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  payment_history: PaymentHistoryEntry[] | null;
}

interface PaymentHistoryEntry {
  date: string;
  event: string;
  details?: string;
}