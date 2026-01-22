import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  action!: string   // CREATE, UPDATE, DELETE

  @Column()
  entity!: string   // Task

  @Column()
  entityId!: number // ID de la tarea

  @Column({ nullable: true })
  description?: string

  @CreateDateColumn()
  createdAt!: Date
}