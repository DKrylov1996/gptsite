#!/usr/bin/env node
import crypto from 'node:crypto'

const [password] = process.argv.slice(2)

if (!password) {
  console.error('Usage: node scripts/hash-password.js <password>')
  process.exit(1)
}

const salt = crypto.randomBytes(16).toString('hex')
const hash = crypto.scryptSync(password, salt, 64).toString('hex')

console.log(`scrypt:${salt}:${hash}`)
