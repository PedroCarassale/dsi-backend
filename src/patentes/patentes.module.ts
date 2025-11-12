import { Module } from '@nestjs/common';
import { PatentesService } from './patentes.service';
import { PatentesController } from './patentes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patente } from './entities/patente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patente])],
  controllers: [PatentesController],
  providers: [PatentesService],
})
export class PatentesModule {}
