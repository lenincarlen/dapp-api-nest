import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Contracts } from '../../contracts/entities/contract.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum TenantShareStatus {
  ACTIVE = 'active',
  PENDING_INVITE = 'pending_invite',
  CANCELLED = 'cancelled',
}

@Entity('tenant_shares')
export class TenantShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Contracts, contract => contract.tenantShares)
  @JoinColumn({ name: 'contract_id' })
  contract: Contracts;

  @Column({ type: 'uuid' })
  contract_id: string;

  @ManyToOne(() => Tenant, tenant => tenant.mainTenantShares)
  @JoinColumn({ name: 'main_tenant_id' })
  mainTenant: Tenant;

  @Column({ type: 'uuid' })
  main_tenant_id: string;

  @ManyToOne(() => Tenant, tenant => tenant.coTenantShares, { nullable: true })
  @JoinColumn({ name: 'co_tenant_id' })
  coTenant: Tenant;

  @Column({ type: 'uuid', nullable: true })
  co_tenant_id: string;

  @Column({ nullable: true })
  invitedEmail: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage: number;

  @Column({ type: 'enum', enum: TenantShareStatus, default: TenantShareStatus.PENDING_INVITE })
  status: TenantShareStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}