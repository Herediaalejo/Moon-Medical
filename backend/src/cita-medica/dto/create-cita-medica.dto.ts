import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsDecimal,
} from 'class-validator';

export class CreateCitaMedicaDto {
  @IsOptional()
  @IsInt({ message: 'El id del usuario debe ser un número entero' })
  id_usuario: number;

  @IsNotEmpty({ message: 'El id de la especialidad es obligatorio' })
  @IsInt({ message: 'El id de la especialidad debe ser un número entero' })
  id_especialidad: number;

  @IsNotEmpty({ message: 'El id del doctor es obligatorio' })
  @IsInt({ message: 'El id del doctor debe ser un número entero' })
  id_doctor: number;

  @IsNotEmpty({ message: 'La fecha y hora del turno es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha y hora del turno debe tener el formato correcto' },
  )
  fecha_turno: Date;

  @IsNotEmpty({ message: 'El costo es obligatorio' })
  @IsDecimal(
    { decimal_digits: '2' },
    { message: 'El costo debe ser un número decimal con dos dígitos' },
  )
  costo: number;

  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsEnum(['Pendiente', 'Cancelada', 'Completada'], {
    message:
      'El estado debe ser uno de los siguientes: Pendiente, Cancelada, Completada',
  })
  estado: 'Pendiente' | 'Cancelada' | 'Completada';
}
