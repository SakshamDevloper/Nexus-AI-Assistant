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

const defaultProvider = 'gpt-4o-mini'

let _providers = null

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

function getDefaultProvider() {
  const entry = Object.values(_providers || {}).find(p => p !== null)
  return entry || null
}

export async function getProvider(modelId) {
  const providers = await getProviders()
  return providers[modelId] || getDefaultProvider()
}

export function getAvailableModels() {
  return Object.entries(_providers || {})
    .filter(([, p]) => p !== null)
    .map(([id, config]) => ({
      id,
      model: config.model,
      supportsTools: config.supportsTools,
    }))
}

export async function streamResponse(modelId, messages, tools, onToken, onToolCall) {
  const provider = await getProvider(modelId)

  if (!provider || !provider.client) {
    throw new Error(`Model "${modelId}" not configured. Set the required API key in your .env file.`)
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

  const stream = await provider.client.chat.completions.create(requestOptions)

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
        onToolCall(tc.id, tc.name, args)
      } catch (e) {
        console.error('Failed to parse tool call arguments:', e)
      }
    }
  }

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

  const response = await provider.client.chat.completions.create(requestOptions)
  return response.choices[0].message
}
