import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cita_medica' })
export class CitaMedica {
  @PrimaryGeneratedColumn({ type: 'int' })
  id_cita: number;

  @Column({ type: 'int' })
  id_especialidad: number;

  @Column({ type: 'int' })
  id_usuario: number;

  @Column({ type: 'int' })
  id_doctor: number;

  @Column({ type: 'datetime' })
  fecha_turno: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costo: number;

  @Column({
    type: 'enum',
    enum: ['Pendiente', 'Cancelada', 'Completada'],
    default: 'Pendiente',
  })
  estado: 'Pendiente' | 'Cancelada' | 'Completada';
}
