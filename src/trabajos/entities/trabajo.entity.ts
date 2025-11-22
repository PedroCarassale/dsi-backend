import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { WorkType } from '../enums/work-type.enum';
import { Memory } from 'src/memories/entities/memory.entity';

@Entity('works')
export class Work {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { array: true })
  authors: string[];

  @Column()
  issn: string;

  @Column()
  journal: string;

  @Column()
  year: number;

  @Column({
    type: 'enum',
    enum: WorkType,
  })
  type: WorkType;

  @ManyToMany(() => Memory, (memory) => memory.works)
  memories: Memory[];
}
