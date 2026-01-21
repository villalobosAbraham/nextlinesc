import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

export const createUser = async (req: Request, res: Response) => {
    const userRepository = AppDataSource.getRepository(User);
    const newUser = userRepository.create(req.body);
    const result = await userRepository.save(newUser);
    return res.status(201).json(result);
}