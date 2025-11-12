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
import { PatentesService } from './patentes.service';
import { CreatePatenteDto } from './dto/create-patente.dto';
import { UpdatePatenteDto } from './dto/update-patente.dto';

@Controller('patentes')
export class PatentesController {
  constructor(private readonly patentesService: PatentesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPatenteDto: CreatePatenteDto) {
    const patente = await this.patentesService.create(createPatenteDto);
    return {
      message: 'Patente creada exitosamente',
      id: patente.id,
    };
  }

  @Get()
  findAll() {
    return this.patentesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patentesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatenteDto: UpdatePatenteDto) {
    return this.patentesService.update(id, updatePatenteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.patentesService.remove(id);
  }
}
