import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantShare } from './entities/tenant-share.entity';
import { TenantSharesService } from './tenant_shares.service';
import { TenantSharesController } from './tenant_shares.controller';
import { ContractsModule } from '../contracts/contracts.module';
import { forwardRef } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TenantShare]),
    forwardRef(() => ContractsModule),
    forwardRef(() => TenantsModule),
    CommonModule,
  ],
  providers: [TenantSharesService],
  controllers: [TenantSharesController],
  exports: [TenantSharesService],
})
export class TenantSharesModule { }