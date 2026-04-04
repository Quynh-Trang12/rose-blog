<script>
/**
 * ==========================================
 * COMPONENT: WeatherWidget.vue
 * ==========================================
 * Description:
 * A live gardening weather assistant. Geolocates the user (with Melbourne
 * fallback), fetches real-time weather data via a dedicated API service,
 * and provides tailored gardening advice based on current conditions.
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
      // Explanation: Separate location status tracking ('loading' | 'blocked' | 'resolved').
      locationStatus: 'loading',
      // Explanation: The human-readable location string (city, country code).
      locationDisplay: '',
      // Explanation: Fallback coordinates for Melbourne, Australia (User's special request).
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
     * Two-phase fetch strategy.
     * Phase 1: Load from cache immediately if present.
     * Phase 2: Perform geolocation and API fetch in the background to update cache.
     */
    async fetchWeather() {
      const CACHE_KEY = 'weather_cache_v5'
      const cachedData = localStorage.getItem(CACHE_KEY)
      const TTL = 30 * 60 * 1000 // 30 minutes

      // Phase 1: Immediate cache deployment
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData)
          if (Date.now() - parsed.timestamp < TTL) {
            this.temperature = parsed.temp
            this.locationDisplay = parsed.city
            this.locationStatus = 'resolved'
            this.updateUIFeedback(parsed.code, parsed.temp)
            // NOTE: Continuing to Phase 2 in the background (no return early)
          }
        } catch (e) {
          console.error('Cache parse error', e)
        }
      }

      // Phase 2: Background Refresh (does not block Phase 1 from showing)
      this.refreshWeatherData(CACHE_KEY)
    },

    async refreshWeatherData(cacheKey) {
      let lat = this.FALLBACK_LAT
      let lon = this.FALLBACK_LON
      let status = 'resolved'

      try {
        const position = await new Promise((resolve, reject) => {
          if (!('geolocation' in navigator)) return reject()
          const timeout = setTimeout(() => reject(), 6000)
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timeout)
              resolve(pos)
            },
            (err) => {
              clearTimeout(timeout)
              reject(err)
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
          )
        })
        lat = position.coords.latitude
        lon = position.coords.longitude
        this.locationDisplay = await fetchCityName(lat, lon)
      } catch (err) {
        // Geolocation failed or blocked
        status = 'blocked'
        this.locationDisplay = this.FALLBACK_CITY
      }

      try {
        const weather = await fetchCurrentWeather(lat, lon)
        const temp = Math.round(weather.temperature)
        const code = weather.weathercode

        // Update UI
        if (this.locationStatus === 'loading' || status === 'resolved') {
          this.temperature = temp
          this.locationStatus = status
          this.updateUIFeedback(code, temp)
        }

        // Requirement (Issue 11): Cache ONLY weather data
        const cachePayload = {
          timestamp: Date.now(),
          temp: temp,
          code: code,
          city: this.locationDisplay,
        }
        localStorage.setItem(cacheKey, JSON.stringify(cachePayload))
      } catch (err) {
        console.error('Weather Background Refresh Error:', err)
        if (this.locationStatus === 'loading') {
          this.advisoryQuote = 'Live weather currently unavailable.'
          this.locationStatus = 'blocked'
        }
      }
    },
  },

  mounted() {
    this.fetchWeather()
  },
}
</script>

<template>
  <div
    class="card border-1 shadow-lg rounded-4 w-100 frosted-glass animate-fade-up weather-card"
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="container-fluid m-0 p-0">
      <div class="d-flex flex-nowrap align-items-center justify-content-between gap-2 gap-lg-3">
        <!-- Status & Advisory -->
        <div
          class="text-start flex-grow-1 flex-wrap flex-column align-items-end justify-content-around"
        >
          <p class="text-uppercase fw-bold text-white-50 ls-1 text-xs p-0 m-0">
            Live Gardening Weather
          </p>

          <template v-if="locationStatus === 'loading' && !temperature">
            <span class="text-md text-white-50 fst-italic">Finding Current Location…</span>
          </template>

          <template v-else-if="locationStatus === 'blocked'">
            <div class="d-flex flex-row flex-wrap align-items-center justify-content-start gap-2">
              <span class="fs-5 fw-bold text-primary font-zilla">{{ FALLBACK_CITY }}</span>
              <span
                class="badge bg-secondary bg-opacity-50 text-white text-xs rounded-pill font-roboto py-1 px-2"
                >Access Limited</span
              >
            </div>
          </template>

          <template v-else>
            <span class="fs-5 fw-bolder text-primary fst-italic ls-1 font-zilla">{{
              locationDisplay
            }}</span>
          </template>

          <div class="text-gray-300 w-100 text-sm fw-semibold lh-lg mt-1">
            {{ locationStatus === 'loading' && !temperature ? 'Analyzing data...' : advisoryQuote }}
          </div>
        </div>

        <!-- Visual Feedback -->
        <div
          class="text-end flex-shrink-0 flex-wrap flex-column align-items-start justify-content-center"
        >
          <div
            v-if="locationStatus === 'loading' && !temperature"
            class="spinner-border text-primary opacity-50"
            role="status"
          >
            <span class="visually-hidden">Loading weather...</span>
          </div>

          <div v-else class="d-flex flex-column align-items-center">
            <span
              class="material-symbols-outlined icon-solid weather-icon"
              :class="iconGradient"
              aria-hidden="true"
            >
              {{ weatherIcon }}
            </span>
            <div class="d-flex align-items-baseline gap-1 mt-1">
              <span class="fw-bolder text-secondary fs-3 lh-1">{{ temperature }}</span>
              <span class="fw-bold text-secondary text-md">&deg;C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.weather-card {
  padding: 1.2rem 1.6rem;
}
.weather-icon {
  font-size: 2.4rem;
}

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
  filter: drop-shadow(0 0 4px rgba(255, 203, 5, 0.5));
}
.grad-orange {
  background: linear-gradient(135deg, #f25c54, #f7b267);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 4px rgba(242, 92, 84, 0.5));
}
.grad-gray {
  background: linear-gradient(135deg, #9a9b9b, #f1f1f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 4px rgba(154, 155, 155, 0.5));
}
.grad-ice {
  background: radial-gradient(#96cff1, #e5f2f9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 4px rgba(150, 207, 241, 0.5));
}
.grad-white {
  background: linear-gradient(135deg, #e0e0e0, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 4px rgba(224, 224, 224, 0.5));
}

.ls-1 {
  letter-spacing: 0.05rem;
}
</style>
