# Task Management API

API REST desarrollada como prueba técnica de backend para la gestión de tareas, usuarios y estados, implementando reglas de visibilidad, 
bitácora de movimientos y eliminación lógica (soft delete).

---

## 🚀 Stack Tecnológico

* Node.js
* Express
* TypeScript
* TypeORM
* MySQL

---

## ⚙️ Instalación y ejecución

### 1️⃣ Instalar dependencias

```
npm install
```

### 2️⃣ Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```
PORT = 3000

MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=tu_password
MYSQLDATABASE=pruebanextline
```

### 3️⃣ Ejecutar el proyecto

```bash
npm run dev
```

---

## 📌 Convenciones importantes

### Headers requeridos

| Header    | Tipo   | Descripción                          |
| --------- | ------ | ------------------------------------ |
| x-user-id | number | ID del usuario que realiza la acción |

> **Nota:** No se implementó autenticación.
> El header `x-user-id` se utiliza para simular el usuario activo.

---

## 📄 Endpoints

### 🔹 Obtener tareas (paginado)

**GET** `/tasks`

#### Query params

| Param | Tipo   | Descripción                        |
| ----- | ------ | ---------------------------------- |
| page  | number | Página actual (default: 1)         |
| limit | number | Registros por página (default: 10) |

#### Descripción

Devuelve una lista paginada de tareas visibles para el usuario:

* Todas las tareas públicas
* Las tareas privadas del propio usuario

---

### 🔹 Obtener una tarea por ID

**GET** `/tasks/:id`

Devuelve toda la información de una tarea específica si el usuario tiene acceso a ella.

---

### 🔹 Crear una tarea

**POST** `/tasks`

Body de ejemplo:

```json
{
  "title": "Preparar API",
  "description": "Desarrollar endpoints",
  "dueDate": "2026-02-01",
  "isPublic": true,
  "statusId": 1,
  "userId": 1
}
```

---

### 🔹 Reemplazar una tarea

**PUT** `/tasks/:id`

Reemplaza completamente la información de una tarea existente.

---

### 🔹 Actualizar parcialmente una tarea

**PATCH** `/tasks/:id`

Actualiza únicamente los campos enviados en el body.

---

### 🔹 Eliminar una tarea (Soft Delete)

**DELETE** `/tasks/:id`

Marca la tarea como eliminada (`isDeleted = true`).
El registro no se elimina físicamente de la base de datos.

---

## 🧾 Bitácora de movimientos

El sistema registra automáticamente los siguientes eventos:

* Creación de tareas
* Actualización de tareas
* Eliminación lógica de tareas

Cada registro incluye:

* Tipo de acción (CREATE, UPDATE, DELETE)
* Entidad afectada
* ID del registro
* ID del usuario
* Fecha de ejecución

---

## 🧠 Reglas de negocio

* Las tareas pueden ser **públicas** o **privadas**
* Un usuario puede ver:

  * Todas las tareas públicas
  * Sus propias tareas privadas
* Las tareas eliminadas usan **soft delete**
* Las tareas eliminadas no se devuelven en ningún endpoint
* Todas las acciones relevantes se registran en la bitácora

---

## 🧪 Notas finales

* El proyecto está estructurado por módulos (tasks, users, status, logs)
* Se priorizó claridad, mantenibilidad y buenas prácticas
* No se implementó autenticación por alcance de la prueba

---
