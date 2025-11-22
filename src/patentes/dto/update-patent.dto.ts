import { PartialType } from '@nestjs/mapped-types';
import { CreatePatentDto } from './create-patent.dto';

export class UpdatePatentDto extends PartialType(CreatePatentDto) {
  title?: string;
  code?: string;
  description?: string;
  organization?: string;
}
