import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { Work } from './entities/trabajo.entity';

@Injectable()
export class WorksService {
  constructor(
    @InjectRepository(Work)
    private workRepository: Repository<Work>,
  ) {}

  async create(createWorkDto: CreateWorkDto): Promise<Work> {
    const work = this.workRepository.create(createWorkDto);
    return await this.workRepository.save(work);
  }

  async findAll(): Promise<Work[]> {
    return await this.workRepository.find();
  }

  async findOne(id: string): Promise<Work> {
    try {
      return await this.workRepository.findOneOrFail({ where: { id } });
    } catch {
      throw new NotFoundException(`Work with ID ${id} not found`);
    }
  }

  async update(
    id: string,
    updateWorkDto: UpdateWorkDto,
  ): Promise<Work> {
    const work = await this.findOne(id);
    Object.assign(work, updateWorkDto);
    return await this.workRepository.save(work);
  }

  async remove(id: string): Promise<void> {
    const work = await this.findOne(id);
    await this.workRepository.remove(work);
  }
}
