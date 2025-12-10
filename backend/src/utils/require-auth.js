import jwt from 'jsonwebtoken'

export function requireAuth (req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header) {
      return res.status(401).json({ error: 'Missing authorization header' })
    }

    const [scheme, token] = header.split(' ')
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Invalid authorization header' })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT secret not configured')
    }

    const payload = jwt.verify(token, secret)
    req.user = { email: payload.sub }
    next()
  } catch (error) {
    console.error('Authentication error', error)
    res.status(401).json({ error: 'Unauthorized' })
  }
}
