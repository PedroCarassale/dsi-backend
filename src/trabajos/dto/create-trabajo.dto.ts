import { WorkType } from '../enums/work-type.enum';

export class CreateWorkDto {
  title: string;
  authors: string[];
  issn: string;
  journal: string;
  year: number;
  type: WorkType;
}
