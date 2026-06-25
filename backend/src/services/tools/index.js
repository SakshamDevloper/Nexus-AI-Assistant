import { webSearchTool, executeWebSearch } from './webSearch.js'
import { weatherTool, executeWeather } from './weather.js'
import { wikipediaTool, executeWikipedia } from './wikipedia.js'

export const toolDefinitions = [
  webSearchTool,
  weatherTool,
  wikipediaTool,
]

export const toolExecutors = {
  web_search: executeWebSearch,
  get_weather: executeWeather,
  wikipedia_lookup: executeWikipedia,
}

export async function executeTool(name, args) {
  const executor = toolExecutors[name]
  if (!executor) {
    return { error: `Unknown tool: ${name}` }
  }
  try {
    return await executor(args)
  } catch (error) {
    console.error(`Tool ${name} execution error:`, error)
    return { error: `Tool execution failed: ${error.message}` }
  }
}