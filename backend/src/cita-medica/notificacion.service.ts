import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { Repository } from 'typeorm';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';

@Injectable()
export class NotificacionService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
  ) {}

  public async create(createNotificacionDto: CreateNotificacionDto) {
    try {
      const nuevaNotificacion = this.notificacionRepository.create(
        createNotificacionDto,
      );
      await this.notificacionRepository.save(nuevaNotificacion);
      return nuevaNotificacion; // Devuelve la notificación creada o un mensaje de éxito
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async findAll() {
    return await this.notificacionRepository.find(); // Devuelve todas las notificaciones
  }

  public async findByUsuario(id_usuario: number) {
    try {
      const notificaciones = await this.notificacionRepository.findBy({
        id_usuario: id_usuario,
      });

      console.log(notificaciones);

      if (notificaciones.length === 0) {
        throw new NotFoundException(
          'No se encontraron notificaciones para este usuario.',
        );
      }

      return notificaciones; // Devuelve las notificaciones encontradas
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  public async updateNotificaciones(ids: number[], leida: boolean) {
    try {
      for (const id of ids) {
        const notificacion = await this.notificacionRepository.findOneBy({
          id_notificacion: id,
        });

        if (!notificacion) {
          throw new NotFoundException(
            `Notificación con ID ${id} no encontrada.`,
          );
        }

        // Actualizar el estado de la notificación
        notificacion.leida = leida;
        await this.notificacionRepository.save(notificacion);
      }

      return {
        statusCode: 200,
        msg: 'Las notificaciones se actualizaron correctamente.',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async deleteNotificacion(id: number) {
    try {
      const notificacion = await this.notificacionRepository.findOneBy({
        id_notificacion: id,
      });

      if (!notificacion) {
        throw new NotFoundException(`Notificación con ID ${id} no encontrada.`);
      }

      // Cambiar el estado de la notificación a eliminada
      notificacion.eliminada = true;
      await this.notificacionRepository.save(notificacion);

      return {
        statusCode: 200,
        msg: 'Notificación eliminada correctamente.',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
