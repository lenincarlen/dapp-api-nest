import { ContractStatus, PaymentMethod } from '../dto/create-contract.dto';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('contracts')
export class Contracts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  owner_id: string;

  @Column()
  tenant_id: string;

  @Column()
  property_id: string;

  @Column()
  start_date: string;

  @Column()
  end_date: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  payment_due_date: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  security_deposit: number | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  monthly_maintenance: number | null;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  payment_method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.ACTIVE,
  })
  status: ContractStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones eliminadas para evitar errores de TypeORM
  // @ManyToOne(() => any, { nullable: true })
  // @JoinColumn({ name: 'tenant_id' })
  // tenant?: any;

  // @ManyToOne(() => any, { nullable: true })
  // @JoinColumn({ name: 'property_id' })
  // property?: any;
}

export class Contract {
  id: string;
  owner_id: string;
  tenant_id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  amount: number;
  payment_due_date: number;
  security_deposit: number | null;
  monthly_maintenance: number | null;
  payment_method: PaymentMethod;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}