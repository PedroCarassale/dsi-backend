import { Trabajo } from 'src/trabajos/entities/trabajo.entity';
import { Patente } from 'src/patentes/entities/patente.entity';

export class CreateMemoryDto {
  name: string;
  year: number;
  articles: Trabajo[];
  patents: Patente[];
}
