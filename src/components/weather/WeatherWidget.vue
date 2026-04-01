<script>
/**
 * ==========================================
 * COMPONENT: WeatherWidget.vue
 * ==========================================
 * Description:
 * A live gardening weather assistant. It geolocates the user (with fallback),
 * fetches real-time weather data via a dedicated API service, and provides
 * tailored gardening advice based on the current conditions.
 */
import { fetchCurrentWeather, fetchCityName } from '@/api/weatherApi.js'

export default {
  name: 'WeatherWidget',

  // ==========================================
  // DATA
  // ==========================================
  data: function () {
    return {
      temperature: null,
      advisoryQuote: 'Checking live conditions...',
      weatherIcon: 'cloud',
      iconGradient: 'grad-white',
      isLoading: true,
      locationDisplay: 'Detecting location...',
      // Explanation: Tracks if geolocation was denied by the user or failed.
      isLocationBlocked: false,
    }
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    /**
     * Determines which icon and gardening advice to show based on weather data.
     * @param {number} code - WMO Weather interpretation code
     * @param {number} temp - Temperature in Celsius
     */
    updateUIFeedback: function (code, temp) {
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
     * Orchestrates the weather fetching process including geolocation and caching.
     * Explanation: Uses the weatherApi service for network calls.
     */
    fetchWeather: function () {
      var self = this
      var CACHE_KEY = 'weather_cache_v4' // Incremented version for refactor
      var cachedData = localStorage.getItem(CACHE_KEY)

      // 1. Check for valid cache (less than 30 minutes old)
      if (cachedData) {
        var parsed = JSON.parse(cachedData)
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          this.temperature = parsed.data.temp
          this.locationDisplay = parsed.data.city
          this.isLocationBlocked = parsed.data.isBlocked
          this.updateUIFeedback(parsed.data.code, parsed.data.temp)
          this.isLoading = false
          return
        }
      }

      // Default coordinates (Melbourne, AU)
      var lat = -37.814
      var lon = 144.9633
      this.locationDisplay = 'Find Current Location...'

      // 2. Geolocation logic
      var getGeoLocation = new Promise(function (resolve) {
        if (!('geolocation' in navigator)) {
          self.isLocationBlocked = true
          return resolve()
        }

        var timeout = setTimeout(function () {
          self.isLocationBlocked = true
          resolve()
        }, 8000)

        navigator.geolocation.getCurrentPosition(
          function (pos) {
            clearTimeout(timeout)
            lat = pos.coords.latitude
            lon = pos.coords.longitude
            self.isLocationBlocked = false
            // Fetch city name from service
            fetchCityName(lat, lon)
              .then(function (city) {
                self.locationDisplay = city
                resolve()
              })
              .catch(function () {
                self.locationDisplay = 'Current Location'
                resolve()
              })
          },
          function () {
            clearTimeout(timeout)
            self.isLocationBlocked = true
            resolve()
          },
          { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 },
        )
      })

      // 3. Chain weather fetch after geolocation attempt
      getGeoLocation
        .then(function () {
          return fetchCurrentWeather(lat, lon)
        })
        .then(function (weather) {
          // Explanation: Update component state with API results
          var currentTemp = Math.round(weather.temperature)
          var currentCode = weather.weathercode
          self.temperature = currentTemp
          self.updateUIFeedback(currentCode, currentTemp)

          // 4. Update cache
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              data: {
                temp: currentTemp,
                code: currentCode,
                city: self.locationDisplay,
                isBlocked: self.isLocationBlocked,
              },
            }),
          )
        })
        .catch(function (err) {
          console.error('Weather Fetch Error:', err)
          self.advisoryQuote = 'Gardening advisory unavailable.'
          self.weatherIcon = 'cloud_off'
        })
        .finally(function () {
          self.isLoading = false
        })
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  mounted: function () {
    // Explanation: Trigger weather lookup immediately on component mount.
    this.fetchWeather()
  },
}
</script>

<template>
  <!-- Main Weather Card -->
  <div
    class="card border-1 shadow-lg rounded-4 w-100 frosted-glass animate-fade-up"
    style="padding: 1.6rem"
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="container-fluid m-0 p-0">
      <div class="d-flex flex-nowrap align-items-center justify-content-between gap-2 gap-lg-4">
        <!-- Text Content Area -->
        <div
          class="text-start flex-grow-1 flex-wrap flex-column align-items-end justify-content-around"
        >
          <p class="text-uppercase fw-bold text-white-50 ls-1 m-0 p-0 text-xs">
            Live Gardening Weather
          </p>

          <div
            class="fs-5 fw-bolder text-primary fst-italic ls-1 m-0 p-0"
            style="text-shadow: 0 0 3px var(--color-primary); font-family: 'Zilla Slab'"
          >
            {{ locationDisplay }}
          </div>

          <!-- Location Access Warning (Conditional) -->
          <p
            v-if="isLocationBlocked"
            class="text-md fw-normal text-secondary m-0 p-0"
            style="font-family: 'Roboto Condensed'"
          >
            Location Access Blocked
          </p>

          <div class="text-gray-300 w-100 text-sm fw-semibold lh-lg m-0 p-0">
            {{ isLoading ? 'Analyzing data...' : advisoryQuote }}
          </div>
        </div>

        <!-- Visual Feedback Area (Icon & Temp) -->
        <div
          class="text-end flex-shrink-0 flex-wrap flex-column align-items-start justify-content-between"
        >
          <!-- Loading Spinner -->
          <div v-if="isLoading" class="spinner-border text-muted" role="status">
            <span class="visually-hidden">Loading weather...</span>
          </div>

          <!-- Weather Visuals -->
          <template v-else>
            <div
              class="material-symbols-outlined icon-solid top-0"
              style="font-size: 2.3rem"
              :class="iconGradient"
              aria-hidden="true"
            >
              {{ weatherIcon }}
            </div>
            <div class="fw-bolder text-secondary fs-2 lh-md" aria-label="temperature">
              {{ temperature }}&deg;C
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* AAA-Compliant Gradients applied strictly to the Material Icon text for maximum contrast */
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
