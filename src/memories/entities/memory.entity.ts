import { Work } from 'src/trabajos/entities/trabajo.entity';
import { PrimaryGeneratedColumn, Column, Entity, ManyToMany, JoinTable } from 'typeorm';
import { Patent } from 'src/patentes/entities/patente.entity';
import { Group } from 'src/groups/entities/group.entity';

@Entity('memories')
export class Memory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  year: number;

  @ManyToMany(() => Work, (work) => work.memories)
  @JoinTable({
    name: 'memory_works',
    joinColumn: { name: 'memory_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'work_id', referencedColumnName: 'id' },
  })
  works: Work[];

  @ManyToMany(() => Patent, (patent) => patent.memories)
  @JoinTable({
    name: 'memory_patents',
    joinColumn: { name: 'memory_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'patent_id', referencedColumnName: 'id' },
  })
  patents: Patent[];

  @ManyToMany(() => Group, (group) => group.memories)
  groups: Group[];
}
