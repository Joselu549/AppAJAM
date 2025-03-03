import DBLocal from 'db-local'
import path from 'path'
import crypto from 'crypto'

const { Schema } = DBLocal({ path: './db' })

const User = Schema('User', {
  _id: { type: String, required: true },
  password: { type: String, required: true }
})

export class UserRepository {
  static create({ username, password }) {
    // 1. Comprobamos que los datos sean correctos
    if (username !== typeof String || password !== typeof String)
      throw new Error('Invalid input, password and username must be a string')
    if (username.length < 3)
      throw new Error('Username must be at least 3 characters long')
    if (password.length < 6)
      throw new Error('Password must be at least 6 characters long')

    //2. Comprobamos que el usuario no existe

    const user = User.findOne({ username })
    const id = crypto.randomUUID()

    User.create({
      _id: id,
      username,
      password
    }).save()

    return id
  }
  static login({ username, password }) {}
}
