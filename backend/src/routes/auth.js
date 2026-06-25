import { Router } from 'express'
import admin from 'firebase-admin'

const router = Router()

function isFirebaseReady() {
  try { return admin.apps.length > 0 } catch { return false }
}

router.post('/verify', async (req, res) => {
  try {
    if (!isFirebaseReady()) {
      return res.status(503).json({ error: 'Firebase not configured' })
    }

    const { idToken } = req.body
    if (!idToken) return res.status(400).json({ error: 'No token provided' })

    const decoded = await admin.auth().verifyIdToken(idToken)
    const { uid, email, name, picture } = decoded

    try {
      const { getUsersCollection } = await import('../services/memory/mongo.js')
      const users = getUsersCollection()
      await users.updateOne(
        { firebaseUid: uid },
        {
          $set: { firebaseUid: uid, email, name: name || email?.split('@')[0] || 'User', picture, lastLogin: new Date() },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      )
    } catch {}

    res.json({ user: { uid, email, name: name || email?.split('@')[0] || 'User', picture } })
  } catch (error) {
    console.error('Auth verify error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
})

router.get('/me', async (req, res) => {
  if (!isFirebaseReady()) return res.status(503).json({ error: 'Firebase not configured' })

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No token' })

  try {
    const token = authHeader.split(' ')[1]
    const decoded = await admin.auth().verifyIdToken(token)
    res.json({ user: { uid: decoded.uid, email: decoded.email, name: decoded.name || decoded.email } })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
