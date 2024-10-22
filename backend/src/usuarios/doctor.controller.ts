import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';

@Controller('doctores')
export class DoctoresController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('registrar')
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.usuariosService.createDoctor(createDoctorDto);
  }

  @Get('especialidades')
  findAllEspecialidades() {
    return this.usuariosService.findAllEspecialidades();
  }

  @Get()
  findAllDoctores() {
    return this.usuariosService.findAllDoctores();
  }
}
