import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrabajosModule } from './trabajos/trabajos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PatentesModule } from './patentes/patentes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'dsi_backend',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // ⚠️ Solo para desarrollo, desactivar en producción
    }),
    TrabajosModule,
    UsuariosModule,
    PatentesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
