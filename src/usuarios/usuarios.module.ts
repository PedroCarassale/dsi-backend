import { Module } from '@nestjs/common';
import { UsersService } from './usuarios.service';
import { UsersController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
