import { IsNotEmpty } from 'class-validator';

export class CreateNotificacionDto {
  @IsNotEmpty()
  id_usuario: number;

  @IsNotEmpty()
  mensaje: string;
}
