import 'reflect-metadata'
import 'dotenv/config'
import express from 'express'
import { AppDataSource } from './data-source'
import userRoutes from './modules/users/user.routes'
import statusRoutes from './modules/status/status.routes'
import taskRoutes from './modules/tasks/task.routes'


const PORT = 3000

const app = express()
app.use(express.json())


app.use('/users', userRoutes)
app.use('/tasks', taskRoutes)
app.use('/status', statusRoutes)

AppDataSource.initialize()
  .then(() => {
    console.log("📦 Base de datos conectada")

    app.listen(PORT, () => {
      console.log(`🚀 Servidor en http://localhost:${PORT}`)
    })
  })
  .catch((error) => console.log(error))
