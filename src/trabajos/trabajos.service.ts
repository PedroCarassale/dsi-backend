import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTrabajoDto } from './dto/create-trabajo.dto';
import { UpdateTrabajoDto } from './dto/update-trabajo.dto';
import { Trabajo } from './entities/trabajo.entity';

@Injectable()
export class TrabajosService {
  constructor(
    @InjectRepository(Trabajo)
    private trabajoRepository: Repository<Trabajo>,
  ) {}

  async create(createTrabajoDto: CreateTrabajoDto): Promise<Trabajo> {
    const trabajo = this.trabajoRepository.create(createTrabajoDto);
    return await this.trabajoRepository.save(trabajo);
  }

  async findAll(): Promise<Trabajo[]> {
    return await this.trabajoRepository.find();
  }

  async findOne(id: string): Promise<Trabajo> {
    try {
      return await this.trabajoRepository.findOneOrFail({ where: { id } });
    } catch {
      throw new NotFoundException(`Trabajo con ID ${id} no encontrado`);
    }
  }

  async update(
    id: string,
    updateTrabajoDto: UpdateTrabajoDto,
  ): Promise<Trabajo> {
    const trabajo = await this.findOne(id);
    Object.assign(trabajo, updateTrabajoDto);
    return await this.trabajoRepository.save(trabajo);
  }

  async remove(id: string): Promise<void> {
    const trabajo = await this.findOne(id);
    await this.trabajoRepository.remove(trabajo);
  }
}
