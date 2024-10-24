import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from 'src/usuarios/usuarios.controller';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import { ConflictException } from '@nestjs/common';

describe('UsuariosController', () => {
  let usuariosController: UsuariosController;
  let usuariosService: UsuariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
          useValue: {
            crearUsuario: jest.fn(),
          },
        },
      ],
    }).compile();

    usuariosController = module.get<UsuariosController>(UsuariosController);
    usuariosService = module.get<UsuariosService>(UsuariosService);
  });

  describe('Registrar nuevo usuario', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      const nuevoUsuario: CreateUsuarioDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        genero: 'Masculino',
        documento: '12345678',
        fecha_nacimiento: '1990-01-01',
        telefono: '555-1234',
        direccion: 'Calle Falsa 123',
        correo_electronico: 'juan@example.com',
        usuario: 'juanperez',
        contrasena: 'contraseña123',
        rol: 'client',
      };

      // Simular que el servicio devuelve el nuevo usuario al ser creado
      usuariosService.create = jest.fn().mockResolvedValue(nuevoUsuario);

      // Llamar al método registrar y verificar el resultado
      const resultado = await usuariosController.create(nuevoUsuario);
      expect(resultado).toEqual(nuevoUsuario);
      expect(usuariosService.create).toHaveBeenCalledWith(nuevoUsuario);
    });
  });
});
