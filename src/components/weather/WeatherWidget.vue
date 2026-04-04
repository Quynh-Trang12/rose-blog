<script>
/**
 * ==========================================
 * COMPONENT: WeatherWidget.vue
 * ==========================================
 * Description:
 * A live gardening weather assistant. Geolocates the user (with Melbourne
 * fallback), fetches real-time weather data via a dedicated API service,
 * and provides tailored gardening advice based on current conditions.
 *
 * Fixes (Requirement 10): Introduced a separate locationStatus reactive
 * string ('loading' | 'blocked' | 'resolved') to replace the flawed
 * locationDisplay-as-state approach. The template now renders distinct
 * UI states based on locationStatus rather than string comparison.
 */
import { fetchCurrentWeather, fetchCityName } from '@/api/weatherApi.js'

export default {
  name: 'WeatherWidget',

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: The current temperature in degrees Celsius.
      temperature: null,
      // Explanation: Context-sensitive gardening advice based on weather conditions.
      advisoryQuote: 'Checking live conditions...',
      // Explanation: Material Symbols icon name for the current weather condition.
      weatherIcon: 'cloud',
      // Explanation: CSS class name for the weather icon gradient colour.
      iconGradient: 'grad-white',
      // Explanation: Separate location status tracking — avoids using locationDisplay
      // as a proxy for component state ('loading' | 'blocked' | 'resolved').
      locationStatus: 'loading',
      // Explanation: The human-readable location string (city, country code).
      // Only used when locationStatus === 'resolved'.
      locationDisplay: '',
      // Explanation: Fallback coordinates for Melbourne, Australia.
      FALLBACK_CITY: 'Melbourne, AU',
      FALLBACK_LAT: -37.814,
      FALLBACK_LON: 144.9633,
    }
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    /**
     * Determines which icon and gardening advice to display based on weather data.
     * Explanation: Uses WMO weather interpretation codes and temperature thresholds
     * to select appropriate visual feedback and advisory text.
     * @param {number} code - WMO Weather interpretation code
     * @param {number} temp - Temperature in Celsius
     */
    updateUIFeedback(code, temp) {
      if (code >= 61 && code <= 67) {
        this.weatherIcon = 'rainy'
        this.iconGradient = 'grad-gray'
        this.advisoryQuote = 'Flood Alert: Monitor rose pots for waterlogging.'
      } else if (temp >= 30) {
        this.weatherIcon = 'wb_sunny'
        this.iconGradient = 'grad-orange'
        this.advisoryQuote = 'Heat Warning: Deep hydration required at the base.'
      } else if (temp <= 2) {
        this.weatherIcon = 'snowflake'
        this.iconGradient = 'grad-ice'
        this.advisoryQuote = 'Deep Freeze: Ensure rose roots are well protected.'
      } else if (code <= 3 && temp >= 15 && temp <= 24) {
        this.weatherIcon = 'wb_sunny'
        this.iconGradient = 'grad-yellow'
        this.advisoryQuote = 'Perfect Day for Planting: Ideal for establishing new roses.'
      } else if (code <= 3 && temp >= 8 && temp <= 14) {
        this.weatherIcon = 'partly_cloudy_day'
        this.iconGradient = 'grad-yellow'
        this.advisoryQuote = 'Pruning Window: Help roses conserve energy for spring.'
      } else {
        this.weatherIcon = 'cloud'
        this.iconGradient = 'grad-white'
        this.advisoryQuote = 'Fair Conditions: Proceed with standard garden maintenance.'
      }
    },

    /**
     * Orchestrates the full weather fetching process.
     * Explanation: Checks for cached data first (30-minute TTL), then attempts
     * geolocation, and finally fetches weather data from the Open-Meteo API.
     * Uses async/await for cleaner control flow.
     */
    async fetchWeather() {
      const CACHE_KEY = 'weather_cache_v5'
      const cachedData = localStorage.getItem(CACHE_KEY)

      // 1. Check for valid cache (less than 30 minutes old)
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          // Explanation: Restore all component state from the cached data.
          this.temperature = parsed.data.temp
          this.locationDisplay = parsed.data.city
          // Explanation: Restore locationStatus from cache to maintain correct UI state.
          this.locationStatus = parsed.data.status || 'resolved'
          this.updateUIFeedback(parsed.data.code, parsed.data.temp)
          return
        }
      }

      // 2. Geolocation logic
      let lat = this.FALLBACK_LAT
      let lon = this.FALLBACK_LON

      try {
        const position = await new Promise((resolve, reject) => {
          if (!('geolocation' in navigator)) {
            return reject(new Error('Geolocation not supported'))
          }

          // Explanation: Set an 8-second timeout for geolocation to prevent
          // indefinite waiting if the user ignores the permission prompt.
          const timeout = setTimeout(() => reject(new Error('Geolocation timeout')), 8000)

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timeout)
              resolve(pos)
            },
            (err) => {
              clearTimeout(timeout)
              reject(err)
            },
            { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 },
          )
        })

        // Explanation: Geolocation succeeded — use the real coordinates.
        lat = position.coords.latitude
        lon = position.coords.longitude
        this.locationStatus = 'resolved'

        try {
          // Explanation: Attempt to reverse-geocode the coordinates to a city name.
          this.locationDisplay = await fetchCityName(lat, lon)
        } catch {
          // Explanation: If geocoding fails, use a generic label.
          this.locationDisplay = 'Current Location'
        }
      } catch {
        // Explanation: Geolocation was denied, timed out, or is unsupported.
        // Set status to 'blocked' — the template handles the fallback display.
        this.locationStatus = 'blocked'
      }

      // 3. Fetch weather data from Open-Meteo
      try {
        const weather = await fetchCurrentWeather(lat, lon)
        const currentTemp = Math.round(weather.temperature)
        const currentCode = weather.weathercode
        this.temperature = currentTemp
        this.updateUIFeedback(currentCode, currentTemp)

        // 4. Update cache with status field for proper restoration
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            timestamp: Date.now(),
            data: {
              temp: currentTemp,
              code: currentCode,
              city: this.locationDisplay,
              status: this.locationStatus,
            },
          }),
        )
      } catch (err) {
        console.error('Weather Fetch Error:', err)
        this.advisoryQuote = 'Gardening advisory unavailable.'
        this.weatherIcon = 'cloud_off'
      }
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  mounted() {
    // Explanation: Trigger weather lookup immediately when the component mounts.
    this.fetchWeather()
  },
}
</script>

