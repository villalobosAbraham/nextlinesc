import { Request, Response } from 'express'
import { AppDataSource } from '../../data-source'
import { Task } from './task.entity'
import { User } from '../users/user.entity'
import { Status } from '../status/status.entity'
import { createLog } from '../logs/log.service'

/**
 * Crear una nueva tarea
 * @route POST /tasks
 * @header {number} x-user-id - ID del usuario que crea la tarea
 * @returns Tarea creada
 * @
 */
export const createTask = async (req: Request, res: Response) => {
  try {
    let {
      title,
      description,
      dueDate,
      coments,
      statusId,
      isPublic = true
    } = req.body

    let userId = Number(req.header('x-user-id'))

    const taskRepo = AppDataSource.getRepository(Task)
    const userRepo = AppDataSource.getRepository(User)
    const statusRepo = AppDataSource.getRepository(Status)

    // Validación mínima (bien vista en la prueba)
    if (!title || !description || !dueDate || !statusId || isNaN(Date.parse(dueDate)) || isNaN(userId)) {
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
      user: user ?? undefined,
      isPublic
    })

    let savedTask = await taskRepo.save(task)

    await createLog('CREATE','Task', savedTask.id, userId, `Tarea creada: ${savedTask.title}`)

    res.status(201).json(savedTask)

  } catch (error) {
    res.status(500).json({ message: 'Error al crear la tarea' })
  }
}

/**
 * Obtener informacion breve de todas las tareas (paginado)
 * @route GET /tasks
 * @header {number} x-user-id - ID del usuario que realiza la consulta
 * @query {number} page - Página actual (default 1)
 * @query {number} limit - Registros por página (default 10)
 * @returns Lista paginada de tareas
 */
export const getTasks = async (req: Request, res: Response) => {
  let userId = Number(req.header('x-user-id'))

  let page = Number(req.query.page) || 1
  let limit = Number(req.query.limit) || 10
  let skip = (page - 1) * limit

  const repo = AppDataSource.getRepository(Task)

  let [tasks, total] = await repo
    .createQueryBuilder('task')
    .leftJoinAndSelect('task.status', 'status')
    .leftJoinAndSelect('task.user', 'user')
    .where('task.isDeleted = false')
    .andWhere(
      '(task.isPublic = true OR task.user = :userId)',
      { userId }
    )
    .select([
      'task.id',
      'task.title',
      'task.dueDate',
      'status.name',
      'user.usuario'
    ])
    .skip(skip)
    .take(limit)
    .getManyAndCount()

  res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: tasks
  })
}


/**
 * Obtener toda la información de una tarea por su ID
 * @route GET /tasks/:id
 * @header {number} x-user-id - ID del usuario que realiza la consulta
 * @returns Tarea con toda su información
 */
export const getTaskById = async (req: Request, res: Response) => {
  let { id } = req.params
  let repo = AppDataSource.getRepository(Task)
  // let task = await repo.findOne({
  // where: { id: Number(id) },
  // relations: {
  //   status: true,
  //   user: true
  //   }
  // })

  let userId = Number(req.header('x-user-id'))

  let task = await repo
    .createQueryBuilder('task')
    .leftJoinAndSelect('task.status', 'status')
    .leftJoinAndSelect('task.user', 'user')
    .where('task.isDeleted = false')
    .andWhere(
      '(task.isPublic = true OR task.user = :userId)',
      { userId }
    ).andWhere('task.id = :id', { id: Number(id) })
    .getOne()


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

/**
 * Reemplazar toda la información de una tarea por su ID
 * @route PUT /tasks/:id
 * @returns Tarea actualizada completa
 */
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

    let userId = Number(req.header('x-user-id'))

    await applyTaskUpdates(task, req.body)
    await taskRepo.save(task)

    await createLog(
      'UPDATE',
      'Task',
      task.id,
      userId,
      'Tarea actualizada'
    )

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

/**
 * Reemplazar parte de la información de una tarea por su ID
 * @route PATCH /tasks/:id
 * @returns Tarea actualizada parcialmente
 */
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

    let userId = Number(req.header('x-user-id'))

    await createLog(
      'UPDATE',
      'Task',
      task?.id || 0,
      userId,
      'Tarea actualizada'
    )
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

/** * Eliminar una tarea por su ID
 * @route DELETE /tasks/:id
 * @returns No content
 */
export const deleteTask = async (req: Request, res: Response) => {
  try {
    let { id } = req.params
    const repo = AppDataSource.getRepository(Task)

    let task = await repo.findOneBy({ id: Number(id) })

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' })
    }

    task.isDeleted = true
    await repo.save(task)

    let userId = Number(req.header('x-user-id'))
    
    await createLog(
      'DELETE',
      'Task',
      task.id,
      userId,
      `Tarea eliminada`
    )

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la tarea' })
  }
}
