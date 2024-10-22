import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'doctor' })
export class Doctor {
  @PrimaryGeneratedColumn({ type: 'int' })
  id_doctor: number;

  @Column({ type: 'int' })
  id_usuario: number;

  @Column({ type: 'int' })
  id_especialidad: number;

  @Column({ type: 'time' })
  horario_inicio: string;

  @Column({ type: 'time' })
  horario_fin: string;

  @Column({
    type: 'set',
    enum: [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ],
    default: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
  })
  dias_laborales: string[];

  @Column({ type: 'boolean', default: true })
  activo: boolean;
}
