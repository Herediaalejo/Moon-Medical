import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateDoctorDto {
  @IsNotEmpty({ message: 'El id del usuario es obligatorio' })
  @IsInt({ message: 'El id del usuario debe ser un número entero' })
  id_usuario: number;

  @IsNotEmpty({ message: 'El id de la especialidad es obligatorio' })
  @IsInt({ message: 'El id de la especialidad debe ser un número entero' })
  id_especialidad: number;

  @IsNotEmpty({ message: 'El horario de inicio es obligatorio' })
  @IsDateString(
    {},
    { message: 'El horario de inicio debe tener el formato HH:MM:SS' },
  )
  horario_inicio: string;

  @IsNotEmpty({ message: 'El horario de fin es obligatorio' })
  @IsDateString(
    {},
    { message: 'El horario de fin debe tener el formato HH:MM:SS' },
  )
  horario_fin: string;

  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un día laboral' })
  @IsEnum(
    ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    {
      each: true,
      message:
        'Los días laborales deben ser uno de los siguientes: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo',
    },
  )
  dias_laborales: string[];

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un valor booleano' })
  activo?: boolean;
}
