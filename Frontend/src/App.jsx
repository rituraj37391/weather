import { useEffect, useState } from 'react'

function WeatherIcon({ code, isDay = true, className = '' }) {
  let icon = '☀️'
  if ([1, 2].includes(code)) icon = isDay ? '🌤️' : '☁️'
  if (code === 3) icon = '☁️'
  if ([45, 48].includes(code)) icon = '🌫️'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) icon = '🌧️'
  if ([71, 73, 75, 77, 85, 86].includes(code)) icon = '🌨️'
  if ([95, 96, 99].includes(code)) icon = '⛈️'
  if (code === 0 && !isDay) icon = '🌙'

  return <span aria-hidden="true" className={className}>{icon}</span>
}

function formatClock(value) {
  const hour = Number(value.slice(11, 13))
  return `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`
}

function formatDay(value) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(
    new Date(`${value}T12:00:00`),
  )
}

function App() {
  const [city, setCity] = useState('New Delhi')
  const [search, setSearch] = useState('New Delhi')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadWeather() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(
          `/api/weather?city=${encodeURIComponent(city)}`,
          { signal: controller.signal },
        )
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Could not load weather.')
        setWeather(data)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Could not connect to the weather service.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadWeather()
    return () => controller.abort()
  }, [city])

  function handleSearch(event) {
    event.preventDefault()
    const cityName = search.trim()
    if (cityName) setCity(cityName)
  }

  return (
    <main className="min-h-screen px-4 pb-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between py-6 sm:py-8">
          <a href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight">
            <span className="grid size-10 place-items-center rounded-2xl bg-sky-400/15 text-xl">☀</span>
            <span>sky<span className="text-sky-300">cast</span></span>
          </a>
          <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 sm:inline-flex">
            WEATHER, MADE SIMPLE
          </span>
        </header>

        <section className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-sky-300">Your daily forecast</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Weather around you</h1>
          </div>
          <form onSubmit={handleSearch} className="flex w-full gap-2 sm:max-w-sm">
            <label htmlFor="city-search" className="sr-only">Search city</label>
            <input
              id="city-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search a city..."
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/60 focus:ring-2 focus:ring-sky-300/20"
            />
            <button
              type="submit"
              disabled={loading || !search.trim()}
              className="rounded-2xl bg-sky-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Search
            </button>
          </form>
        </section>

        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-5 py-4 text-sm text-rose-100">
            {error} Check that the backend is running, then try again.
          </div>
        )}

        {loading && !weather ? (
          <div aria-label="Loading weather" className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="h-80 animate-pulse rounded-[2rem] bg-white/[0.06]" />
            <div className="h-80 animate-pulse rounded-[2rem] bg-white/[0.06]" />
          </div>
        ) : weather ? (
          <>
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-6 shadow-2xl shadow-blue-950/30 sm:p-9">
              <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-24 size-80 rounded-full bg-white/10 blur-2xl" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 left-1/3 size-72 rounded-full bg-indigo-400/20 blur-3xl" />
              <div className="relative grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
                <div>
                  <p className="text-sm font-medium text-sky-100/85">CURRENT WEATHER</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                    {weather.location.name}
                    {weather.location.admin1 ? `, ${weather.location.admin1}` : ''}
                  </h2>
                  <p className="mt-1 text-sm text-sky-100/75">{weather.location.country}</p>
                  <div className="mt-7 flex items-center gap-5">
                    <WeatherIcon code={weather.current.code} isDay={weather.current.isDay} className="text-6xl sm:text-7xl" />
                    <div>
                      <p className="text-6xl font-light tracking-tighter sm:text-7xl">
                        {Math.round(weather.current.temperature)}°
                      </p>
                      <p className="mt-2 text-base text-sky-100">{weather.current.description}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm text-sky-100/80">
                  Feels like {Math.round(weather.current.feelsLike)}° · {new Intl.DateTimeFormat('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  }).format(new Date(`${weather.current.time.slice(0, 10)}T12:00:00`))}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <WeatherDetail label="Humidity" value={`${weather.current.humidity}%`} icon="💧" />
                  <WeatherDetail label="Wind" value={`${Math.round(weather.current.windSpeed)} ${weather.units.windSpeed}`} icon="💨" />
                  <WeatherDetail label="Precipitation" value={`${weather.current.precipitation} mm`} icon="🌧️" />
                  <WeatherDetail label="Sunrise" value={weather.daily[0] ? formatClock(weather.daily[0].sunrise) : '—'} icon="🌅" />
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-[2rem] border border-white/[0.08] bg-white/[0.04] p-5 sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Next hours</h2>
                  <p className="mt-1 text-sm text-slate-400">A quick look at what’s ahead</p>
                </div>
                <span className="text-xl" aria-hidden="true">◷</span>
              </div>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                {weather.hourly.map((hour, index) => (
                  <div key={hour.time} className={`rounded-2xl px-2 py-4 text-center ${index === 0 ? 'bg-sky-300/10 ring-1 ring-sky-300/20' : 'bg-white/[0.035]'}`}>
                    <p className="text-xs text-slate-400">{index === 0 ? 'Now' : formatClock(hour.time)}</p>
                    <WeatherIcon code={hour.code} className="my-3 block text-2xl" />
                    <p className="text-lg font-semibold">{Math.round(hour.temperature)}°</p>
                    <p className="mt-1 text-[11px] text-sky-300">{hour.precipitationProbability}%</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-[2rem] border border-white/[0.08] bg-white/[0.04] p-5 sm:p-7">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">5-day forecast</h2>
                <p className="mt-1 text-sm text-slate-400">Plan a little further ahead</p>
              </div>
              <div className="divide-y divide-white/[0.07]">
                {weather.daily.map((day, index) => (
                  <div key={day.date} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3.5 first:pt-1 last:pb-1 sm:grid-cols-[1fr_1.5fr_1fr]">
                    <p className="text-sm font-medium">{index === 0 ? 'Today' : formatDay(day.date)}</p>
                    <div className="flex items-center gap-3">
                      <WeatherIcon code={day.code} className="text-xl" />
                      <span className="hidden text-xs text-slate-400 sm:inline">{day.description}</span>
                    </div>
                    <div className="flex items-center justify-end gap-3 text-sm">
                      <span className="font-semibold">{Math.round(day.high)}°</span>
                      <span className="text-slate-500">{Math.round(day.low)}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : !error ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-slate-300">
            Search for a city to see its weather.
          </div>
        ) : null}

        <footer className="py-8 text-center text-xs text-slate-500">
          Weather data by Open-Meteo · Temperatures in Celsius
        </footer>
      </div>
    </main>
  )
}

function WeatherDetail({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.1] p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs text-sky-100/75">{label}</p>
        <span aria-hidden="true">{icon}</span>
      </div>
      <p className="mt-3 text-lg font-semibold">{value}</p>
    </div>
  )
}

export default App
