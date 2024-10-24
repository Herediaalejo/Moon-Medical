import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';

describe('AuthController (inicio de sesión)', () => {
  let controller: AuthController;
  let service: AuthService;

  class LoginDto {
    usuario: string;
    contrasena: string;
  }

  // Mock del servicio de autenticación
  const mockAuthService = {
    login: jest.fn(), // Simula la función de inicio de sesión
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService, // Utiliza el mock del servicio
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController); // Obtiene la instancia del controlador
    service = module.get<AuthService>(AuthService); // Obtiene la instancia del servicio
  });

  // Prueba para el inicio de sesión exitoso
  it('debería permitir que un usuario registrado inicie sesión exitosamente', async () => {
    const loginData: LoginDto = {
      usuario: 'alejo',
      contrasena: '13112002',
    };

    // Simula un inicio de sesión exitoso
    mockAuthService.login.mockResolvedValue({
      access_token: 'mocked_token', // Retorna un token simulado
    });

    const result = await controller.login(loginData); // Llama al método de inicio de sesión
    expect(result).toEqual({ access_token: 'mocked_token' }); // Verifica que se devuelva el token
    expect(mockAuthService.login).toHaveBeenCalledWith(
      loginData.usuario,
      loginData.contrasena,
    ); // Verifica que se llamó al servicio con las credenciales correctas
  });
});
