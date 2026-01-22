import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm'
import { User } from '../users/user.entity'

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

  @ManyToOne(() => User)
  user!: User

  @Column({ nullable: true })
  description?: string

  @CreateDateColumn()
  createdAt!: Date
}