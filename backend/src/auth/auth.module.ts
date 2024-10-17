import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { AdminGuard } from './admin.guard';
import { AuthGuard } from './auth.guard';
import { ClientGuard } from './client.guard';
import { DoctorGuard } from './doctor.guard';

@Module({
  imports: [forwardRef(() => UsuariosModule)],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    AuthGuard,
    AdminGuard,
    ClientGuard,
    DoctorGuard,
  ],
  exports: [AuthGuard, AdminGuard, ClientGuard, DoctorGuard, JwtService],
})
export class AuthModule {}
