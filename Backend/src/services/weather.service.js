const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light rain showers",
  81: "Rain showers",
  82: "Heavy rain showers",
  85: "Light snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Heavy thunderstorm with hail",
};

async function fetchJson(url) {
  let response;

  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  } catch {
    throw Object.assign(new Error("Weather service is temporarily unavailable."), {
      status: 502,
    });
  }

  if (!response.ok) {
    throw Object.assign(new Error("Weather service is temporarily unavailable."), {
      status: 502,
    });
  }

  return response.json();
}

async function getWeatherForCity(city) {
  const geocodingUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geocodingUrl.search = new URLSearchParams({
    name: city,
    count: "1",
    language: "en",
    format: "json",
  });

  const geocoding = await fetchJson(geocodingUrl);
  const location = geocoding.results?.[0];

  if (!location) {
    throw Object.assign(new Error(`We couldn't find "${city}". Try another city.`), {
      status: 404,
    });
  }

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
    timezone: "auto",
    forecast_days: "5",
  });

  const forecast = await fetchJson(forecastUrl);
  const currentHour = forecast.hourly.time.indexOf(
    forecast.current.time.slice(0, 13),
  );
  const hourlyStart = currentHour >= 0 ? currentHour : 0;

  return {
    location: {
      name: location.name,
      admin1: location.admin1 || "",
      country: location.country,
      timezone: forecast.timezone,
    },
    current: {
      temperature: forecast.current.temperature_2m,
      feelsLike: forecast.current.apparent_temperature,
      humidity: forecast.current.relative_humidity_2m,
      windSpeed: forecast.current.wind_speed_10m,
      precipitation: forecast.current.precipitation,
      isDay: Boolean(forecast.current.is_day),
      code: forecast.current.weather_code,
      description: WEATHER_CODES[forecast.current.weather_code] || "Unknown",
      time: forecast.current.time,
    },
    hourly: forecast.hourly.time
      .slice(hourlyStart, hourlyStart + 8)
      .map((time, index) => {
        const hourIndex = hourlyStart + index;
        const code = forecast.hourly.weather_code[hourIndex];

        return {
          time,
          temperature: forecast.hourly.temperature_2m[hourIndex],
          precipitationProbability:
            forecast.hourly.precipitation_probability[hourIndex],
          code,
          description: WEATHER_CODES[code] || "Unknown",
        };
      }),
    daily: forecast.daily.time.map((date, index) => {
      const code = forecast.daily.weather_code[index];

      return {
        date,
        high: forecast.daily.temperature_2m_max[index],
        low: forecast.daily.temperature_2m_min[index],
        sunrise: forecast.daily.sunrise[index],
        sunset: forecast.daily.sunset[index],
        code,
        description: WEATHER_CODES[code] || "Unknown",
      };
    }),
    units: {
      temperature: forecast.current_units.temperature_2m,
      windSpeed: forecast.current_units.wind_speed_10m,
    },
  };
}

module.exports = { getWeatherForCity };
