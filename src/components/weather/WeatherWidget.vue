<script setup>
import { ref, onMounted } from 'vue'

// --- Reactive State ---
const temperature = ref(null)
const advisoryQuote = ref('Checking live conditions...')
const weatherIcon = ref('cloud')
const iconGradient = ref('text-secondary')
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
  locationDisplay.value = 'Melbourne, AU'

  try {
    if ('geolocation' in navigator) {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Geolocation took too long.")
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
              const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
              const geoData = await geoRes.json()
              const city = geoData.city || geoData.locality || geoData.principalSubdivision
              locationDisplay.value = `${city}, ${geoData.countryCode}`
            } catch (err) {
              console.error("Geocoding failed:", err)
              locationDisplay.value = 'Current Location'
            }
            resolve()
          },
          (err) => {
            clearTimeout(timeout)
            console.warn("Geolocation Error:", err.message)
            isLocationBlocked.value = true // Trigger blocked state on error/denial
            resolve()
          },
          { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }
        )
      })
    } else {
      isLocationBlocked.value = true // Trigger if browser doesn't support geolocation
    }

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
    if (!response.ok) throw new Error('API Error')

    const data = await response.json()
    const currentTemp = Math.round(data.current_weather.temperature)
    const currentCode = data.current_weather.weathercode

    temperature.value = currentTemp
    updateUIFeedback(currentCode, currentTemp)

    // Save to cache including the blocked state
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data: {
        temp: currentTemp,
        code: currentCode,
        city: locationDisplay.value,
        isBlocked: isLocationBlocked.value // Save state to cache
      }
    }))

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
    class="card border-0 shadow-lg rounded-4 w-100"
    style="background: rgba(255, 255, 255, 0.22); backdrop-filter: blur(16px); max-width: 310px; padding: 1.8rem;"
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="d-flex align-items-center justify-content-between gap-4">
      <div class="text-start">
        <p
          class="text-uppercase fw-bolder mb-1 text-white-50"
          style="font-size: 0.6rem; letter-spacing: 1px"
        >
          Live Gardening Weather
        </p>

        <h2 class="fs-4 fw-bolder m-0 p-0" style="color: #ea063f; text-shadow: 0 0 3px #ea063f;">
          {{ locationDisplay }}
          <span v-if="isLocationBlocked" class="blocked-badge">
            Location Access Blocked
          </span>
        </h2>
        <p class="mb-0 mt-3 text-light" style="color: #ffd3da; font-size: 0.83rem; font-weight: 650;">
          {{ isLoading ? 'Analyzing data...' : advisoryQuote }}
        </p>
      </div>

      <div class="text-end d-flex flex-column align-items-end justify-content-center">
        <div v-if="isLoading" class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading weather...</span>
        </div>
        <template v-else>
          <span
            class="material-symbols-outlined display-5 mb-1 icon-solid"
            :class="iconGradient"
            aria-hidden="true"
          >
            {{ weatherIcon }}
          </span>
          <p
            class="fw-bolder mb-0"
            style="color: #ffa6c1; line-height: 1; font-size: 2rem;"
            aria-label="degrees Celcius"
          >
            {{ temperature }}
            <span class="visually-hidden">degrees Celsius</span>
            <span aria-hidden="true">°C</span>
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styling for the fallback location tag */
.blocked-badge {
  display: block; /* Puts it on the next line */
  font-size: 0.7rem;
  color: #ffb3c6;
  font-style: italic;
  font-weight: 600;
  text-shadow: none;
  margin-top: 2px;
  letter-spacing: 1px;
}

/* AAA-Compliant Gradients applied strictly to the Material Icon text */
.icon-solid {
  font-variation-settings:
    'FILL' 1,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
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
  filter: drop-shadow(0 0 10px #f4845f);
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
  background: linear-gradient(135deg, #96cff1,  #e8eef1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(3px 2.8px 6.8px #96cff1);
}
</style>
