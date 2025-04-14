import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

if (!OPENWEATHER_API_KEY) {
  console.warn('OpenWeather API key is missing. Weather functionality will not work properly.');
}

export const getCurrentWeather = async (lat, lon) => {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric' // Use Celsius
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    throw new Error('Failed to fetch weather data');
  }
};

export const detectSeason = async (lat, lon) => {
  try {
    const weatherData = await getCurrentWeather(lat, lon);
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const rainfall = weatherData.rain ? weatherData.rain['1h'] || 0 : 0;
    
    // Simple season detection logic - customize based on your region
    if (temp > 30 && humidity > 70) {
      return 'monsoon';
    } else if (temp > 25) {
      return 'summer';
    } else if (temp < 15) {
      return 'winter';
    } else {
      return 'spring';
    }
  } catch (error) {
    console.error('Error detecting season:', error.message);
    // Default to current month-based season if weather API fails
    const month = new Date().getMonth();
    
    // Northern hemisphere seasons (adjust for southern hemisphere if needed)
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }
};

export const getForecast = async (lat, lon) => {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });
    
    // Process forecast data to daily summary
    const dailyForecasts = [];
    const forecastsByDay = {};
    
    response.data.list.forEach(forecast => {
      const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];
      
      if (!forecastsByDay[date]) {
        forecastsByDay[date] = [];
      }
      
      forecastsByDay[date].push(forecast);
    });
    
    for (const [date, forecasts] of Object.entries(forecastsByDay)) {
      // Calculate average temp and get weather conditions summary
      const avgTemp = forecasts.reduce((sum, f) => sum + f.main.temp, 0) / forecasts.length;
      const conditions = forecasts[Math.floor(forecasts.length / 2)].weather[0].main;
      
      dailyForecasts.push({
        date,
        avgTemp: Math.round(avgTemp * 10) / 10,
        conditions,
        humidity: forecasts[0].main.humidity,
        windSpeed: forecasts[0].wind.speed
      });
    }
    
    return dailyForecasts;
  } catch (error) {
    console.error('Error fetching forecast data:', error.message);
    throw new Error('Failed to fetch forecast data');
  }
};

export default {
  getCurrentWeather,
  detectSeason,
  getForecast
};