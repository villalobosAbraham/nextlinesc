import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./modules/users/user.entity";
import { Status } from "./modules/status/status.entity";
import { Task } from "./modules/tasks/task.entity";
import { Log } from "./modules/logs/log.entity";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.MYSQLHOST || 'localhost',
    port: parseInt(process.env?.MYSQLPORT || "3306"),
    username: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'pruebanextline',
    synchronize: true, // solo en desarrollo
    logging: false,
    entities: [User, Status, Task, Log],
})