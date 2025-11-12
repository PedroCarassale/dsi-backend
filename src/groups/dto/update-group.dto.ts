import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupDto } from './create-group.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Memory } from 'src/memories/entities/memory.entity';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  name?: string;
  usuarios?: Usuario[];
  memories?: Memory[];
}
