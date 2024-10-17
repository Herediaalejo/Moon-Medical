import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'int' })
  id_usuario: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({ type: 'varchar', length: 50 })
  apellido: string;

  @Column({ type: 'enum', enum: ['Masculino', 'Femenino', 'Otro'] })
  genero: 'Masculino' | 'Femenino' | 'Otro';

  @Column({ type: 'varchar', unique: true, length: 20 })
  documento: string;

  @Column({ type: 'date' })
  fecha_nacimiento: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  direccion: string;

  @Column({ type: 'varchar', unique: true, length: 100 })
  correo_electronico: string;

  @Column({ type: 'varchar', unique: true, length: 50 })
  usuario: string;

  @Column({ type: 'varchar' })
  contrasena: string;

  @Column({ type: 'enum', enum: ['admin', 'client', 'doctor'] })
  rol: 'admin' | 'client' | 'doctor';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  fecha_actualizacion: Date;
}
