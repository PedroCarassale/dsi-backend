import { PartialType } from '@nestjs/mapped-types';
import { CreateMemoryDto } from './create-memory.dto';
import { Trabajo } from 'src/trabajos/entities/trabajo.entity';
import { Patente } from 'src/patentes/entities/patente.entity';

export class UpdateMemoryDto extends PartialType(CreateMemoryDto) {
  name?: string;
  year?: number;
  articles?: Trabajo[];
  patents?: Patente[];
}
