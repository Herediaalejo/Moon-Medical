import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { Usuario } from './usuarios/entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Doctor } from './usuarios/entities/doctor.entity';
import { EspecialidadMedica } from './usuarios/entities/especialidad_medica.entity';
import { CitaMedicaModule } from './cita-medica/cita-medica.module';
import { CitaMedica } from './cita-medica/entities/cita-medica.entity';
import { Notificacion } from './cita-medica/entities/notificacion.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      password: '2314',
      port: 3306,
      username: 'root',
      database: 'moonmedical',
      entities: [Usuario, Doctor, EspecialidadMedica, CitaMedica, Notificacion],
    }),
    UsuariosModule,
    AuthModule,
    CitaMedicaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
