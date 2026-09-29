import { Router } from 'express'
import { getProvidersMap } from '../services/llm/router.js'

const router = Router()

router.post('/', async (req, res) => {
  const { messages } = req.body
  if (!messages || messages.length === 0) {
    return res.json({ suggestions: [] })
  }

  try {
    const providers = getProvidersMap()
    const provider = Object.values(providers).find(p => p !== null)
    if (!provider) return res.json({ suggestions: [] })

    const recentMessages = messages.slice(-6)

    const context = recentMessages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n')

    const prompt = `Based on this conversation, suggest 4 relevant follow-up questions or actions the user might want to take next. Be specific and contextual — don't give generic suggestions.

Conversation:
${context}

Return ONLY a JSON array of strings, no explanation:
["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]`

    const response = await provider.client.chat.completions.create({
      model: provider.model,
      messages: [
        { role: 'system', content: 'You are a context analyzer. Generate relevant follow-up suggestions. Return ONLY valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 500,
    })

    const text = response.choices[0]?.message?.content || '[]'
    const cleaned = text.replace(/```json|```/g, '').trim()
    let suggestions
    try {
      suggestions = JSON.parse(cleaned)
    } catch {
      suggestions = text.split('\n').filter(l => l.trim().startsWith('"')).map(l => l.replace(/^"|"|,$/g, '').trim()).filter(Boolean)
    }

    res.json({ suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 4) : [] })
  } catch (error) {
    console.error('Suggestions error:', error)
    res.json({ suggestions: [] })
  }
})

export default router
