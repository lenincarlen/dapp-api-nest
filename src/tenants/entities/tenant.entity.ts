import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TenantShare } from '../../tenant_shares/entities/tenant-share.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  gov_id: string;

  @Column({ type: 'date', nullable: true })
  birth_date: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  income?: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'owner_id' })
  owner_id: string;

  @Column({ name: 'user_id', nullable: true })
  user_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => TenantShare, tenantShare => tenantShare.mainTenant)
  mainTenantShares: TenantShare[];

  @OneToMany(() => TenantShare, tenantShare => tenantShare.coTenant)
  coTenantShares: TenantShare[];
}

