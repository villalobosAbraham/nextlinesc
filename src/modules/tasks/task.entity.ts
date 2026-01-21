import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm'
import { User } from '../users/user.entity'
import { Status } from '../status/status.entity'

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  title!: string

  @Column()
  description!: string

  @Column()
  dueDate!: Date

  @Column()
  coments!: string

  @ManyToOne(() => User)
  user!: User

  @ManyToOne(() => Status)
  status!: Status
}