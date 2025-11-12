import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('patentes')
export class Patente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column()
  codigo: string;

  @Column()
  descripcion: string;

  @Column()
  organismo: string;
}
