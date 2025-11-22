import { Work } from 'src/trabajos/entities/trabajo.entity';
import { Patent } from 'src/patentes/entities/patente.entity';

export class CreateMemoryDto {
  name: string;
  year: number;
  works: Work[];
  patents: Patent[];
}
