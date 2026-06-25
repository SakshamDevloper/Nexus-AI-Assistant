import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'nexus-ai'

let client = null
let db = null

export async function connectMongo() {
  if (!uri || !uri.includes('@')) {
    console.warn('MongoDB URI not configured — running without database persistence')
    return null
  }

  try {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    })

    await client.connect()
    db = client.db(dbName)
    await createIndexes()
    console.log(`Connected to MongoDB: ${dbName}`)
  } catch (error) {
    console.warn('MongoDB connection failed — running without database:', error.message)
    client = null
    db = null
  }

  return db
}

async function createIndexes() {
  if (!db) return
  try {
    await db.collection('conversations').createIndex({ userId: 1, updatedAt: -1 })
    await db.collection('conversations').createIndex({ sessionId: 1 }, { unique: true, sparse: true })
    await db.collection('memories').createIndex({ userId: 1, key: 1 }, { unique: true })
    await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true })
    await db.collection('sessions').createIndex({ userId: 1, createdAt: -1 })
  } catch (e) {
    console.warn('MongoDB index creation failed:', e.message)
  }
}

export function getDb() {
  if (!db) throw new Error('MongoDB not connected')
  return db
}

export function getConversationsCollection() {
  return getDb().collection('conversations')
}

export function getMemoriesCollection() {
  return getDb().collection('memories')
}

export function getUsersCollection() {
  return getDb().collection('users')
}

export function getSessionsCollection() {
  return getDb().collection('sessions')
}

export async function closeMongo() {
  if (client) {
    try { await client.close() } catch {}
    client = null
    db = null
  }
}
