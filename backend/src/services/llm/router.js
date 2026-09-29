let OpenAI, Groq

async function getClient(moduleName) {
  if (moduleName === 'openai') {
    if (!OpenAI) OpenAI = (await import('openai')).default
    return OpenAI
  }
  if (moduleName === 'groq') {
    if (!Groq) Groq = (await import('groq-sdk')).default
    return Groq
  }
}

function makeProvider(clientClass, apiKey, baseURL, model, supportsTools = true) {
  if (!apiKey) return null
  try {
    const client = baseURL
      ? new clientClass({ apiKey, baseURL })
      : new clientClass({ apiKey })
    return { client, model, supportsTools }
  } catch (e) {
    console.warn(`Provider ${model} init failed:`, e.message)
    return null
  }
}

let _providers = null
const failureTracker = {}

async function getProviders() {
  if (_providers) return _providers

  const OpenAI = await getClient('openai')
  const Groq = await getClient('groq')

  _providers = {
    'gpt-4o':       OpenAI ? makeProvider(OpenAI, process.env.OPENAI_API_KEY, null, 'gpt-4o') : null,
    'gpt-4o-mini':  OpenAI ? makeProvider(OpenAI, process.env.OPENAI_API_KEY, null, 'gpt-4o-mini') : null,
    'deepseek':     OpenAI ? makeProvider(OpenAI, process.env.DEEPSEEK_API_KEY, 'https://api.deepseek.com', 'deepseek-chat') : null,
    'llama-3.3':    Groq ? makeProvider(Groq, process.env.GROQ_API_KEY, null, 'llama-3.3-70b-versatile') : null,
    'gemini-flash': OpenAI ? makeProvider(OpenAI, process.env.GEMINI_API_KEY, 'https://generativelanguage.googleapis.com/v1beta/openai/', 'gemini-1.5-flash', false) : null,
  }

  return _providers
}

export async function getProvider(modelId) {
  const providers = await getProviders()
  return providers[modelId]
}

export function getProvidersMap() {
  return _providers || {}
}

export async function getModelStatus() {
  const providers = await getProviders()
  return Object.entries(providers || {}).map(([id, config]) => ({
    id,
    model: config?.model,
    status: config !== null ? (Object.values(failureTracker[id] || {}).reduce((a, b) => a + b, 0) >= 5 ? 'disabled' : 'available') : 'not_configured',
    failures: Object.values(failureTracker[id] || {}).reduce((a, b) => a + b, 0),
    supportsTools: config?.supportsTools ?? false
  }))
}

export function resetModelFailure(id) {
  resetFailureTracker(id)
}

function trackFailure(modelId, errorType, errorMessage) {
  if (!failureTracker[modelId]) failureTracker[modelId] = {}
  failureTracker[modelId][errorType] = (failureTracker[modelId][errorType] || 0) + 1

  // Circuit breaker: disable model after too many failures
  const failures = Object.values(failureTracker[modelId]).reduce((a, b) => a + b, 0)
  if (failures >= 5) {
    console.warn(`Circuit breaker: ${modelId} disabled after ${failures} failures`)
    return true
  }
  return false
}

function resetFailureTracker(modelId) {
  if (failureTracker[modelId]) {
    failureTracker[modelId] = {}
  }
}

async function tryFallbackProviders(modelId, messages, tools, onToken, onToolCall, maxRetries = 2) {
  const providers = _providers || {}
  const fallbackOrder = Object.keys(providers)
    .filter(id => id !== modelId && providers[id] !== null)

  for (let retry = 0; retry <= maxRetries; retry++) {
    for (const fallbackId of fallbackOrder) {
      console.warn(`Attempting fallback to ${fallbackId} (attempt ${retry + 1})...`)
      try {
        return await streamResponse(fallbackId, messages, tools, onToken, onToolCall, true)
      } catch (fallbackErr) {
        console.warn(`Fallback ${fallbackId} also failed:`, fallbackErr.message)
        trackFailure(fallbackId, 'fallback', fallbackErr.message)
      }
    }
  }
  throw new Error(`All models exhausted. Please check your API keys and quota.`)
}

