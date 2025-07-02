import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from '../../user_roles/entities/user-role.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];
}