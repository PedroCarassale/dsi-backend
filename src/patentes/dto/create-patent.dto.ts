import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePatentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  organization: string;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsString()
  @IsOptional()
  property: string;
}
