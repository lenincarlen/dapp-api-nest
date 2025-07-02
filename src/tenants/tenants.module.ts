import { Module, forwardRef } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from './entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { RoleUserModule } from '../role_user/role_user.module';
import { Role } from '../roles/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, User, Role]),
    CommonModule,
    forwardRef(() => RoleUserModule),
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService], // Exporting the service to be used in other modules
})
export class TenantsModule { }

