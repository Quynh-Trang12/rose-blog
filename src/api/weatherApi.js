/**
 * ==========================================
 * FILE: api/weatherApi.js
 * ==========================================
 * Description:
 * Dedicated API service layer for all weather-related HTTP requests.
 * Following the week-9 course pattern of separating API logic from
 * component logic. Components import named functions from this file
 * rather than writing fetch() calls inline.
 */

var OPEN_METEO_BASE = 'https://api.open-meteo.com/v1'
var BIGDATACLOUD_BASE = 'https://api.bigdatacloud.net/data'

/**
 * Fetches current weather data for a given coordinate pair.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Resolves to the current_weather object from Open-Meteo
 */
export function fetchCurrentWeather(lat, lon) {
  return fetch(
    OPEN_METEO_BASE + '/forecast?latitude=' + lat + '&longitude=' + lon + '&current_weather=true',
  )
    .then(function (res) {
      // Explanation: Check if server response was successful.
      if (!res.ok) throw new Error('Weather API error: ' + res.status)
      return res.json()
    })
    .then(function (data) {
      // Explanation: Returns the specific weather data payload.
      return data.current_weather
    })
}

/**
 * Reverse-geocodes a coordinate pair to a human-readable city display string.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<string>} Resolves to a string e.g. "Melbourne, AU"
 */
export function fetchCityName(lat, lon) {
  return fetch(
    BIGDATACLOUD_BASE +
      '/reverse-geocode-client?latitude=' +
      lat +
      '&longitude=' +
      lon +
      '&localityLanguage=en',
  )
    .then(function (res) {
      // Explanation: Check if geocoding service response was successful.
      if (!res.ok) throw new Error('Geocoding API error: ' + res.status)
      return res.json()
    })
    .then(function (data) {
      // Explanation: Attempts to find the best local name from the response object.
      var city = data.city || data.locality || data.principalSubdivision
      return city + ', ' + data.countryCode
    })
}
