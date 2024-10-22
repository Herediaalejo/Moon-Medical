import { forwardRef, Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Doctor } from './entities/doctor.entity';
import { EspecialidadMedica } from './entities/especialidad_medica.entity';
import { DoctoresController } from './doctor.controller';
import { CitaMedicaModule } from 'src/cita-medica/cita-medica.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Doctor, EspecialidadMedica]),
    forwardRef(() => AuthModule),
    forwardRef(() => CitaMedicaModule),
  ],
  controllers: [UsuariosController, DoctoresController],
  providers: [UsuariosService],
  exports: [UsuariosService, TypeOrmModule],
})
export class UsuariosModule {}
