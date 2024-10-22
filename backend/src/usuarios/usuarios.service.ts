import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { Doctor } from './entities/doctor.entity';
import { EspecialidadMedica } from './entities/especialidad_medica.entity';
import { CitaMedica } from 'src/cita-medica/entities/cita-medica.entity';

@Injectable()
export class UsuariosService {
  @InjectRepository(Usuario)
  private usuariosRepository: Repository<Usuario>;

  @InjectRepository(Doctor)
  private readonly doctorRepository: Repository<Doctor>;

  @InjectRepository(EspecialidadMedica)
  private readonly especialidadRepository: Repository<EspecialidadMedica>;

  @InjectRepository(CitaMedica)
  private readonly citaMedicaRepository: Repository<CitaMedica>;

  public async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  public async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public async create(usuario: CreateUsuarioDto) {
    try {
      if (!usuario) {
        throw new BadRequestException(
          'Debe proporcionar los datos del usuario',
        );
      }

      // Verificar campos obligatorios
      if (
        !usuario.usuario ||
        !usuario.contrasena ||
        !usuario.rol ||
        !usuario.correo_electronico
      ) {
        throw new BadRequestException(
          'Los campos "usuario", "contrasena", "rol" y "correo_electronico" son obligatorios',
        );
      }

      // Verificar si ya existe un usuario con el mismo nombre de usuario
      const existingUserByUsername = await this.usuariosRepository.findOneBy({
        usuario: usuario.usuario,
      });
      if (existingUserByUsername) {
        throw new BadRequestException(
          'Ya existe un usuario con ese nombre de usuario',
        );
      }

      // Verificar si ya existe un usuario con el mismo email
      const existingUserByEmail = await this.usuariosRepository.findOneBy({
        correo_electronico: usuario.correo_electronico,
      });
      if (existingUserByEmail) {
        throw new BadRequestException('Ya existe un usuario con ese email');
      }

      const hashedPassword = await this.hashPassword(usuario.contrasena);
      const newUsuario = this.usuariosRepository.create({
        ...usuario,
        contrasena: hashedPassword,
      });

      await this.usuariosRepository.save(newUsuario);
      return {
        statusCode: 201,
        msg: 'El usuario ha sido creado con éxito',
        id_usuario: newUsuario.id_usuario,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async createDoctor(doctorDto: CreateDoctorDto) {
    try {
      if (!doctorDto) {
        throw new BadRequestException('Debe proporcionar los datos del doctor');
      }

      // Verificar campos obligatorios
      if (
        !doctorDto.id_usuario ||
        !doctorDto.id_especialidad ||
        !doctorDto.horario_inicio ||
        !doctorDto.horario_fin ||
        !doctorDto.dias_laborales
      ) {
        throw new BadRequestException(
          'Los campos "id_usuario", "id_especialidad", "horario_inicio", "horario_fin" y "dias_laborales" son obligatorios',
        );
      }

      // Crear un nuevo doctor con los datos del DTO
      const newDoctor = this.doctorRepository.create({
        id_usuario: doctorDto.id_usuario,
        id_especialidad: doctorDto.id_especialidad,
        horario_inicio: doctorDto.horario_inicio,
        horario_fin: doctorDto.horario_fin,
        dias_laborales: doctorDto.dias_laborales,
        activo: doctorDto.activo ?? true, // Si no se proporciona, se pone como true
      });

      // Guardar el nuevo doctor en la base de datos
      await this.doctorRepository.save(newDoctor);

      return {
        statusCode: 201,
        msg: 'El doctor ha sido creado con éxito',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async findAll() {
    try {
      const usuarios = await this.usuariosRepository.find();
      if (usuarios.length === 0) {
        throw new BadRequestException('No existen usuarios');
      }
      return usuarios;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async findAllDoctores() {
    try {
      // Obtener doctores, usuarios y especialidades
      const doctores = await this.doctorRepository.find();
      const usuarios = await this.usuariosRepository.find();
      const especialidades = await this.especialidadRepository.find();

      // Obtener citas médicas que no están canceladas
      const citasMedicas = await this.citaMedicaRepository.find({
        where: {
          estado: Not('Cancelada'),
        },
      });

      // Procesar la data para agregar turnos ocupados por cada doctor
      const data = doctores.map((doctor) => {
        const usuario = usuarios.find(
          (u) => u.id_usuario === doctor.id_usuario,
        );
        const especialidad = especialidades.find(
          (e) => e.id_especialidad === doctor.id_especialidad,
        );

        const turnosOcupados = citasMedicas
          .filter((cita) => cita.id_doctor === doctor.id_doctor)
          .map((cita) => {
            const paciente = usuarios.find(
              (u) => u.id_usuario === cita.id_usuario,
            );

            return {
              fecha_turno: cita.fecha_turno,
              id_usuario: cita.id_usuario,
              nombre_paciente: paciente ? paciente.nombre : 'Desconocido',
              apellido_paciente: paciente ? paciente.apellido : 'Desconocido',
              estado: cita.estado,
            };
          });

        return {
          id_doctor: doctor.id_doctor,
          id_especialidad: doctor.id_especialidad,
          especialidad: especialidad?.nombre_especialidad,
          usuario: usuario?.usuario,
          nombre: usuario?.nombre,
          apellido: usuario?.apellido,
          horario_inicio: doctor.horario_inicio,
          horario_fin: doctor.horario_fin,
          dias_laborales: doctor.dias_laborales,
          activo: doctor.activo,
          turnosOcupados,
        };
      });

      if (data.length === 0) {
        throw new BadRequestException('No existen doctores');
      }
      return data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async findAllEspecialidades() {
    try {
      const especialidades = await this.especialidadRepository.find();
      if (especialidades.length === 0) {
        throw new BadRequestException('No existen especialidades');
      }
      return especialidades;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async findOne(id: number) {
    try {
      const usuario = await this.usuariosRepository.findOneBy({
        id_usuario: id,
      });
      if (!usuario) {
        throw new BadRequestException('El usuario no existe');
      }
      return usuario;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async checkMail(data: { correo_electronico: string }) {
    try {
      const { correo_electronico } = data;
      const usuario = await this.usuariosRepository.findOneBy({
        correo_electronico: correo_electronico,
      });
      if (!usuario) {
        throw new BadRequestException('El usuario no existe');
      }
      return {
        statusCode: 200,
        msg: 'El correo electronico pertenece a un usuario registrado',
        id_usuario: usuario.id_usuario,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async findOneByUsername(username: string) {
    try {
      const usuario = await this.usuariosRepository.findOneBy({
        usuario: username,
      });
      if (!usuario) {
        throw new BadRequestException('El usuario no existe');
      }
      return usuario;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async update(id: number, newUsuario: UpdateUsuarioDto) {
    try {
      const currentUsuario = await this.findOne(id);

      if (!newUsuario) {
        throw new BadRequestException(
          'Debe proporcionar los datos a actualizar',
        );
      }

      if (newUsuario.contrasena) {
        newUsuario.contrasena = await this.hashPassword(newUsuario.contrasena);
      } else {
        newUsuario.contrasena = currentUsuario.contrasena; // Mantener la contraseña actual si no se proporciona una nueva
      }

      await this.usuariosRepository.update(id, {
        ...currentUsuario, // Mantener los campos actuales que no se actualizan
        ...newUsuario,
      });
      return {
        statusCode: 200,
        msg: 'El usuario se actualizó adecuadamente',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async remove(id: number) {
    try {
      await this.findOne(id); // Verificar que el usuario existe antes de eliminarlo
      await this.usuariosRepository.delete(id);
      return {
        statusCode: 200,
        msg: 'El usuario se eliminó con éxito',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
