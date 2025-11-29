import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { User } from 'src/usuarios/entities/usuario.entity';
import { Memory } from 'src/memories/entities/memory.entity';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsOptional()
  users: User[];

  @IsArray()
  @IsOptional()
  memories: Memory[];
}
