import "reflect-metadata";
import { DataSource } from "typeorm";
// import { User } from "./entity/User";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.MYSQLHOST,
    port: parseInt(process.env?.MYSQLPORT || "3306"),
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
})