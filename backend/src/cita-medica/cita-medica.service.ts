import { CreateCitaMedicaDto } from './dto/create-cita-medica.dto';
import { CitaMedica } from './entities/cita-medica.entity'; // Asegúrate de tener la entidad importada
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EspecialidadMedica } from 'src/usuarios/entities/especialidad_medica.entity';
import { Doctor } from 'src/usuarios/entities/doctor.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { NotificacionService } from './notificacion.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';

@Injectable()
export class CitaMedicaService {
  @InjectRepository(CitaMedica)
  private readonly citaMedicaRepository: Repository<CitaMedica>;

  @InjectRepository(Doctor)
  private readonly doctorRepository: Repository<Doctor>;

  @InjectRepository(EspecialidadMedica)
  private readonly especialidadRepository: Repository<EspecialidadMedica>;

  @InjectRepository(Usuario)
  private usuariosRepository: Repository<Usuario>;

  constructor(private readonly notificacionService: NotificacionService) {}

  public async create(citaMedicaDto: CreateCitaMedicaDto) {
    try {
      if (!citaMedicaDto) {
        throw new BadRequestException(
          'Debe proporcionar los datos de la cita médica',
        );
      }

      // Verificar campos obligatorios
      if (
        !citaMedicaDto.id_especialidad ||
        !citaMedicaDto.id_doctor ||
        !citaMedicaDto.fecha_turno ||
        !citaMedicaDto.costo
      ) {
        throw new BadRequestException(
          'Los campos "id_especialidad", "id_doctor", "fecha_turno", y "costo" son obligatorios',
        );
      }

      // Si el médico se está reservando a sí mismo, se puede asignar el id_usuario igual al id_doctor
      if (!citaMedicaDto.id_usuario) {
        citaMedicaDto.id_usuario = citaMedicaDto.id_doctor; // Permitir que el médico se reserve para sí mismo
      }

      // Verificar si ya existe una cita para el mismo doctor en el mismo horario
      const citaExistente = await this.citaMedicaRepository.findOne({
        where: {
          id_doctor: citaMedicaDto.id_doctor,
          fecha_turno: citaMedicaDto.fecha_turno,
          estado: 'Pendiente',
        },
      });

      if (citaExistente) {
        throw new BadRequestException(
          'El horario ya está ocupado por otra cita.',
        );
      }

      // Crear una nueva cita médica
      const newCita = this.citaMedicaRepository.create({
        ...citaMedicaDto,
        estado: 'Pendiente', // Estado por defecto
      });

      // Guardar la nueva cita médica en la base de datos
      await this.citaMedicaRepository.save(newCita);

      const doctor = await this.doctorRepository.findOneBy({
        id_doctor: newCita.id_doctor,
      });

      const usuario = await this.usuariosRepository.findOneBy({
        id_usuario: doctor.id_usuario,
      });

      const notificacionDto: CreateNotificacionDto = {
        id_usuario: newCita.id_usuario,
        mensaje: `Su cita médica con ${usuario.genero === 'Masculino' ? 'el doctor' : 'la doctora'} ${usuario.apellido} ha sido agendada para el ${new Date(newCita.fecha_turno).toLocaleDateString()} a las ${new Date(newCita.fecha_turno).toLocaleTimeString().split(':').slice(0, 2).join(':')}.`,
      };

      await this.notificacionService.create(notificacionDto);

      const notificacionDoctorDto: CreateNotificacionDto = {
        id_usuario: usuario.id_usuario,
        mensaje: `Tiene una nueva cita agendada para el ${new Date(newCita.fecha_turno).toLocaleDateString()} a las ${new Date(newCita.fecha_turno).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      };

      await this.notificacionService.create(notificacionDoctorDto);

      return {
        statusCode: 201,
        msg: 'La cita médica ha sido creada con éxito',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async complete(id_cita: number) {
    try {
      // Verificar que la cita médica existe
      const cita = await this.citaMedicaRepository.findOneBy({ id_cita });
      if (!cita) {
        throw new BadRequestException('La cita médica no existe');
      }

      // Verificar que la cita no esté ya completada o cancelada
      if (cita.estado === 'Completada') {
        throw new BadRequestException('La cita ya está completada');
      }

      if (cita.estado === 'Cancelada') {
        throw new BadRequestException(
          'No se puede completar una cita cancelada',
        );
      }

      // Actualizar el estado de la cita médica a "Completada"
      cita.estado = 'Completada';
      await this.citaMedicaRepository.save(cita);

      return {
        statusCode: 200,
        msg: 'La cita médica ha sido completada con éxito',
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async cancel(id_cita: number) {
    try {
      // Verificar que la cita médica existe
      const cita = await this.citaMedicaRepository.findOneBy({ id_cita });
      if (!cita) {
        throw new BadRequestException('La cita médica no existe');
      }

      // Actualizar el estado de la cita médica a "Cancelada"
      cita.estado = 'Cancelada';
      await this.citaMedicaRepository.save(cita);

      const doctor = await this.doctorRepository.findOneBy({
        id_doctor: cita.id_doctor,
      });

      const usuario = await this.usuariosRepository.findOneBy({
        id_usuario: doctor.id_usuario,
      });

      const notificacionDto: CreateNotificacionDto = {
        id_usuario: cita.id_usuario,
        mensaje: `Su cita médica con ${usuario.genero === 'Masculino' ? 'el doctor' : 'la doctora'} ${usuario.apellido}, programada para el ${new Date(cita.fecha_turno).toLocaleDateString()} a las ${new Date(cita.fecha_turno).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ha sido cancelada.`,
      };

      await this.notificacionService.create(notificacionDto);

      const notificacionDoctorDto: CreateNotificacionDto = {
        id_usuario: usuario.id_usuario,
        mensaje: `La cita médica programada para el ${new Date(cita.fecha_turno).toLocaleDateString()} a las ${new Date(cita.fecha_turno).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ha sido cancelada.`,
      };

      await this.notificacionService.create(notificacionDoctorDto);

      return {
        statusCode: 200,
        msg: 'La cita médica ha sido cancelada con éxito',
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async findAll() {
    try {
      const citas = await this.citaMedicaRepository.find();

      if (citas.length === 0) {
        throw new BadRequestException('No existen citas médicas');
      }

      const doctores = await this.doctorRepository.find();
      const especialidades = await this.especialidadRepository.find();
      const usuarios = await this.usuariosRepository.find();

      const citasConDetalles = citas.map((cita) => {
        const doctor = doctores.find((doc) => doc.id_doctor === cita.id_doctor);
        if (!doctor) {
          throw new BadRequestException(
            `No se encontró el doctor con id ${cita.id_doctor}`,
          );
        }

        const especialidad = especialidades.find(
          (esp) => esp.id_especialidad === doctor.id_especialidad,
        );
        if (!especialidad) {
          throw new BadRequestException(
            `No se encontró la especialidad con id ${doctor.id_especialidad}`,
          );
        }

        const usuario = usuarios.find(
          (us) => us.id_usuario === doctor.id_usuario,
        );

        const paciente = usuarios.find(
          (us) => us.id_usuario === cita.id_usuario,
        );

        return {
          ...cita,
          nombrePaciente: paciente?.nombre + ' ' + paciente?.apellido,
          nombreDoctor: usuario.nombre,
          apellidoDoctor: usuario.apellido,
          especialidad: especialidad.nombre_especialidad,
        };
      });

      return citasConDetalles;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async findByUserId(id_usuario: number) {
    try {
      // Buscar todas las citas del usuario
      const citas = await this.citaMedicaRepository.find({
        where: { id_usuario },
      });

      if (citas.length === 0) {
        throw new BadRequestException('El usuario no tiene citas médicas');
      }
      const usuarios = await this.usuariosRepository.find();
      const doctores = await this.doctorRepository.find();
      const especialidades = await this.especialidadRepository.find();

      const citasConDetalles = citas.map((cita) => {
        const doctor = doctores.find((doc) => doc.id_doctor === cita.id_doctor);
        if (!doctor) {
          throw new BadRequestException(
            `No se encontró el doctor con id ${cita.id_doctor}`,
          );
        }

        const especialidad = especialidades.find(
          (esp) => esp.id_especialidad === doctor.id_especialidad,
        );

        const usuario = usuarios.find(
          (us) => us.id_usuario === doctor.id_usuario,
        );
        if (!especialidad) {
          throw new BadRequestException(
            `No se encontró la especialidad con id ${doctor.id_especialidad}`,
          );
        }

        return {
          ...cita,
          nombreDoctor: usuario.nombre,
          apellidoDoctor: usuario.apellido,
          generoDoctor: usuario.genero,
          especialidad: especialidad.nombre_especialidad,
        };
      });

      return citasConDetalles;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async findByDoctorId(id_doctor: number) {
    try {
      // Buscar todas las citas del doctor
      const citas = await this.citaMedicaRepository.find({
        where: { id_doctor },
      });

      const doc = await this.doctorRepository.findOneBy({ id_doctor });

      if (citas.length === 0) {
        throw new BadRequestException('El doctor no tiene citas médicas');
      }

      // Obtener todos los usuarios, doctores y especialidades
      const usuarios = await this.usuariosRepository.find();
      const doctores = await this.doctorRepository.find();
      const especialidades = await this.especialidadRepository.find();

      // Mapear cada cita para agregar detalles adicionales
      const citasConDetalles = citas.map((cita) => {
        // Encontrar al usuario (paciente) asociado con la cita
        if (cita.id_usuario == doc.id_usuario) return null;
        const usuario = usuarios.find(
          (us) => us.id_usuario === cita.id_usuario,
        );
        if (!usuario) {
          throw new BadRequestException(
            `No se encontró el usuario con id ${cita.id_usuario}`,
          );
        }

        // Encontrar al doctor asociado con la cita (aunque ya tenemos el id_doctor, podemos usar esto para obtener detalles adicionales)
        const doctor = doctores.find((doc) => doc.id_doctor === cita.id_doctor);
        if (!doctor) {
          throw new BadRequestException(
            `No se encontró el doctor con id ${cita.id_doctor}`,
          );
        }

        // Encontrar la especialidad del doctor
        const especialidad = especialidades.find(
          (esp) => esp.id_especialidad === doctor.id_especialidad,
        );
        if (!especialidad) {
          throw new BadRequestException(
            `No se encontró la especialidad con id ${doctor.id_especialidad}`,
          );
        }

        // Devolver la cita con los detalles adicionales del paciente (usuario) y el doctor
        return {
          ...cita,
          nombrePaciente: usuario.nombre,
          apellidoPaciente: usuario.apellido,
        };
      });

      const citasFiltradas = citasConDetalles.filter((cita) => cita !== null);

      return citasFiltradas;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
