import { Test, TestingModule } from '@nestjs/testing';
import { CitaMedicaController } from 'src/cita-medica/cita-medica.controller';
import { CitaMedicaService } from 'src/cita-medica/cita-medica.service';
import { NotificacionService } from 'src/cita-medica/notificacion.service';
import { CreateCitaMedicaDto } from 'src/cita-medica/dto/create-cita-medica.dto';

describe('CitaMedicaController', () => {
  let controller: CitaMedicaController;
  let citaMedicaService: CitaMedicaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitaMedicaController],
      providers: [
        {
          provide: CitaMedicaService,
          useValue: {
            create: jest.fn().mockResolvedValue({
              id: 1,
              mensaje: 'Cita agendada exitosamente',
            }), // Mock de agendar cita
            cancel: jest
              .fn()
              .mockResolvedValue({ mensaje: 'Cita cancelada exitosamente' }), // Mock de cancelar cita
          },
        },
        {
          provide: NotificacionService,
          useValue: {}, // Mock vacío para notificaciones (puedes agregar más si es necesario)
        },
      ],
    }).compile();

    controller = module.get<CitaMedicaController>(CitaMedicaController);
    citaMedicaService = module.get<CitaMedicaService>(CitaMedicaService);
  });

  it('debería permitir agendar una cita con un médico disponible', async () => {
    const createCitaDto: CreateCitaMedicaDto = {
      id_usuario: 1,
      id_doctor: 1,
      id_especialidad: 7,
      fecha_turno: new Date(),
      costo: 5000,
      estado: 'Pendiente',
    };

    const result = await controller.create(createCitaDto); // Llama al método para agendar la cita
    expect(result).toEqual({ id: 1, mensaje: 'Cita agendada exitosamente' }); // Verifica el resultado

    // Verifica que el servicio haya sido llamado con los datos correctos
    expect(citaMedicaService.create).toHaveBeenCalledWith(createCitaDto);
  });

  it('debería permitir cancelar una cita programada', async () => {
    const id = '1'; // ID de la cita a cancelar

    const result = await controller.cancel(id); // Llama al método para cancelar la cita
    expect(result).toEqual({ mensaje: 'Cita cancelada exitosamente' }); // Verifica el resultado

    // Verifica que el servicio haya sido llamado con el ID correcto
    expect(citaMedicaService.cancel).toHaveBeenCalledWith(+id);
  });
});
