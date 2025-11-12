import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memory } from './entities/memory.entity';

@Injectable()
export class MemoriesService {
  constructor(
    @InjectRepository(Memory)
    private memoryRepository: Repository<Memory>,
  ) {}

  async create(createMemoryDto: CreateMemoryDto): Promise<Memory> {
    const memory = this.memoryRepository.create(createMemoryDto);
    return await this.memoryRepository.save(memory);
  }

  async findAll(): Promise<Memory[]> {
    return await this.memoryRepository.find();
  }

  async findOne(id: string): Promise<Memory> {
    try {
      return await this.memoryRepository.findOneOrFail({ where: { id } });
    } catch {
      throw new NotFoundException(`Memory with ID ${id} not found`);
    }
  }

  async update(id: string, updateMemoryDto: UpdateMemoryDto): Promise<Memory> {
    const memory = await this.findOne(id);
    Object.assign(memory, updateMemoryDto);
    return await this.memoryRepository.save(memory);
  }

  async remove(id: string): Promise<void> {
    const memory = await this.findOne(id);
    await this.memoryRepository.remove(memory);
  }
}
