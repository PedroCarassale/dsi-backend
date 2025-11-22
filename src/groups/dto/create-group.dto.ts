import { User } from 'src/usuarios/entities/usuario.entity';
import { Memory } from 'src/memories/entities/memory.entity';

export class CreateGroupDto {
  name: string;
  users: User[];
  memories: Memory[];
}
