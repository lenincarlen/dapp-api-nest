import { Module } from '@nestjs/common';
import { RoleUserService } from './role_user.service';
import { RoleUserController } from './role_user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/role_user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole])],
  controllers: [RoleUserController],
  providers: [RoleUserService],
  exports: [RoleUserService]
})
export class RoleUserModule {}
