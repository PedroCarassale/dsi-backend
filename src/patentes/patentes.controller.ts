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
import { PatentsService } from './patentes.service';
import { CreatePatentDto } from './dto/create-patent.dto';
import { UpdatePatentDto } from './dto/update-patent.dto';

@Controller('patents')
export class PatentsController {
  constructor(private readonly patentsService: PatentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPatentDto: CreatePatentDto) {
    const patent = await this.patentsService.create(createPatentDto);
    return {
      message: 'Patent created successfully',
      id: patent.id,
    };
  }

  @Get()
  findAll() {
    return this.patentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatentDto: UpdatePatentDto) {
    return this.patentsService.update(id, updatePatentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.patentsService.remove(id);
  }
}
