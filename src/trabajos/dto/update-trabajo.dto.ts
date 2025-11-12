import { TipoTrabajo } from '../enums/tipo-trabajo.enum';

export class UpdateTrabajoDto {
  titulo?: string;
  autores?: string[];
  issn?: string;
  revista?: string;
  año?: number;
  tipo?: TipoTrabajo;
}

