import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MemoriesService } from './memories.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';

@Controller('memories')
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMemoryDto: CreateMemoryDto) {
    const memory = await this.memoriesService.create(createMemoryDto);
    return {
      message: 'Memory created successfully',
      id: memory.id,
    };
  }

  @Get()
  findAll() {
    return this.memoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemoryDto: UpdateMemoryDto) {
    return this.memoriesService.update(id, updateMemoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.memoriesService.remove(id);
  }
}
