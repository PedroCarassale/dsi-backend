import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
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

  @Get(':id/export')
  async export(@Param('id') id: string, @Query('pdf') pdf: string, @Res() res: Response) {
    if (pdf === 'true') {
      const buffer = await this.memoriesService.exportToPdf(id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=memoria-${id}.pdf`);
      res.send(buffer);
    } else {
      const buffer = await this.memoriesService.exportToExcel(id);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=memoria-${id}.xlsx`);
      res.send(buffer);
    }
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
