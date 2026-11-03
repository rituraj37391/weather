const { getWeatherForCity } = require("../services/weather.service");

async function getWeather(req, res, next) {
  const city = typeof req.query.city === "string" ? req.query.city.trim() : "";

  if (!city || city.length > 100) {
    return res.status(400).json({
      error: "Please provide a city name between 1 and 100 characters.",
    });
  }

  try {
    const weather = await getWeatherForCity(city);
    return res.status(200).json(weather);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getWeather };
