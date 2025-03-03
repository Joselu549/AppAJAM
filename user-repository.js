import crypto from 'node:crypto'
import DBLocal from 'db-local'
import bcrypt from 'bcrypt'
import zod from 'zod'

const { Schema } = DBLocal({ path: './db' })

const User = Schema('User', {
  _id: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

const usuarioSchema = zod.object({
  email: zod
    .string()
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Email inválido'),
  username: zod
    .string()
    .max(20, 'El nombre de usuario no puede tener más de 20 caracteres')
    .optional(),
  password: zod
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
})
export class UserRepository {
  static async create({ email, username, password }) {
    // 1. Comprobamos que los datos sean correctos
    const res = usuarioSchema.safeParse({ email, username, password })
    if (!res.success) {
      throw new Error(res.error.errors[0].message)
    }
    //  2. Comprobamos que el usuario no existe

    const user = User.findOne({ email })
    if (user) {
      throw new Error('E-mail already exists')
    }
    const id = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash(password, 10) // Devuelve una promesa

    User.create({
      _id: id,
      email,
      username,
      password: hashedPassword
    }).save()

    return id
  }

  static async login({ email, password }) {
    const res = usuarioSchema.safeParse({ email, password })
    if (!res.success) {
      throw new Error(res.error.errors[0].message)
    }

    const user = User.findOne({ email })
    if (!user) {
      throw new Error('User not found')
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new Error('Invalid password')
    }

    const { password: _, ...publicUser } = user // Forma limpia de omitir un campo

    return publicUser
  }
}
