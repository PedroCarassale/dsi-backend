import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorksService } from './trabajos.service';
import { WorksController } from './trabajos.controller';
import { Work } from './entities/trabajo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Work])],
  controllers: [WorksController],
  providers: [WorksService],
})
export class WorksModule {}
