import crypto from 'node:crypto'
import { createClient } from '@libsql/client'
import bcrypt from 'bcrypt'
import zod from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const db = createClient({
  url: 'libsql://optimal-armadillo-joselu549.turso.io',
  authToken: process.env.DB_TOKEN
})

await db.execute(`CREATE TABLE IF NOT EXISTS users (
  id STRING PRIMARY KEY,
  username STRING NOT NULL,
  email STRING NOT NULL,
  password STRING NOT NULL
)`)

const usuarioSchema = zod.object({
  email: zod
    .string()
    .regex(/^[a-zA-Z0-9._-]+@ajambanda\.es$/, 'Email inválido'),
  username: zod
    .string()
    .max(20, 'El nombre de usuario no puede tener más de 20 caracteres')
    .optional(),
  password: zod
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
})
export class UserRepository {
  static async create ({ email, username, password }) {
    // 1. Comprobamos que los datos sean correctos
    const res = usuarioSchema.safeParse({ email, username, password })
    if (!res.success) {
      throw new Error(res.error.errors[0].message)
    }

    const results = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    })

    if (results.rows.length > 0) {
      throw new Error('E-mail already exists')
    }

    const id = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash(password, 10) // Devuelve una promesa
    const sql =
      'INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)'
    try {
      await db.execute(sql, [id, email, username, hashedPassword])
      console.log('Usuario registrado correctamente')
      return id
    } catch (error) {
      console.error('Error al registrar el usuario: ', error)
    }
  }

  static async login ({ email, password }) {
    const res = usuarioSchema.safeParse({ email, password })
    if (!res.success) {
      throw new Error(res.error.errors[0].message)
    }

    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    })

    const user = result.rows[0]

    if (!result.rows.length) {
      throw new Error('User not found')
    }

    const isValid = bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new Error('Invalid password')
    }

    const { password: _, ...publicUser } = user // Forma limpia de omitir un campo

    return publicUser
  }
}
