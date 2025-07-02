import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { UserActiveInterface } from '../common/interfaces/user-active.interface';

@Controller('properties')
@UseGuards(AuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) { }

  @Post()
  @Roles('owner')
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    const property = await this.propertiesService.create(createPropertyDto, user.id);
    return {
      success: true,
      data: property,
      message: 'Property created successfully'
    };
  }

  @Get()
  @Roles('owner', 'admin')
  async findAll(@ActiveUser() user: UserActiveInterface) {
    let properties;

    if (user.role === 'admin') {
      properties = await this.propertiesService.findAll();
    } else {
      properties = await this.propertiesService.findByOwner(user.id);
    }

    return {
      success: true,
      data: properties,
      message: 'Properties retrieved successfully'
    };
  }

  @Get('my-properties')
  @Roles('owner')
  async findMyProperties(@ActiveUser() user: UserActiveInterface) {
    const properties = await this.propertiesService.findByOwner(user.id);
    return {
      success: true,
      data: properties,
      message: 'My properties retrieved successfully'
    };
  }

  @Get(':id')
  @Roles('owner', 'admin')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser() user: UserActiveInterface,
  ) {
    const property = await this.propertiesService.findOne(id);

    // Verificar que el usuario tiene permisos para ver esta propiedad
    if (user.role === 'owner' && property.ownerId !== user.id) {
      throw new ForbiddenException('You can only view your own properties');
    }

    return {
      success: true,
      data: property,
      message: 'Property retrieved successfully'
    };
  }

  @Patch(':id')
  @Roles('owner')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    const property = await this.propertiesService.update(id, updatePropertyDto, user.id);
    return {
      success: true,
      data: property,
      message: 'Property updated successfully'
    };
  }

  @Delete(':id')
  @Roles('owner')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser() user: UserActiveInterface,
  ) {
    const result = await this.propertiesService.remove(id, user.id);
    return {
      success: true,
      data: result,
      message: 'Property deleted successfully'
    };
  }
}
