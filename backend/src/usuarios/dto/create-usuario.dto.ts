import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString()
  apellido: string;

  @IsNotEmpty({ message: 'El género es obligatorio' })
  @IsEnum(['Masculino', 'Femenino', 'Otro'], {
    message: 'El género debe ser Masculino, Femenino o Otro',
  })
  genero: 'Masculino' | 'Femenino' | 'Otro';

  @IsNotEmpty({ message: 'El documento es obligatorio' })
  @IsString()
  documento: string;

  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  @IsDateString()
  fecha_nacimiento: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  correo_electronico: string;

  @IsNotEmpty({ message: 'El usuario es obligatorio' })
  @IsString()
  usuario: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  contrasena: string;

  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsEnum(['admin', 'client', 'doctor'], {
    message: 'El rol debe ser admin, client, o doctor',
  })
  rol: 'admin' | 'client' | 'doctor';
}
