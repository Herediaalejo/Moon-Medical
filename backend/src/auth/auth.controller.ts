import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const { usuario, contrasena } = body;
    return this.authService.login(usuario, contrasena);
  }

  @Post('validate-token')
  async validateToken(@Req() req: Request) {
    const token = req.headers['authorization'];
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const isValid = await this.authService.validateToken(token);
    if (!isValid) {
      throw new UnauthorizedException('Token inválido');
    }
    return { valid: true };
  }
}
