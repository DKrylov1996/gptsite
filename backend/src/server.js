import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'

import { createCollectionsRouter } from './collections/routes.js'
import { createAdminRouter } from './admin/routes.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({
  origin: corsOrigin.split(',').map(origin => origin.trim()),
  credentials: true
}))
app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/collections', createCollectionsRouter())
app.use('/api/admin', createAdminRouter())

app.use((err, _req, res, _next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({
    error: err.message || 'Internal server error'
  })
})

app.listen(port, () => {
  console.log(`Top 10 albums API listening on port ${port}`)
})
