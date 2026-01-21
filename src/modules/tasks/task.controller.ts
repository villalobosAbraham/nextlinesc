import { Request, Response } from 'express'
import { AppDataSource } from '../../data-source'
import { Task } from './task.entity'
import { User } from '../users/user.entity'
import { Status } from '../status/status.entity'

export const createTask = async (req: Request, res: Response) => {
  try {
    let {
      title,
      description,
      dueDate,
      coments,
      userId,
      statusId
    } = req.body

    const taskRepo = AppDataSource.getRepository(Task)
    const userRepo = AppDataSource.getRepository(User)
    const statusRepo = AppDataSource.getRepository(Status)

    // Validación mínima (bien vista en la prueba)
    if (!title || !description || !dueDate || !statusId) {
      return res.status(400).json({
        message: 'Faltan campos obligatorios'
      })
    }

    let status = await statusRepo.findOneBy({ id: statusId })
    if (!status) {
      return res.status(404).json({ message: 'Status no existe' })
    }

    let user = null
    if (userId) {
      user = await userRepo.findOneBy({ id: userId })
      if (!user) {
        return res.status(404).json({ message: 'Usuario no existe' })
      }
    }

    let task = taskRepo.create({
      title,
      description,
      dueDate,
      coments,
      status,
      user: user ?? undefined
    })

    await taskRepo.save(task)

    res.status(201).json(task)

  } catch (error) {
    res.status(500).json({ message: 'Error al crear la tarea' })
  }
}

export const getTasks = async (req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(Task)
  let tasks = await repo.find({
    select: {
      title: true,
      dueDate: true,
      user: {
        usuario: true
      },
      status: {
        name: true
      },
    },
    relations: {
      status: true,
      user: true
    }
  })
  res.status(200).json(tasks)
}

export const getTaskById = async (req: Request, res: Response) => {
  let { id } = req.params
  let repo = AppDataSource.getRepository(Task)
  let task = await repo.findOne({
  where: { id: Number(id) },
  relations: {
    status: true,
    user: true
    }
  })
  if (!task) {
    return res.status(404).json({ message: 'Tarea no encontrada' })
  }
  res.status(200).json(task)
}

const applyTaskUpdates = async (task: Task, data: any) => {
  const statusRepo = AppDataSource.getRepository(Status)
  const userRepo = AppDataSource.getRepository(User)

  if (data.title !== undefined) task.title = data.title
  if (data.description !== undefined) task.description = data.description
  if (data.dueDate !== undefined) task.dueDate = data.dueDate
  if (data.coments !== undefined) task.coments = data.coments

  if (data.statusId !== undefined) {
    let status = await statusRepo.findOneBy({ id: data.statusId })
    if (!status) throw new Error('STATUS_NOT_FOUND')
    task.status = status
  }

  if (data.userId !== undefined) {
    let user = await userRepo.findOneBy({ id: data.userId })
    if (!user) throw new Error('USER_NOT_FOUND')
    task.user = user
  }
}

export const replaceTask = async (req: Request, res: Response) => {
  try {
    let requiredFields = ['title', 'description', 'dueDate', 'statusId', 'userId']
    for (const field of requiredFields) {
      if (req.body[field] === undefined) {
        return res.status(400).json({
          message: `Campo obligatorio faltante: ${field}`
        })
      }
    }

    const taskRepo = AppDataSource.getRepository(Task)
    let task = await taskRepo.findOneBy({ id: Number(req.params.id) })

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' })
    }

    await applyTaskUpdates(task, req.body)
    await taskRepo.save(task)

    res.json(task)
  } catch (error: any) {
    if (error.message === 'STATUS_NOT_FOUND') {
      return res.status(404).json({ message: 'Status no existe' })
    }
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'Usuario no existe' })
    }
    res.status(500).json({ message: 'Error al actualizar tarea' })
  }
}

export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskRepo = AppDataSource.getRepository(Task)
    let task = await taskRepo.findOneBy({ id: Number(req.params.id) })

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' })
    }

    await applyTaskUpdates(task, req.body)
    await taskRepo.save(task)

    task = await taskRepo.findOne({
      where: { id: task.id },
      relations: {
        user: true,
        status: true
      }
    })
    res.json(task)
  } catch (error: any) {
    if (error.message === 'STATUS_NOT_FOUND') {
      return res.status(404).json({ message: 'Status no existe' })
    }
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'Usuario no existe' })
    }
    res.status(500).json({ message: 'Error al actualizar tarea' })
  }
}

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const repo = AppDataSource.getRepository(Task)

    const task = await repo.findOneBy({ id: Number(id) })

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' })
    }

    await repo.remove(task)

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la tarea' })
  }
}
