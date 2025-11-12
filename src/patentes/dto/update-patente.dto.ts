import { PartialType } from '@nestjs/mapped-types';
import { CreatePatenteDto } from './create-patente.dto';

export class UpdatePatenteDto extends PartialType(CreatePatenteDto) {
  titulo?: string;
  codigo?: string;
  descripcion?: string;
  organismo?: string;
}
