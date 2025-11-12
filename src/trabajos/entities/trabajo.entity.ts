import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TipoTrabajo } from '../enums/tipo-trabajo.enum';

@Entity('trabajos')
export class Trabajo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column('text', { array: true })
  autores: string[];

  @Column()
  issn: string;

  @Column()
  revista: string;

  @Column()
  año: number;

  @Column({
    type: 'enum',
    enum: TipoTrabajo,
  })
  tipo: TipoTrabajo;
}
