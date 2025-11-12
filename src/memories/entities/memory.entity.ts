import { Trabajo } from 'src/trabajos/entities/trabajo.entity';
import { PrimaryGeneratedColumn, Column } from 'typeorm';
import { Entity } from 'typeorm';
import { Patente } from 'src/patentes/entities/patente.entity';

@Entity('memories')
export class Memory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  year: number;

  @Column()
  articles: Trabajo[];

  @Column()
  patents: Patente[];
}
