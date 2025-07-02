import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany
} from 'typeorm';
import { UserRole } from '../../user_roles/entities/user-role.entity';
import { Properties } from '../../properties/entities/property.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;



  @Column()
  name: string;
// 
  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false, select: false })
  password: string;

  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => Properties, property => property.owner)
  properties: Properties[];

  @DeleteDateColumn()
  deletedAt: Date;
}
