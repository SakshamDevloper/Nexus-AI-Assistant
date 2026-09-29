import { Router } from 'express'
import { getProvider, getProvidersMap } from '../services/llm/router.js'

const router = Router()

async function queryModel(modelId, messages) {
  const provider = await getProvider(modelId)
  if (!provider || !provider.client) return { model: modelId, error: 'Not configured' }

  try {
    const response = await provider.client.chat.completions.create({
      model: provider.model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    })
    return { model: modelId, content: response.choices[0]?.message?.content || '' }
  } catch (err) {
    return { model: modelId, error: err.message }
  }
}

async function generateConsensus(responses, originalQuery) {
  const providers = getProvidersMap()
  const firstAvail = Object.values(providers).find(p => p !== null)
  if (!firstAvail) return ''

  const responsesText = responses
    .filter(r => r.content)
    .map(r => `--- ${r.model} ---\n${r.content}`)
    .join('\n\n')

  const messages = [
    { role: 'system', content: `You are a consensus analyzer. Given multiple AI responses to the same query, synthesize a balanced summary that highlights:
1. Key points ALL models agree on
2. Unique insights from individual models
3. A synthesized final answer that represents the best of all perspectives

Query: ${originalQuery}

Responses:
${responsesText}

Provide a concise consensus analysis.` },
    { role: 'user', content: 'Synthesize the consensus from these responses.' },
  ]

  try {
    const response = await firstAvail.client.chat.completions.create({
      model: firstAvail.model,
      messages,
      temperature: 0.5,
      max_tokens: 2048,
    })
    return response.choices[0]?.message?.content || ''
  } catch {
    return ''
  }
}

router.post('/', async (req, res) => {
  const { content, models, history } = req.body

  if (!content) return res.status(400).json({ error: 'Message content is required' })

  const modelList = models || ['gpt-4o-mini', 'deepseek', 'llama-3.3']

  const systemMsg = {
    role: 'system',
    content: `You are NexusAI. Current date: ${new Date().toISOString().split('T')[0]}. Be concise but thorough. Format code blocks with language tags.`,
  }

  const messages = [
    systemMsg,
    ...(history || []).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content },
  ]

  try {
    const results = await Promise.allSettled(
      modelList.map(m => queryModel(m, messages))
    )

    const responses = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value
      return { model: modelList[i], error: r.reason?.message || 'Unknown error' }
    })

    const successful = responses.filter(r => r.content)
    let consensus = ''
    if (successful.length >= 2) {
      consensus = await generateConsensus(successful, content)
    }

    res.json({ responses, consensus })
  } catch (error) {
    console.error('Compare error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
