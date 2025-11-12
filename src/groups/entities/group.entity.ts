import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Memory } from 'src/memories/entities/memory.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  usuarios: Usuario[];

  @Column()
  memories: Memory[];
}
