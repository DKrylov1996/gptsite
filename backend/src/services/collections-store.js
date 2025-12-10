import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_PATH = path.resolve(__dirname, '../../data/collections.json')

let singleton

export function getCollectionsStore () {
  if (!singleton) {
    singleton = createCollectionsStore(DATA_PATH)
  }
  return singleton
}

function createCollectionsStore (filePath) {
  async function readData () {
    const exists = await fs.pathExists(filePath)
    if (!exists) {
      await fs.outputJson(filePath, { currentYear: new Date().getFullYear(), collections: {} }, { spaces: 2 })
    }
    return fs.readJson(filePath)
  }

  async function writeData (data) {
    await fs.outputJson(filePath, data, { spaces: 2 })
    return data
  }

  async function listCollections () {
    const data = await readData()
    const collections = Object.values(data.collections).sort((a, b) => b.year - a.year)
    return { collections, currentYear: data.currentYear }
  }

  async function getCurrentCollection () {
    const data = await readData()
    const current = data.collections[data.currentYear]
    if (!current) {
      return { collection: null, year: data.currentYear }
    }
    return { collection: current, year: data.currentYear }
  }

  async function getCollection (year) {
    const data = await readData()
    return data.collections[year]
  }

  async function addCollection (collection) {
    const data = await readData()
    if (data.collections[collection.year]) {
      const err = new Error('Collection for this year already exists')
      err.status = 409
      throw err
    }
    data.collections[collection.year] = collection
    await writeData(data)
    return collection
  }

  async function updateCollection (year, collection) {
    const data = await readData()
    if (!data.collections[year]) {
      const err = new Error('Collection not found')
      err.status = 404
      throw err
    }
    data.collections[year] = collection
    await writeData(data)
    return collection
  }

  async function deleteCollection (year) {
    const data = await readData()
    if (!data.collections[year]) {
      const err = new Error('Collection not found')
      err.status = 404
      throw err
    }
    delete data.collections[year]
    if (data.currentYear === year) {
      const remainingYears = Object.keys(data.collections)
      data.currentYear = remainingYears.length ? Math.max(...remainingYears.map(Number)) : new Date().getFullYear()
    }
    await writeData(data)
  }

  async function setCurrentYear (year) {
    const data = await readData()
    if (!data.collections[year]) {
      const err = new Error('Collection not found for current year update')
      err.status = 404
      throw err
    }
    data.currentYear = year
    await writeData(data)
    return { currentYear: year }
  }

  return {
    listCollections,
    getCollection,
    addCollection,
    updateCollection,
    deleteCollection,
    setCurrentYear,
    getCurrentCollection
  }
}
