import { CreateCitaMedicaDto } from './dto/create-cita-medica.dto';
import { CitaMedica } from './entities/cita-medica.entity'; // Asegúrate de tener la entidad importada
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EspecialidadMedica } from 'src/usuarios/entities/especialidad_medica.entity';
import { Doctor } from 'src/usuarios/entities/doctor.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

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

  public async create(citaMedicaDto: CreateCitaMedicaDto) {
    try {
      if (!citaMedicaDto) {
        throw new BadRequestException(
          'Debe proporcionar los datos de la cita médica',
        );
      }

      // Verificar campos obligatorios
      if (
        !citaMedicaDto.id_usuario ||
        !citaMedicaDto.id_especialidad ||
        !citaMedicaDto.id_doctor ||
        !citaMedicaDto.fecha_turno ||
        !citaMedicaDto.costo
      ) {
        throw new BadRequestException(
          'Los campos "id_usuario", "id_especialidad", "id_doctor", "fecha_turno", y "costo" son obligatorios',
        );
      }

      // Crear una nueva cita médica
      const newCita = this.citaMedicaRepository.create({
        ...citaMedicaDto,
        estado: 'Pendiente', // Estado por defecto
      });

      // Guardar la nueva cita médica en la base de datos
      await this.citaMedicaRepository.save(newCita);

      return {
        statusCode: 201,
        msg: 'La cita médica ha sido creada con éxito',
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
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

  public async findByUser(id_usuario: number) {
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

  public async findByDoctor(id_doctor: number) {
    try {
      const citas = await this.citaMedicaRepository.find({
        where: { id_doctor },
      });

      if (citas.length === 0) {
        throw new BadRequestException('El doctor no tiene citas médicas');
      }

      return citas;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
