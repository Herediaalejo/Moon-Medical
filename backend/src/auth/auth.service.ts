import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwtPayload';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(nombre_usuario: string, contrasena: string) {
    try {
      console.log(nombre_usuario, contrasena);
      // Busca el usuario por nombre de usuario
      const user = await this.usersService.findOneByUsername(nombre_usuario);
      console.log(user);

      if (user && user instanceof Usuario) {
        // Compara la contraseña proporcionada con la almacenada
        const match = await this.usersService.comparePasswords(
          contrasena,
          user.contrasena,
        );

        if (match) {
          console.log(match);
          // Crea el payload si la contraseña coincide
          const payload: JwtPayload = {
            sub: user.id_usuario,
            username: user.usuario,
            role: user.rol,
          };

          // Genera y retorna el token de acceso
          return {
            access_token: await this.jwtService.sign(payload, {
              secret: process.env.JWT_SECRET,
              expiresIn: '1h',
            }),
          };
        } else {
          return {
            message:
              'El usuario ingresado es incorrecto. Ingrese las credenciales nuevamente.',
          };
        }
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const valid = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      return !!valid;
    } catch (error) {
      // Aquí puedes manejar los errores específicos, por ejemplo, token expirado, token inválido, etc.
      console.error('Token validation error:', error);
      return false;
    }
  }
}
