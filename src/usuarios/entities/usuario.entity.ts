import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Group } from 'src/groups/entities/group.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @ManyToMany(() => Group, (group) => group.users)
  groups: Group[];
}
