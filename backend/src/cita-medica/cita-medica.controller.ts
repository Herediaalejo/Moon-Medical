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

@Controller('cita-medica')
export class CitaMedicaController {
  constructor(private readonly citaMedicaService: CitaMedicaService) {}

  @Post()
  create(@Body() createCitaMedicaDto: CreateCitaMedicaDto) {
    return this.citaMedicaService.create(createCitaMedicaDto);
  }

  @Get()
  findAll() {
    return this.citaMedicaService.findAll();
  }

  @Get(':id')
  findByUser(@Param('id') userId: string) {
    return this.citaMedicaService.findByUser(+userId);
  }

  @Get('doctor/:id')
  findByDoctor(@Param('id') doctorId: string) {
    return this.citaMedicaService.findByDoctor(+doctorId);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.citaMedicaService.cancel(+id);
  }
}
