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
import { TrabajosService } from './trabajos.service';
import { CreateTrabajoDto } from './dto/create-trabajo.dto';
import { UpdateTrabajoDto } from './dto/update-trabajo.dto';

@Controller('trabajos')
export class TrabajosController {
  constructor(private readonly trabajosService: TrabajosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTrabajoDto: CreateTrabajoDto) {
    const trabajo = await this.trabajosService.create(createTrabajoDto);
    return {
      message: 'Trabajo creado exitosamente',
      id: trabajo.id,
    };
  }

  @Get()
  findAll() {
    return this.trabajosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trabajosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrabajoDto: UpdateTrabajoDto) {
    return this.trabajosService.update(id, updateTrabajoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.trabajosService.remove(id);
  }
}
