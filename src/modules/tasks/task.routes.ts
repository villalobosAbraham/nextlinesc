import { Router } from 'express'
import { createTask, deleteTask, getTaskById, getTasks, replaceTask, updateTask } from './task.controller'

const router = Router()

router.get('/', getTasks)
router.get('/:id', getTaskById)

router.post('/', createTask)

router.patch('/:id', updateTask)

router.put('/:id', replaceTask)

router.delete('/:id', deleteTask)

export default router