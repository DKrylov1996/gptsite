import { Router } from 'express'
import { getCollectionsStore } from '../services/collections-store.js'

export function createCollectionsRouter () {
  const router = Router()
  const store = getCollectionsStore()

  router.get('/', async (_req, res, next) => {
    try {
      const { collections, currentYear } = await store.listCollections()
      res.json({ collections, currentYear })
    } catch (error) {
      next(error)
    }
  })

  router.get('/current', async (_req, res, next) => {
    try {
      const data = await store.getCurrentCollection()
      res.json(data)
    } catch (error) {
      next(error)
    }
  })

  router.get('/:year', async (req, res, next) => {
    try {
      const year = req.params.year
      const data = await store.getCollection(year)
      if (!data) {
        return res.status(404).json({ error: 'Collection not found' })
      }
      res.json(data)
    } catch (error) {
      next(error)
    }
  })

  return router
}
