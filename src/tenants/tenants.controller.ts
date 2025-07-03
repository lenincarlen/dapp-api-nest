import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { UserActiveInterface } from '../common/interfaces/user-active.interface';

@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('owner', 'admin')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) { }

  @Post()
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @ActiveUser() user: UserActiveInterface
  ) {
    console.log('🔍 TenantsController.create - User:', user);
    console.log('🔍 TenantsController.create - User ID:', user?.sub);
    console.log('🔍 TenantsController.create - DTO:', createTenantDto);

    if (!user || !user.sub) {
      console.error('❌ TenantsController.create - User or user.sub is null/undefined');
      throw new Error('User not authenticated');
    }

    const tenant = await this.tenantsService.create(createTenantDto, user.sub);
    return {
      success: true,
      data: tenant,
      message: 'Tenant created successfully'
    };
  }

  @Get()
  async findAll(@ActiveUser() user: UserActiveInterface) {
    const tenants = await this.tenantsService.findAll(user.sub);
    return {
      success: true,
      data: tenants,
      message: 'Tenants retrieved successfully'
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ActiveUser() user: UserActiveInterface
  ) {
    const tenant = await this.tenantsService.findOne(id, user.sub);
    return {
      success: true,
      data: tenant,
      message: 'Tenant retrieved successfully'
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @ActiveUser() user: UserActiveInterface
  ) {
    const tenant = await this.tenantsService.update(id, updateTenantDto, user.sub);
    return {
      success: true,
      data: tenant,
      message: 'Tenant updated successfully'
    };
  }

  @Get('user/:userId')
  @Roles('tenant', 'owner', 'admin') // Allow tenants to fetch their own tenant ID
  async findByUserId(
    @Param('userId') userId: string,
    @ActiveUser() user: UserActiveInterface
  ) {
    // Ensure the user is only fetching their own tenant ID unless they are an admin or owner
    if (user.sub !== userId && user.role !== 'admin' && user.role !== 'owner') {
      throw new ForbiddenException('You can only view your own tenant information');
    }
    const tenant = await this.tenantsService.findByUserId(userId);
    return {
      success: true,
      data: tenant,
      message: 'Tenant retrieved successfully by user ID'
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @ActiveUser() user: UserActiveInterface
  ) {
    const result = await this.tenantsService.remove(id, user.sub);
    return {
      success: true,
      data: result,
      message: 'Tenant deleted successfully'
    };
  }
}
