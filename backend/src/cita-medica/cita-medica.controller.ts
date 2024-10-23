import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CitaMedicaService } from './cita-medica.service';
import { CreateCitaMedicaDto } from './dto/create-cita-medica.dto';
import { NotificacionService } from './notificacion.service';

@Controller('cita-medica')
export class CitaMedicaController {
  constructor(
    private readonly citaMedicaService: CitaMedicaService,
    private readonly notificacionService: NotificacionService,
  ) {}

  @Post()
  create(@Body() createCitaMedicaDto: CreateCitaMedicaDto) {
    return this.citaMedicaService.create(createCitaMedicaDto);
  }

  @Post(':id')
  complete(@Param('id') id: string) {
    return this.citaMedicaService.complete(+id);
  }

  @Get()
  findAll() {
    return this.citaMedicaService.findAll();
  }

  @Get(':id')
  findByUser(@Param('id') userId: string) {
    return this.citaMedicaService.findByUserId(+userId);
  }

  @Get('doctor/:id')
  findByDoctor(@Param('id') doctorId: string) {
    return this.citaMedicaService.findByDoctorId(+doctorId);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.citaMedicaService.cancel(+id);
  }

  @Get('/notificaciones/:id')
  findNotificacionesByUser(@Param('id') userId: string) {
    return this.notificacionService.findByUsuario(+userId);
  }

  @Patch('/notificaciones')
  updateNotificaciones(@Body() body: { ids: number[]; leida: boolean }) {
    const { ids, leida } = body;
    return this.notificacionService.updateNotificaciones(ids, leida);
  }

  @Delete('/notificaciones/:id')
  deleteNotificacion(@Param('id') id: string) {
    return this.notificacionService.deleteNotificacion(+id);
  }
}
