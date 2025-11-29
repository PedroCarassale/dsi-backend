import { PartialType } from '@nestjs/mapped-types';
import { CreatePatentDto } from './create-patente.dto';

export class UpdatePatentDto extends PartialType(CreatePatentDto) {}
