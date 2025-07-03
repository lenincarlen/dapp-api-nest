import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../common/services/email.service';
import { Role } from '../roles/entities/role.entity';
import { RoleUserService } from '../role_user/role_user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @Inject(forwardRef(() => RoleUserService))
    private roleUserService: RoleUserService,
    private emailService: EmailService,
  ) { }

  async create(createTenantDto: CreateTenantDto, currentUserId: string): Promise<Tenant> {
    console.log('🔍 TenantsService.create - currentUserId:', currentUserId);
    console.log('🔍 TenantsService.create - DTO:', createTenantDto);

    // Verificar que el usuario actual existe
    const user = await this.userRepository.findOne({ where: { id: currentUserId } });
    console.log('🔍 TenantsService.create - User found:', user);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar que el email no esté ya registrado como usuario
    const existingUser = await this.userRepository.findOne({
      where: { email: createTenantDto.email }
    });

    if (existingUser) {
      throw new ForbiddenException('Ya existe un usuario con este email');
    }

    // Generar contraseña aleatoria
    const randomPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Crear usuario para el inquilino
    const tenantUser = this.userRepository.create({
      name: createTenantDto.name,
      email: createTenantDto.email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(tenantUser);
    console.log('✅ Usuario creado para inquilino:', savedUser.id);

    // Asignar rol 'tenant' automáticamente
    const tenantRole = await this.roleRepository.findOne({ where: { name: 'tenant' } });
    if (tenantRole) {
      await this.roleUserService.create({ userId: savedUser.id, roleUuid: tenantRole.uuid });
    }

    const tenantData = {
      ...createTenantDto,
      owner_id: currentUserId,
      user_id: savedUser.id, // Asociar el usuario creado
    };

    console.log('🔍 TenantsService.create - Tenant data to save:', tenantData);

    const tenant = this.tenantRepository.create(tenantData);
    const savedTenant = await this.tenantRepository.save(tenant);

    // Enviar email con credenciales
    try {
      await this.emailService.sendTenantCredentials(
        createTenantDto.email,
        createTenantDto.name,
        createTenantDto.email,
        randomPassword,
      );
      console.log('✅ Email con credenciales enviado exitosamente');
    } catch (error) {
      console.error('❌ Error enviando email con credenciales:', error);
      // No lanzamos el error para no fallar la creación del inquilino
    }

    return savedTenant;
  }

  async findAll(currentUserId: string): Promise<Tenant[]> {
    // Solo mostrar tenants creados por el usuario actual
    return await this.tenantRepository.find({
      where: { owner_id: currentUserId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gov_id: true,
        birth_date: true,
        income: true,
        notes: true,
        created_at: true,
        updated_at: true
      }
    });
  }

  async findOne(id: string, currentUserId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gov_id: true,
        birth_date: true,
        income: true,
        notes: true,
        owner_id: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    // Verificar que el usuario actual es quien creó el tenant
    if (tenant.owner_id !== currentUserId) {
      throw new ForbiddenException('You can only view tenants you created');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto, currentUserId: string): Promise<Tenant> {
    const tenant = await this.findOne(id, currentUserId);

    // Verificar que el usuario actual es quien creó el tenant
    if (tenant.owner_id !== currentUserId) {
      throw new ForbiddenException('You can only update tenants you created');
    }

    Object.assign(tenant, updateTenantDto);
    return await this.tenantRepository.save(tenant);
  }

  async remove(id: string, currentUserId: string): Promise<{ message: string }> {
    const tenant = await this.findOne(id, currentUserId);

    // Verificar que el usuario actual es quien creó el tenant
    if (tenant.owner_id !== currentUserId) {
      throw new ForbiddenException('You can only delete tenants you created');
    }

    await this.tenantRepository.remove(tenant);
    return { message: `Tenant with ID "${id}" successfully removed` };
  }

  /**
   * Genera una contraseña aleatoria segura
   */
  async findByUserId(userId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { user_id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gov_id: true,
        birth_date: true,
        income: true,
        notes: true,
        owner_id: true,
        user_id: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with User ID "${userId}" not found`);
    }

    return tenant;
  }

  /**
   * Genera una contraseña aleatoria segura
   */
  private generateRandomPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }
}
