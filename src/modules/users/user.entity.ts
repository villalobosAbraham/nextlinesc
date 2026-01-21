import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    usuario!: string;

    @Column()
    password!: string;

    @Column()
    activo!: boolean;
}