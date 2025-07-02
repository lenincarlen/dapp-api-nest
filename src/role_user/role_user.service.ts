import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/role_user.entity';
import { CreateRoleUserDto } from './dto/create-role_user.dto';
import { UpdateRoleUserDto } from './dto/update-role_user.dto';

@Injectable()
export class RoleUserService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) { }

  async create(createRoleUserDto: CreateRoleUserDto): Promise<UserRole> {
    const userRole = this.userRoleRepository.create(createRoleUserDto);
    return await this.userRoleRepository.save(userRole);
  }

  findAll() {
    return `This action returns all roleUser`;
  }

  findOne(id: number) {
    return `This action returns a #${id} roleUser`;
  }

  update(id: number, updateRoleUserDto: UpdateRoleUserDto) {
    return `This action updates a #${id} roleUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} roleUser`;
  }
}
