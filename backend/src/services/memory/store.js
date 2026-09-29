import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../../../../data')

function randomId() {
  return crypto.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

class JsonCollection {
  constructor(name) {
    this.name = name
    this.filePath = path.join(DATA_DIR, `${name}.json`)
    this.cache = null
  }

  async _load() {
    if (this.cache) return this.cache
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8')
      this.cache = JSON.parse(raw)
    } catch {
      this.cache = []
    }
    return this.cache
  }

  async _save() {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(this.filePath, JSON.stringify(this.cache, null, 2))
  }

  _matches(doc, filter) {
    for (const key of Object.keys(filter)) {
      if (key === '$or') {
        if (!filter.$or.some(cond => this._matches(doc, cond))) return false
        continue
      }
      const val = filter[key]
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        if ('$ne' in val && doc[key] === val.$ne) return false
        if ('$in' in val && !val.$in.includes(doc[key])) return false
        if ('$gt' in val && !(doc[key] > val.$gt)) return false
        if ('$gte' in val && !(doc[key] >= val.$gte)) return false
        if ('$lt' in val && !(doc[key] < val.$lt)) return false
        if ('$lte' in val && !(doc[key] <= val.$lte)) return false
        if ('$regex' in val && !new RegExp(val.$regex, val.$options || '').test(String(doc[key] || ''))) return false
        if ('$exists' in val) {
          if (val.$exists ? !(key in doc) : (key in doc)) return false
          continue
        }
        continue
      }
      if (doc[key] !== val) return false
    }
    return true
  }

  async find(filter = {}, options = {}) {
    let data = await this._load()
    let results = data.filter(doc => this._matches(doc, filter))
    if (options.sort) {
      const [field, dir] = Object.entries(options.sort)[0]
      results.sort((a, b) => {
        const va = a[field], vb = b[field]
        if (va < vb) return dir === -1 ? 1 : -1
        if (va > vb) return dir === -1 ? -1 : 1
        return 0
      })
    }
    if (options.limit) results = results.slice(0, options.limit)
    return results
  }

  async findOne(filter = {}) {
    const results = await this.find(filter, { limit: 1 })
    return results[0] || null
  }

  async insertOne(doc) {
    const data = await this._load()
    const newDoc = { _id: randomId(), ...doc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    data.push(newDoc)
    this.cache = data
    await this._save()
    return { insertedId: newDoc._id }
  }

  async updateOne(filter, update, options = {}) {
    const data = await this._load()
    const idx = data.findIndex(doc => this._matches(doc, filter))
    if (idx === -1) {
      if (options.upsert) {
        const newDoc = {
          _id: randomId(),
          ...Object.fromEntries(Object.entries(filter).filter(([k]) => !k.startsWith('$'))),
          ...(update.$set || {}),
          ...(update.$setOnInsert || {}),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        data.push(newDoc)
        this.cache = data
        await this._save()
        return { upsertedId: newDoc._id, acknowledged: true }
      }
      return { modifiedCount: 0, acknowledged: true }
    }
    const doc = data[idx]
    if (update.$set) Object.assign(doc, update.$set)
    if (update.$unset) for (const k of Object.keys(update.$unset)) delete doc[k]
    doc.updatedAt = new Date().toISOString()
    this.cache = data
    await this._save()
    return { modifiedCount: 1, acknowledged: true }
  }

  async deleteOne(filter) {
    const data = await this._load()
    const idx = data.findIndex(doc => this._matches(doc, filter))
    if (idx === -1) return { deletedCount: 0 }
    data.splice(idx, 1)
    this.cache = data
    await this._save()
    return { deletedCount: 1 }
  }

  async deleteMany(filter = {}) {
    const data = await this._load()
    const remaining = data.filter(doc => !this._matches(doc, filter))
    const deletedCount = data.length - remaining.length
    this.cache = remaining
    await this._save()
    return { deletedCount }
  }

  async countDocuments(filter = {}) {
    const results = await this.find(filter)
    return results.length
  }
}

const collections = {}

export function getCollection(name) {
  if (!collections[name]) collections[name] = new JsonCollection(name)
  return collections[name]
}

export async function initStore() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}
