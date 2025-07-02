import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Properties {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  property_name: string;

  @Column()
  address: string;

  @Column({ name: 'owner_id', nullable: false })
  ownerId: string;

  @ManyToOne(() => User, user => user.properties)
  @JoinColumn({ name: 'owner_id', referencedColumnName: 'id' })
  owner: User;
}