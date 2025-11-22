import { Module } from '@nestjs/common';
import { PatentsService } from './patentes.service';
import { PatentsController } from './patentes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patent } from './entities/patente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patent])],
  controllers: [PatentsController],
  providers: [PatentsService],
})
export class PatentsModule {}
