import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { getMemoriesCollection } = await import('../services/memory/mongo.js')
    const memories = getMemoriesCollection()
    const items = await memories.find({}).sort({ updatedAt: -1 }).limit(50).toArray()
    res.json({ memories: items })
  } catch {
    res.json({ memories: [] })
  }
})

router.post('/', async (req, res) => {
  try {
    const { getMemoriesCollection } = await import('../services/memory/mongo.js')
    const { key, value, type = 'preference' } = req.body
    if (!key || !value) return res.status(400).json({ error: 'key and value required' })

    const memories = getMemoriesCollection()
    await memories.updateOne(
      { key },
      { $set: { key, value, type, updatedAt: new Date() } },
      { upsert: true }
    )
    res.json({ success: true })
  } catch {
    res.status(503).json({ error: 'Database not available' })
  }
})

router.delete('/:key', async (req, res) => {
  try {
    const { getMemoriesCollection } = await import('../services/memory/mongo.js')
    const memories = getMemoriesCollection()
    await memories.deleteOne({ key: req.params.key })
    res.json({ success: true })
  } catch {
    res.status(503).json({ error: 'Database not available' })
  }
})

export default router
