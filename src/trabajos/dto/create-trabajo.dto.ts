import { TipoTrabajo } from '../enums/tipo-trabajo.enum';

export class CreateTrabajoDto {
  titulo: string;
  autores: string[];
  issn: string;
  revista: string;
  año: number;
  tipo: TipoTrabajo;
}

