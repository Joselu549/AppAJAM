import express from 'express'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { UserRepository } from '../user-repository.js'
import { createClient } from '@libsql/client'

dotenv.config()

const app = express()

app.set('view engine', 'ejs')
app.set('views', './public/views')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true })) // Middleware para procesar datos del formulario
app.use(cookieParser())
app.use((req, res, next) => {
  const token = req.cookies.access_token

  req.session = { user: null }
  try {
    const data = jwt.verify(token, process.env.SECRET_JWT_KEY)
    req.session.user = data
  } catch (error) {
    req.session.user = null
  }

  next() // --> seguir con la ejecución
})

const port = process.env.PORT ?? 3000

app.get('/', (req, res) => {
  const { user } = req.session
  if (user) {
    res.render('protected', { username: user.username })
  } else {
    res.render('login')
  }
})

app.get('/login', (req, res) => res.render('login'))
app.get('/register', (req, res) => res.render('register'))

app.post('/register', async (req, res) => {
  const { email, username, password } = req.body

  try {
    const id = await UserRepository.create({ email, username, password })
    res.redirect('/protected')
  } catch (error) {
    // Arreglar tratamiento del error
    res.status(400).send('<h1>Error 400: Bad request</h1>')
  }
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await UserRepository.login({ email, password })
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.SECRET_JWT_KEY,
      { expiresIn: '1h' }
    )
    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Solo se envía en HTTPS
        sameSite: 'strict', // Solo se envía si la petición es del mismo sitio
        maxAge: 1000 * 60 * 60 // 1 hora
      })
      .redirect('/protected')
  } catch (error) {
    res.redirect('/error')
  }
})

app.get('/error', (req, res) => {
  res.render('error', { errorcode: 401 })
})

app.get('/logout', (req, res) => {
  const { user } = req.session
  if (!user) return res.redirect('/login')
  res.clearCookie('access_token').send('Logged out')
})

app.get('/protected', async (req, res) => {
  // TODO: Verificar token
  const { user } = req.session
  if (!user) return res.status(403).send('Access not authorized')
  res.render('protected', { username: user.username })
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

// app.get('/images/logo.jpg', (req, res) => {
//   res.sendFile(process.cwd() + '/public/images/logo.jpg')
// })

// app.get('/images/background.jpg', (req, res) => {
//   res.sendFile(process.cwd() + '/public/images/background.jpg')
// })

// app.get('/css/styles.css', (req, res) => {
//   res.sendFile(process.cwd() + '/public/css/styles.css')
// })

// app.use((req, res) => {
//   res.status(404).sendFile(process.cwd() + '/public/views/404.html')
// })
