import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'especialidad_medica' })
export class EspecialidadMedica {
  @PrimaryGeneratedColumn({ type: 'int' })
  id_especialidad: number;

  @Column({ type: 'varchar', length: 100 })
  nombre_especialidad: string;
}
