import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

const port = process.env.PORT ?? 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/login', (req, res) => {})
app.post('/register', (req, res) => {})
app.post('/logout', (req, res) => {})

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
