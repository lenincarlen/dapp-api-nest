import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Properties } from './entities/property.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Properties)
    private propertiesRepository: Repository<Properties>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async create(createPropertyDto: CreatePropertyDto, currentUserId: string): Promise<Properties> {
    // Si no se proporciona ownerId, usar el usuario actual
    const ownerId = createPropertyDto.ownerId || currentUserId;

    // Verificar que el usuario actual es el propietario
    if (ownerId !== currentUserId) {
      throw new ForbiddenException('You can only create properties for yourself');
    }

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: currentUserId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const property = this.propertiesRepository.create({
      property_name: createPropertyDto.property_name,
      address: createPropertyDto.address,
      owner: user
    });

    return await this.propertiesRepository.save(property);
  }

  async findAll(): Promise<Properties[]> {
    return await this.propertiesRepository.find({
      relations: ['owner'],
      select: {
        id: true,
        property_name: true,
        address: true,
        owner: {
          id: true,
          name: true,
          email: true
        }
      }
    });
  }

  async findOne(id: string): Promise<Properties> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['owner'],
      select: {
        id: true,
        property_name: true,
        address: true,
        ownerId: true,
        owner: {
          id: true,
          name: true,
          email: true
        }
      }
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }
    return property;
  }

  async findByOwner(ownerId: string): Promise<Properties[]> {
    return await this.propertiesRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['owner'],
      select: {
        id: true,
        property_name: true,
        address: true,
        owner: {
          id: true,
          name: true,
          email: true
        }
      }
    });
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto, currentUserId: string): Promise<Properties> {
    const property = await this.findOne(id);

    // Verificar que el usuario actual es el propietario de la propiedad
    if (property.ownerId !== currentUserId) {
      throw new ForbiddenException('You can only update your own properties');
    }

    Object.assign(property, updatePropertyDto);
    return await this.propertiesRepository.save(property);
  }

  async remove(id: string, currentUserId: string): Promise<{ message: string }> {
    const property = await this.findOne(id);

    // Verificar que el usuario actual es el propietario de la propiedad
    if (property.ownerId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    await this.propertiesRepository.remove(property);
    return { message: `Property with ID "${id}" successfully removed` };
  }
}
