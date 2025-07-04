import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RentsService } from './rents.service';
import { RentsController } from './rents.controller';
import { Rents } from './entities/rent.entity';
import { RentsCronService } from './rents-cron.service';
import { forwardRef } from '@nestjs/common';
import { TenantSharesModule } from '../tenant_shares/tenant_shares.module';
import { ContractsModule } from '../contracts/contracts.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rents]),
    ScheduleModule.forRoot(),
    forwardRef(() => TenantSharesModule),
    forwardRef(() => ContractsModule),
    forwardRef(() => TenantsModule),
  ],
  controllers: [RentsController],
  providers: [
    RentsService,
    RentsCronService,
  ],
  exports: [RentsService],
})
export class RentsModule { }
