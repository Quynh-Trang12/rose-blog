import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { roses as roseData } from '@/data/roses.js'

export const useRoseStore = defineStore('roses', () => {
  const roses = ref([...roseData])
  const filters = ref({ type: 'All', color: 'All', fragrance: 'All', search: '' })

  const types       = computed(() => ['All', ...new Set(roses.value.map((r) => r.type))])
  const colors      = computed(() => ['All', ...new Set(roses.value.map((r) => r.color))])
  const fragrances  = computed(() => ['All', ...new Set(roses.value.map((r) => r.fragrance))])

  const filteredRoses = computed(() => {
    return roses.value.filter((r) => {
      const typeMatch      = filters.value.type === 'All'      || r.type === filters.value.type
      const colorMatch     = filters.value.color === 'All'     || r.color === filters.value.color
      const fragranceMatch = filters.value.fragrance === 'All' || r.fragrance === filters.value.fragrance
      const searchMatch    = !filters.value.search ||
        r.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
        r.description.toLowerCase().includes(filters.value.search.toLowerCase())
      return typeMatch && colorMatch && fragranceMatch && searchMatch
    })
  })

  function setFilter(key, value) {
    filters.value[key] = value
  }

  function clearFilters() {
    filters.value = { type: 'All', color: 'All', fragrance: 'All', search: '' }
  }

  return { roses, filters, types, colors, fragrances, filteredRoses, setFilter, clearFilters }
})
