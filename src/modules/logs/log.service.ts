import { AppDataSource } from '../../data-source'
import { Log } from './log.entity'



/**
 * Crear un registro de log
 */
export const createLog = async ( action: string,entity: string, entityId: number, userId:number, description?: string) => {
  const repo = AppDataSource.getRepository(Log)

  const log = repo.create({
    action,
    entity,
    entityId,
    user: { id: userId },
    description
  })

  await repo.save(log)
}
