import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Memory } from 'src/memories/entities/memory.entity';

@Entity('patents')
export class Patent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  code: string;

  @Column()
  description: string;

  @Column()
  organization: string;

  @ManyToMany(() => Memory, (memory) => memory.patents)
  memories: Memory[];
}
