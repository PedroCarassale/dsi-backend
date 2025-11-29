import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkDto } from './create-trabajo.dto';

export class UpdateWorkDto extends PartialType(CreateWorkDto) {}
