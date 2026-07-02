import axios from 'axios'

const WEATHER_URL = 'https://api.openweathermap.org/data/2.5'

export const weatherTool = {
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get current weather or forecast for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City name or coordinates (lat,lon)' },
        units: { type: 'string', enum: ['metric', 'imperial'], default: 'metric' },
        forecast: { type: 'boolean', default: false },
      },
      required: ['location'],
    },
  },
}

export async function executeWeather({ location, units = 'metric', forecast = false }) {
  const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
  if (!OPENWEATHER_API_KEY) {
    return { error: 'OpenWeather API key not configured' }
  }

  try {
    let url = forecast
      ? `${WEATHER_URL}/forecast`
      : `${WEATHER_URL}/weather`

    const response = await axios.get(url, {
      params: {
        q: location,
        units,
        appid: OPENWEATHER_API_KEY,
      },
      timeout: 10000,
    })

    if (forecast) {
      return {
        location: response.data.city.name,
        country: response.data.city.country,
        forecast: response.data.list.slice(0, 8).map(item => ({
          datetime: item.dt_txt,
          temp: item.main.temp,
          feels_like: item.main.feels_like,
          humidity: item.main.humidity,
          condition: item.weather[0].description,
          icon: item.weather[0].icon,
        })),
      }
    }

    return {
      location: response.data.name,
      country: response.data.sys.country,
      temperature: response.data.main.temp,
      feels_like: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      condition: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      wind_speed: response.data.wind.speed,
      wind_deg: response.data.wind.deg,
    }
  } catch (error) {
    console.error('Weather error:', error.message)
    return { error: `Weather lookup failed: ${error.message}` }
  }
}