<template>
  <!-- Explanation: Main weather card with glassmorphism styling and live region for accessibility -->
  <div
    class="card border-1 shadow-lg rounded-4 w-100 frosted-glass animate-fade-up weather-card"
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="container-fluid m-0 p-0">
      <div class="d-flex flex-nowrap align-items-center justify-content-between gap-2 gap-lg-3">
        <!-- Explanation: Text content area — location, status, and advisory -->
        <div
          class="text-start flex-grow-1 flex-wrap flex-column align-items-end justify-content-around"
        >
          <p class="text-uppercase fw-bold text-white-50 ls-1 text-xs p-0 m-0">
            Live Gardening Weather
          </p>

          <!-- Explanation: Location display uses three distinct template blocks
               based on locationStatus (Requirement 10) instead of relying on
               locationDisplay string content -->

          <!-- Loading state -->
          <template v-if="locationStatus === 'loading'">
            <span class="text-md text-white-50 fst-italic">Finding Current Location…</span>
          </template>

          <!-- Blocked state — geolocation was denied or failed -->
          <template v-else-if="locationStatus === 'blocked'">
            <div class="d-flex flex-row flex-wrap align-items-center justify-content-start">
              <span class="fs-5 fw-bold text-primary font-zilla me-1">Melbourne, AU</span>
              <span
                class="badge bg-secondary bg-opacity-50 text-white text-xs rounded-pill font-roboto"
                >Access Blocked</span
              >
            </div>
          </template>

          <!-- Resolved state — real location detected -->
          <template v-else>
            <span class="fs-5 fw-bolder text-primary fst-italic ls-1 font-zilla">
              {{ locationDisplay }}
            </span>
          </template>

          <!-- Explanation: Gardening advisory text — shows loading or condition-specific advice -->
          <div class="text-gray-300 w-100 text-sm fw-semibold lh-lg mt-1">
            {{ locationStatus === 'loading' ? 'Analyzing data...' : advisoryQuote }}
          </div>
        </div>

        <!-- Explanation: Visual feedback area — weather icon and temperature -->
        <div
          class="text-end flex-shrink-0 flex-wrap flex-column align-items-start justify-content-center"
        >
          <!-- Explanation: Loading spinner displayed while data is being fetched -->
          <div v-if="locationStatus === 'loading'" class="spinner-border text-muted" role="status">
            <span class="visually-hidden">Loading weather...</span>
          </div>

          <!-- Explanation: Weather icon and temperature display once data is loaded -->
          <div v-else class="d-flex flex-column">
            <div
              class="material-symbols-outlined icon-solid top-0 weather-icon"
              :class="iconGradient"
              aria-hidden="true"
            >
              {{ weatherIcon }}
            </div>
            <div class="fw-bolder text-secondary fs-3 lh-md" aria-label="temperature">
              {{ temperature }}
            </div>
            <div class="fw-bolder text-secondary fs-3 lh-md" aria-label="degrees Celsius">
              &deg;C
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Explanation: Consistent padding for the weather card */
.weather-card {
  padding: 1.2rem 1.6rem;
}

/* Explanation: Weather icon size */
.weather-icon {
  font-size: 2.4rem;
}

/* Explanation: AAA-Compliant gradients applied to the Material Icon text */
.icon-solid {
  font-variation-settings:
    'FILL' 1,
    'wght' 700,
    'GRAD' 200;
}
.grad-yellow {
  background: linear-gradient(135deg, #ffcb05, #fff9ad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(2.8px -2.6px 6.8px #fff56d);
}
.grad-orange {
  background: linear-gradient(135deg, #f25c54, #f7b267);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 6.8px #ff6e2e);
}
.grad-gray {
  background: linear-gradient(135deg, #9a9b9b, #f1f1f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(1.8px 2.3px 3.3px #e0e1e1);
}
.grad-ice {
  background: radial-gradient(#96cff1, #e5f2f9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 1.6px #bfdff1);
}
.grad-white {
  background: linear-gradient(135deg, #e0e0e0, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(3px 2.8px 6.8px #efefef);
}
</style>
