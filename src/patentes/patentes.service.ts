import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatentDto } from './dto/create-patent.dto';
import { UpdatePatentDto } from './dto/update-patent.dto';
import { Patent } from './entities/patente.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PatentsService {
  constructor(
    @InjectRepository(Patent)
    private patentRepository: Repository<Patent>,
  ) {}

  async create(createPatentDto: CreatePatentDto): Promise<Patent> {
    const patent = this.patentRepository.create(createPatentDto);
    return await this.patentRepository.save(patent);
  }

  async findAll(): Promise<Patent[]> {
    return await this.patentRepository.find();
  }

  async findOne(id: string): Promise<Patent> {
    try {
      return await this.patentRepository.findOneOrFail({ where: { id } });
    } catch {
      throw new NotFoundException(`Patent with ID ${id} not found`);
    }
  }

  async update(id: string, updatePatentDto: UpdatePatentDto): Promise<Patent> {
    const patent = await this.findOne(id);
    Object.assign(patent, updatePatentDto);
    return await this.patentRepository.save(patent);
  }

  async remove(id: string): Promise<void> {
    const patent = await this.findOne(id);
    await this.patentRepository.remove(patent);
  }
}
