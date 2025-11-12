import { Module } from '@nestjs/common';
import { MemoriesService } from './memories.service';
import { MemoriesController } from './memories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memory } from './entities/memory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Memory])],
  controllers: [MemoriesController],
  providers: [MemoriesService],
})
export class MemoriesModule {}
