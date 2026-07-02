import axios from 'axios'

const WIKI_URL = 'https://en.wikipedia.org/api/rest_v1'

export const wikipediaTool = {
  type: 'function',
  function: {
    name: 'wikipedia_lookup',
    description: 'Look up information on Wikipedia. Use for factual queries, definitions, history, biographies, etc.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term or article title' },
        sentences: { type: 'number', default: 5 },
      },
      required: ['query'],
    },
  },
}

export async function executeWikipedia({ query, sentences = 5 }) {
  try {
    const searchResponse = await axios.get(`${WIKI_URL}/page/summary/${encodeURIComponent(query)}`, {
      timeout: 10000,
    })

    const data = searchResponse.data

    return {
      title: data.title,
      extract: data.extract,
      url: data.content_urls?.desktop?.page,
      thumbnail: data.thumbnail?.source,
    }
  } catch (error) {
    if (error.response?.status === 404) {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`
      const searchRes = await axios.get(searchUrl)
      const results = searchRes.data.query?.search || []
      return { error: 'Page not found', suggestions: results.slice(0, 5).map(r => r.title) }
    }
    console.error('Wikipedia error:', error.message)
    return { error: `Wikipedia lookup failed: ${error.message}` }
  }
}