import axios from 'axios'

const TAVILY_API_KEY = process.env.TAVILY_API_KEY
const TAVILY_URL = 'https://api.tavily.com/search'

export const webSearchTool = {
  name: 'web_search',
  description: 'Search the web for real-time information. Use for current events, news, facts, or any topic requiring up-to-date data.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      max_results: { type: 'number', default: 5 },
      search_depth: { type: 'string', enum: ['basic', 'advanced'], default: 'basic' },
    },
    required: ['query'],
  },
}

export async function executeWebSearch({ query, max_results = 5, search_depth = 'basic' }) {
  if (!TAVILY_API_KEY) {
    return { error: 'Tavily API key not configured' }
  }

  try {
    const response = await axios.post(TAVILY_URL, {
      api_key: TAVILY_API_KEY,
      query,
      max_results,
      search_depth,
      include_answer: true,
      include_raw_content: false,
    }, { timeout: 15000 })

    return {
      answer: response.data.answer,
      results: response.data.results?.map(r => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })) || [],
    }
  } catch (error) {
    console.error('Web search error:', error.message)
    return { error: `Search failed: ${error.message}` }
  }
}