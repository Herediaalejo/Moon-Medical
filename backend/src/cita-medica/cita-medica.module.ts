import { forwardRef, Module } from '@nestjs/common';
import { CitaMedicaService } from './cita-medica.service';
import { CitaMedicaController } from './cita-medica.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitaMedica } from './entities/cita-medica.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CitaMedica]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsuariosModule),
  ],
  controllers: [CitaMedicaController],
  providers: [CitaMedicaService],
  exports: [TypeOrmModule],
})
export class CitaMedicaModule {}
