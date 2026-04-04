/**
 * ==========================================
 * FILE: api/weatherApi.js
 * ==========================================
 * Description:
 * Dedicated API service layer for all weather-related HTTP requests.
 * Follows the taught pattern of separating API logic from component logic.
 * Components import named functions from this file rather than writing
 * fetch() calls inline.
 *
 * Exports: fetchCurrentWeather, fetchCityName.
 */

// Explanation: Base URLs for the two external APIs used by the weather widget.
const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1'
const BIGDATACLOUD_BASE = 'https://api.bigdatacloud.net/data'

/**
 * Fetches current weather data for a given coordinate pair from Open-Meteo.
 * Explanation: Sends a GET request to the Open-Meteo forecast endpoint
 * with the current_weather parameter enabled. Returns the current_weather
 * object which includes temperature, weathercode, and wind speed.
 * @param {number} lat - Latitude coordinate
 * @param {number} lon - Longitude coordinate
 * @returns {Promise<Object>} Resolves to the current_weather object
 * @throws {Error} If the HTTP response status is not OK
 */
export const fetchCurrentWeather = async (lat, lon) => {
  const res = await fetch(
    `${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
  )

  // Explanation: Check if the server responded with a success status code.
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`)

  const data = await res.json()
  // Explanation: Return only the current_weather payload, discarding metadata.
  return data.current_weather
}

/**
 * Reverse-geocodes a coordinate pair to a human-readable city display string.
 * Explanation: Uses the BigDataCloud reverse geocoding API to convert
 * latitude/longitude into a city name and country code string.
 * @param {number} lat - Latitude coordinate
 * @param {number} lon - Longitude coordinate
 * @returns {Promise<string>} Resolves to a string like "Melbourne, AU"
 * @throws {Error} If the HTTP response status is not OK
 */
export const fetchCityName = async (lat, lon) => {
  const res = await fetch(
    `${BIGDATACLOUD_BASE}/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
  )

  // Explanation: Check if the geocoding service responded successfully.
  if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`)

  const data = await res.json()
  // Explanation: Attempts to find the best locality name from the response.
  // Falls back through city → locality → principalSubdivision.
  const city = data.city || data.locality || data.principalSubdivision
  return `${city}, ${data.countryCode}`
}
