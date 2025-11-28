import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from 'src/usuarios/entities/usuario.entity';
import { Memory } from 'src/memories/entities/memory.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.groups)
  @JoinTable({
    name: 'group_users',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];

  @ManyToMany(() => Memory, (memory) => memory.groups)
  @JoinTable({
    name: 'group_memories',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'memory_id', referencedColumnName: 'id' },
  })
  memories: Memory[];
}