export async function streamResponse(modelId, messages, tools, onToken, onToolCall, retriedWithoutTools = false, correctionDepth = 0) {
  const provider = await getProvider(modelId)

  if (!provider || !provider.client) {
    const result = await tryFallbackProviders(modelId, messages, tools, onToken, onToolCall)
    return result
  }

  const requestOptions = {
    model: provider.model,
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 4096,
  }

  if (tools && tools.length > 0 && provider.supportsTools) {
    requestOptions.tools = tools
    requestOptions.tool_choice = 'auto'
  }

  let stream
  try {
    stream = await provider.client.chat.completions.create(requestOptions)
  } catch (err) {
    const msg = err.message || ''
    const isCircuitOpen = trackFailure(modelId, 'primary', msg)

    if (msg.includes('quota') || msg.includes('429') || msg.includes('insufficient_quota')) {
      console.warn(`Quota exceeded for ${modelId}, trying fallback providers...`)
      return await tryFallbackProviders(modelId, messages, tools, onToken, onToolCall)
    }

    if (!retriedWithoutTools && tools && tools.length > 0 && (msg.includes('tools') || msg.includes('function') || msg.includes('type')) && correctionDepth < 2) {
      console.warn(`Tools rejected by ${modelId}, retrying without tools (depth ${correctionDepth + 1}):`, msg)
      const newRequestOptions = { ...requestOptions }
      delete newRequestOptions.tools
      delete newRequestOptions.tool_choice
      stream = await provider.client.chat.completions.create(newRequestOptions)
    } else {
      const result = await tryFallbackProviders(modelId, messages, tools, onToken, onToolCall)
      return result
    }
  }

  let fullContent = ''
  let toolCalls = []
  let currentToolCall = null

  for await (const chunk of stream) {
    const choice = chunk.choices[0]
    if (!choice) continue

    const delta = choice.delta

    if (delta.content) {
      fullContent += delta.content
      onToken(delta.content)
    }

    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        if (tc.index !== undefined) {
          if (currentToolCall) toolCalls.push(currentToolCall)
          currentToolCall = { id: tc.id, name: tc.function?.name, arguments: tc.function?.arguments || '' }
        } else if (currentToolCall) {
          currentToolCall.arguments += tc.function?.arguments || ''
        }
      }
    }

    if (choice.finish_reason === 'tool_calls' && currentToolCall) {
      toolCalls.push(currentToolCall)
      currentToolCall = null
    }
  }

  if (toolCalls.length > 0) {
    for (const tc of toolCalls) {
      try {
        const args = JSON.parse(tc.arguments || '{}')
        await onToolCall(tc.id, tc.name, args)
      } catch (e) {
        console.error('Failed to parse tool call arguments:', e)
      }
    }
  }

  // Success - reset failure tracker for this model
  resetFailureTracker(modelId)

  return { fullContent, toolCalls }
}

export async function generateResponse(modelId, messages, tools) {
  const provider = await getProvider(modelId)
  if (!provider || !provider.client) {
    throw new Error(`Model "${modelId}" not configured.`)
  }

  const requestOptions = {
    model: provider.model,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  }

  if (tools && tools.length > 0 && provider.supportsTools) {
    requestOptions.tools = tools
    requestOptions.tool_choice = 'auto'
  }

  try {
    const response = await provider.client.chat.completions.create(requestOptions)
    return response.choices[0].message
  } catch (error) {
    // Self-correction: try alternative model on failure
    console.error(`Primary model ${modelId} failed, attempting correction:`, error.message)
    const availableModels = getAvailableModels()
    const alternatives = availableModels.filter(m => m.id !== modelId && m.supportsTools)

    if (alternatives.length > 0) {
      const altModel = alternatives[0].id
      console.warn(`Switching to alternative model: ${altModel}`)
      return await generateResponse(altModel, messages, tools)
    }

    throw error
  }
}

export function getAvailableModels() {
  return Object.entries(_providers || {})
    .filter(([, p]) => p !== null)
    .map(([id, config]) => ({ id, model: config.model, supportsTools: config.supportsTools, failures: Object.values(failureTracker[id] || {}).reduce((a, b) => a + b, 0) }))
}

export async function initModels() {
  await getProviders()
}