import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional } from 'class-validator';
import { Work } from 'src/trabajos/entities/trabajo.entity';
import { Patent } from 'src/patentes/entities/patente.entity';

export class CreateMemoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsArray()
  @IsOptional()
  works: Work[];

  @IsArray()
  @IsOptional()
  patents: Patent[];
}
