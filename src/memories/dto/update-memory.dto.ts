import { PartialType } from '@nestjs/mapped-types';
import { CreateMemoryDto } from './create-memory.dto';
import { Work } from 'src/trabajos/entities/trabajo.entity';
import { Patent } from 'src/patentes/entities/patente.entity';

export class UpdateMemoryDto extends PartialType(CreateMemoryDto) {
  name?: string;
  year?: number;
  works?: Work[];
  patents?: Patent[];
}
