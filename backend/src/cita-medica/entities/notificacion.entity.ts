import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'notificacion' })
export class Notificacion {
  @PrimaryGeneratedColumn({ type: 'int' })
  id_notificacion: number;

  @Column({ type: 'int' })
  id_usuario: number;

  @Column({ type: 'int', nullable: true })
  id_cita: number | null;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha_notificacion: Date;

  @Column({ type: 'boolean', default: false })
  leida: boolean;

  @Column({ type: 'boolean', default: false })
  eliminada: boolean;
}
