import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatenteDto } from './dto/create-patente.dto';
import { UpdatePatenteDto } from './dto/update-patente.dto';
import { Patente } from './entities/patente.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PatentesService {
  constructor(
    @InjectRepository(Patente)
    private patenteRepository: Repository<Patente>,
  ) {}

  async create(createPatenteDto: CreatePatenteDto): Promise<Patente> {
    const patente = this.patenteRepository.create(createPatenteDto);
    return await this.patenteRepository.save(patente);
  }

  async findAll(): Promise<Patente[]> {
    return await this.patenteRepository.find();
  }

  async findOne(id: string): Promise<Patente> {
    try {
      return await this.patenteRepository.findOneOrFail({ where: { id } });
    } catch {
      throw new NotFoundException(`Patente con ID ${id} no encontrada`);
    }
  }

  async update(
    id: string,
    updatePatenteDto: UpdatePatenteDto,
  ): Promise<Patente> {
    const patente = await this.findOne(id);
    Object.assign(patente, updatePatenteDto);
    return await this.patenteRepository.save(patente);
  }

  async remove(id: string): Promise<void> {
    const patente = await this.findOne(id);
    await this.patenteRepository.remove(patente);
  }
}
