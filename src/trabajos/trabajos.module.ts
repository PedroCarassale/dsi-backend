import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrabajosService } from './trabajos.service';
import { TrabajosController } from './trabajos.controller';
import { Trabajo } from './entities/trabajo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trabajo])],
  controllers: [TrabajosController],
  providers: [TrabajosService],
})
export class TrabajosModule {}
