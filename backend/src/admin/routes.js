import { Router } from 'express'
import Joi from 'joi'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

import { getCollectionsStore } from '../services/collections-store.js'
import { requireAuth } from '../utils/require-auth.js'
import { enrichAlbumsWithSpotify } from '../services/spotify-enrichment.js'

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

const albumSchema = Joi.object({
  rank: Joi.number().integer().min(1).max(100).required(),
  title: Joi.string().required(),
  artist: Joi.string().required(),
  spotifyAlbumId: Joi.string().allow('', null),
  spotifyUrl: Joi.string().uri().allow('', null),
  coverUrl: Joi.string().uri().allow('', null),
  releaseDate: Joi.string().allow('', null),
  label: Joi.string().allow('', null),
  genres: Joi.array().items(Joi.string()).default([]),
  reviewSnippet: Joi.string().allow('', null)
})

const collectionSchema = Joi.object({
  year: Joi.number().integer().min(1900).required(),
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  albums: Joi.array().items(albumSchema).length(10).required()
})

export function createAdminRouter () {
  const router = Router()
  const store = getCollectionsStore()

  router.post('/login', async (req, res, next) => {
    try {
      const { error, value } = loginSchema.validate(req.body)
      if (error) {
        return res.status(400).json({ error: error.message })
      }

      const { email, password } = value
      const adminEmail = process.env.ADMIN_EMAIL
      const passwordHash = process.env.ADMIN_PASSWORD_HASH
      const adminPassword = process.env.ADMIN_PASSWORD
      if (!adminEmail || (!passwordHash && !adminPassword)) {
        return res.status(500).json({ error: 'Admin credentials not configured' })
      }

      if (email !== adminEmail) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const isMatch = verifyPassword(password, passwordHash, adminPassword)
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const secret = process.env.JWT_SECRET
      if (!secret) {
        throw new Error('JWT secret not configured')
      }

      const token = jwt.sign({ sub: email }, secret, { expiresIn: '2h' })
      res.json({ token })
    } catch (error) {
      next(error)
    }
  })

  router.use(requireAuth)

  router.post('/collections', async (req, res, next) => {
    try {
      const payload = validateCollectionPayload(req.body)
      const enriched = await enrichAlbumsWithSpotify(payload)
      const saved = await store.addCollection(enriched)
      res.status(201).json(saved)
    } catch (error) {
      next(error)
    }
  })

  router.put('/collections/:year', async (req, res, next) => {
    try {
      const payload = validateCollectionPayload({ ...req.body, year: Number(req.params.year) })
      const enriched = await enrichAlbumsWithSpotify(payload)
      const saved = await store.updateCollection(payload.year, enriched)
      res.json(saved)
    } catch (error) {
      next(error)
    }
  })

  router.delete('/collections/:year', async (req, res, next) => {
    try {
      const year = Number(req.params.year)
      await store.deleteCollection(year)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  router.patch('/current-year', async (req, res, next) => {
    try {
      const schema = Joi.object({ currentYear: Joi.number().integer().min(1900).required() })
      const { error, value } = schema.validate(req.body)
      if (error) {
        return res.status(400).json({ error: error.message })
      }
      const updated = await store.setCurrentYear(value.currentYear)
      res.json(updated)
    } catch (error) {
      next(error)
    }
  })

  return router
}

function validateCollectionPayload (data) {
  const { error, value } = collectionSchema.validate(data, { abortEarly: false })
  if (error) {
    const message = error.details.map(detail => detail.message).join(', ')
    const err = new Error(message)
    err.status = 400
    throw err
  }
  return value
}

function verifyPassword (password, storedHash, fallbackPlain) {
  if (storedHash) {
    const parts = storedHash.split(':')
    if (parts[0] === 'scrypt' && parts.length === 3) {
      const [, salt, hash] = parts
      const derived = crypto.scryptSync(password, salt, 64)
      const expected = Buffer.from(hash, 'hex')
      if (expected.length !== derived.length) {
        return false
      }
      return crypto.timingSafeEqual(expected, derived)
    }

    if (parts.length === 2) {
      const [salt, hash] = parts
      const derived = crypto.scryptSync(password, salt, 64)
      const expected = Buffer.from(hash, 'hex')
      if (expected.length !== derived.length) {
        return false
      }
      return crypto.timingSafeEqual(expected, derived)
    }

    // fallback to direct comparison for legacy values
    if (storedHash.length === password.length) {
      return crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(password))
    }
    return storedHash === password
  }

  if (fallbackPlain) {
    if (fallbackPlain.length !== password.length) {
      return false
    }
    try {
      return crypto.timingSafeEqual(Buffer.from(fallbackPlain), Buffer.from(password))
    } catch {
      return false
    }
  }

  return false
}
