import { IsString, IsNotEmpty, IsArray, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { WorkType } from '../enums/work-type.enum';

export class CreateWorkDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  authors: string[];

  @IsString()
  @IsNotEmpty()
  issn: string;

  @IsString()
  @IsOptional()
  journal: string;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsEnum(WorkType)
  @IsNotEmpty()
  type: WorkType;
}
