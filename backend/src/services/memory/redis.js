let redis = null

export async function connectRedis() {
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl || redisUrl === 'redis://localhost:6379') {
    console.log('Redis not configured — skipping session cache')
    return null
  }
  try {
    const { default: Redis } = await import('ioredis')
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      lazyConnect: true,
    })
    await redis.connect()
    console.log('Redis connected')
    return redis
  } catch (err) {
    console.warn('Redis unavailable:', err.message)
    redis = null
    return null
  }
}

export function getRedis() { return redis }

export async function setSessionContext(sessionId, messages, ttl = 3600) {
  if (!redis) return
  try { await redis.setex(`session:${sessionId}:context`, ttl, JSON.stringify(messages)) } catch {}
}

export async function getSessionContext(sessionId) {
  if (!redis) return null
  try {
    const data = await redis.get(`session:${sessionId}:context`)
    return data ? JSON.parse(data) : null
  } catch { return null }
}

export async function appendToSessionContext(sessionId, message, maxMessages = 20, ttl = 3600) {
  const existing = await getSessionContext(sessionId)
  const messages = existing ? [...existing, message] : [message]
  await setSessionContext(sessionId, messages.slice(-maxMessages), ttl)
  return messages
}

export async function clearSessionContext(sessionId) {
  if (!redis) return
  try { await redis.del(`session:${sessionId}:context`) } catch {}
}

export async function closeRedis() {
  if (redis) { try { await redis.quit() } catch {}; redis = null }
}
