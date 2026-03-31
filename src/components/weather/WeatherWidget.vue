<script setup>
import { ref, onMounted } from 'vue'

// --- Reactive State ---
const temperature = ref(null)
const advisoryQuote = ref('Checking live conditions...')
const weatherIcon = ref('cloud')
const iconGradient = ref('grad-white')
const isLoading = ref(true)
const locationDisplay = ref('Detecting location...')
const isLocationBlocked = ref(false) // Tracks if location was denied/failed

/**
 * DETERMINES ICON AND ADVICE BASED ON WEATHER CODE AND TEMPERATURE
 */
const updateUIFeedback = (code, temp) => {
  if (code >= 61 && code <= 67) {
    weatherIcon.value = 'rainy'
    iconGradient.value = 'grad-gray'
    advisoryQuote.value = 'Flood Alert: Monitor rose pots for waterlogging.'
  } else if (temp >= 30) {
    weatherIcon.value = 'wb_sunny'
    iconGradient.value = 'grad-orange'
    advisoryQuote.value = 'Heat Warning: Deep hydration required at the base.'
  } else if (temp <= 2) {
    weatherIcon.value = 'snowflake'
    iconGradient.value = 'grad-ice'
    advisoryQuote.value = 'Deep Freeze: Ensure rose roots are well protected.'
  } else if (code <= 3 && temp >= 15 && temp <= 24) {
    weatherIcon.value = 'wb_sunny'
    iconGradient.value = 'grad-yellow'
    advisoryQuote.value = 'Perfect Day for Planting: Ideal for establishing new roses.'
  } else if (code <= 3 && temp >= 8 && temp <= 14) {
    weatherIcon.value = 'partly_cloudy_day'
    iconGradient.value = 'grad-yellow'
    advisoryQuote.value = 'Pruning Window: Help roses conserve energy for spring.'
  } else {
    weatherIcon.value = 'cloud'
    iconGradient.value = 'grad-white'
    advisoryQuote.value = 'Fair Conditions: Proceed with standard garden maintenance.'
  }
}

/**
 * WEATHER FETCH WITH CACHING & GEOLOCATION LOGIC
 */
const fetchWeather = async () => {
  // Use v3 cache to reset previous states
  const CACHE_KEY = 'weather_cache_v3'
  const cachedData = localStorage.getItem(CACHE_KEY)

  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData)
    if (Date.now() - timestamp < 30 * 60 * 1000) {
      temperature.value = data.temp
      locationDisplay.value = data.city
      isLocationBlocked.value = data.isBlocked // Load blocked state from cache
      updateUIFeedback(data.code, data.temp)
      isLoading.value = false
      return
    }
  }

  let lat = -37.814
  let lon = 144.9633
  locationDisplay.value = 'Find Current Location...'

  try {
    if ('geolocation' in navigator) {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('Geolocation took too long.')
          isLocationBlocked.value = true // Trigger blocked state on timeout
          resolve()
        }, 10000)

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            clearTimeout(timeout)
            lat = pos.coords.latitude
            lon = pos.coords.longitude
            isLocationBlocked.value = false // Ensure it's false on success

            try {
              const geoRes = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
              )
              const geoData = await geoRes.json()
              const city = geoData.city || geoData.locality || geoData.principalSubdivision
              locationDisplay.value = `${city}, ${geoData.countryCode}`
            } catch (err) {
              console.error('Geocoding failed:', err)
              locationDisplay.value = 'Current Location'
            }
            resolve()
          },
          (err) => {
            clearTimeout(timeout)
            console.warn('Geolocation Error:', err.message)
            isLocationBlocked.value = true // Trigger blocked state on error/denial
            resolve()
          },
          { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 },
        )
      })
    } else {
      isLocationBlocked.value = true // Trigger if browser doesn't support geolocation
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
    )
    if (!response.ok) throw new Error('API Error')

    const data = await response.json()
    const currentTemp = Math.round(data.current_weather.temperature)
    const currentCode = data.current_weather.weathercode

    temperature.value = currentTemp
    updateUIFeedback(currentCode, currentTemp)

    // Save to cache including the blocked state
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: {
          temp: currentTemp,
          code: currentCode,
          city: locationDisplay.value,
          isBlocked: isLocationBlocked.value, // Save state to cache
        },
      }),
    )
  } catch (error) {
    console.error('Weather Fetch Error:', error)
    advisoryQuote.value = 'Gardening advisory unavailable.'
    weatherIcon.value = 'cloud_off'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchWeather)
</script>

<template>
  <div
    class="card border-1 shadow-lg rounded-4 w-100 frosted-glass animate-fade-up"
    style="padding: 1.6rem"
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="container-fluid m-0 p-0">
      <div class="d-flex flex-nowrap align-items-center justify-content-between gap-2 gap-lg-4">
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

        <div
          class="text-end flex-shrink-0 flex-wrap flex-column align-items-start justify-content-between"
        >
          <div v-if="isLoading" class="spinner-border text-muted" role="status">
            <span class="visually-hidden">Loading weather...</span>
          </div>
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
              {{ temperature }}
            </div>
            <div class="fw-bolder text-secondary fs-2 lh-md" aria-label="degrees Celsius">
              &deg;C
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styling for the fallback location tag */
/* .blocked-badge {
  display: block;
  text-shadow: none;
} */

/* AAA-Compliant Gradients applied strictly to the Material Icon text */
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
