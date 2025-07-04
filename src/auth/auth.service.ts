import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../role_user/entities/role_user.entity';
import { Role } from '../roles/entities/role.entity';
import { TenantSharesService } from '../tenant_shares/tenant_shares.service';
import { TenantShareStatus } from '../tenant_shares/entities/tenant-share.entity';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private tenantSharesService: TenantSharesService,
    private tenantsService: TenantsService,
  ) { }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Asignar rol de propietario por defecto
    let assignedRole: Role;
    const existingTenantShare = await this.tenantSharesService.findByInvitedEmail(registerDto.email);

    if (existingTenantShare && existingTenantShare.status === TenantShareStatus.PENDING_INVITE) {
      assignedRole = await this.roleRepository.findOne({ where: { name: 'tenant' } });
      if (!assignedRole) {
        throw new BadRequestException('Tenant role not found');
      }
      // Create a tenant entry for the new user
      const tenant = await this.tenantsService.create({
        email: user.email,
        name: user.name,
        phone: '', // Placeholder
        gov_id: '', // Placeholder
        birth_date: '', // Placeholder
        income: 0, // Placeholder
        notes: '', // Placeholder
      }, undefined); // Pass undefined for currentUserId as it's a co-tenant registration
      // Update the TenantShare with the new coTenantId and status
      await this.tenantSharesService.update(existingTenantShare.id, {
        co_tenant_id: tenant.id,
        status: TenantShareStatus.ACTIVE,
      });
    } else {
      assignedRole = await this.roleRepository.findOne({ where: { name: 'owner' } });
      if (!assignedRole) {
        throw new BadRequestException('Owner role not found');
      }
    }

    if (assignedRole) {
      const userRole = this.userRoleRepository.create({
        userId: user.id,
        roleUuid: assignedRole.uuid,
      });
      await this.userRoleRepository.save(userRole);
    }

    // Fetch user with roles for JWT payload
    const userWithRoles = await this.usersService.findByEmailWithPassword(user.email);
    const roles = userWithRoles.userRoles.map(userRole => userRole.role.name);
    const primaryRole = roles[0] || 'owner'; // Default to owner if no roles
    const payload = {
      email: userWithRoles.email,
      sub: userWithRoles.id,
      name: userWithRoles.name,
      roles,
      role: primaryRole // Include primary role for frontend compatibility
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    const roles = user.userRoles.map(userRole => userRole.role.name);
    const primaryRole = roles[0] || 'owner'; // Default to owner if no roles
    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
      roles,
      role: primaryRole // Include primary role for frontend compatibility
    };
    const token = this.jwtService.sign(payload);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async profile(id: string) {
    return this.usersService.findOne(id);
  }
}

