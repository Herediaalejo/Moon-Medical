import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  @InjectRepository(Usuario)
  private usuariosRepository: Repository<Usuario>;

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
      console.log(usuario);

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
        console.log(existingUserByUsername);
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
      console.log(usuario);
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
      console.log(newUsuario);

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
