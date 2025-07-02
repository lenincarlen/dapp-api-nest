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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) { }

<<<<<<< HEAD
  async register({ name, email, password }: RegisterDto) {
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      throw new BadRequestException('El usuario ya existe');
    }

    await this.usersService.create({
      name,
      email,
      password: await bcryptjs.hash(password, 10),
=======
  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
>>>>>>> 815bcaf (Clean commit without .env or secrets)
    });

    // Asignar rol de propietario por defecto
    const ownerRole = await this.roleRepository.findOne({
      where: { name: 'owner' }
    });

    if (ownerRole) {
      const userRole = this.userRoleRepository.create({
      userId: user.id,
      roleUuid: ownerRole.uuid,
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
<<<<<<< HEAD
      throw new UnauthorizedException('El email no es valido');
=======
      throw new UnauthorizedException('Credenciales incorrectas');
>>>>>>> 815bcaf (Clean commit without .env or secrets)
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

