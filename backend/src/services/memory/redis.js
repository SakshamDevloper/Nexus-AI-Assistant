import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL
let redis = null

export function getRedis() {
  if (redis) return redis
  if (!redisUrl) {
    console.warn('Redis URL not configured — running without session cache')
    return null
  }

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy: () => null,
  })

  redis.on('error', (err) => {
    console.warn('Redis unavailable:', err.message)
    redis = null
  })

  return redis
}

export async function connectRedis() {
  const client = getRedis()
  if (!client) return null
  try {
    await client.connect()
    console.log('Redis connected')
    return client
  } catch (err) {
    console.warn('Redis connection failed — running without session cache:', err.message)
    redis = null
    return null
  }
}

export async function setSessionContext(sessionId, messages, ttl = 3600) {
  const client = getRedis()
  if (!client) return
  try {
    const key = `session:${sessionId}:context`
    await client.setex(key, ttl, JSON.stringify(messages))
  } catch {}
}

export async function getSessionContext(sessionId) {
  const client = getRedis()
  if (!client) return null
  try {
    const key = `session:${sessionId}:context`
    const data = await client.get(key)
    return data ? JSON.parse(data) : null
  } catch { return null }
}

export async function appendToSessionContext(sessionId, message, maxMessages = 20, ttl = 3600) {
  const existing = await getSessionContext(sessionId)
  const messages = existing ? [...existing, message] : [message]
  const trimmed = messages.slice(-maxMessages)
  await setSessionContext(sessionId, trimmed, ttl)
  return trimmed
}

export async function clearSessionContext(sessionId) {
  const client = getRedis()
  if (!client) return
  try {
    await client.del(`session:${sessionId}:context`)
  } catch {}
}

export async function closeRedis() {
  if (redis) {
    try { await redis.quit() } catch {}
    redis = null
  }
}
