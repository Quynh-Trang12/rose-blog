<script>
/**
 * ==========================================
 * COMPONENT: NewsSearchBar.vue
 * ==========================================
 * Description:
 * A slide-down modal component that provides advanced filtering options
 * for the news article list. Supports filtering by date, type, color,
 * fragrance, blooming season, strength, thorn level, ideal planting
 * location, and keyword-based search.
 *
 * Enhancements: Escape key closes the filter panel. Active filter count
 * badge. Debounced keyword input via a 300ms watcher (Requirement 1.1).
 *
 * Props: modelValue (Boolean).
 * Emits: update:modelValue.
 */
import { mapState, mapActions } from 'vuex'

export default {
  name: 'NewsSearchBar',

  // ==========================================
  // PROPS
  // ==========================================
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  // ==========================================
  // EMITS
  // ==========================================
  emits: ['update:modelValue'],

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: Local filter state synced from the store when the modal opens.
      localFilters: {
        date: 'all',
        type: [],
        color: [],
        fragrance: [],
        bloomingSeason: [],
        strength: [],
        thornLevel: [],
        idealFor: [],
        keyword: '',
      },

      // Explanation: Timer reference for the 300ms keyword debounce (Req 1.1).
      debounceTimer: null,

      // Explanation: Available options for each filter category.
      typeOptions: ['Bush Rose', 'Climbing Rose', 'Planting Guide', 'Botanical Tips'],
      colorOptions: [
        'Soft Pink',
        'Coral',
        'Orange',
        'Pure White',
        'Deep Crimson',
        'Pink and Red mix',
        'Orange to Yellow',
      ],
      fragranceOptions: [
        'Sweet',
        'Citrus',
        'Fruity',
        'Light',
        'Strong',
        'Rich and intense',
        'Herbal',
      ],
      bloomingSeasonOptions: [
        'Spring to Fall',
        'Summer',
        'Late Spring to Early Fall',
        'Late Spring to Mid Fall',
        'All Season',
        'Spring to Summer',
        'Summer to Fall',
      ],
      strengthOptions: ['3', '4', '5'],
      thornLevelOptions: ['none', 'few', 'many'],
      idealForOptions: ['pot', 'fence', 'hedges'],
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapState('news', ['filters']),

    /**
     * Returns a count of active (non-default) filters to show a badge.
     * @returns {number}
     */
    activeFilterCount() {
      const keys = ['type', 'color', 'fragrance', 'bloomingSeason', 'strength', 'thornLevel', 'idealFor']
      let count = keys.reduce((acc, key) => acc + (this.localFilters[key].length || 0), 0)
      if (this.localFilters.date !== 'all') count++
      if (this.localFilters.keyword) count++
      return count
    },
  },

  // ==========================================
  // WATCH
  // ==========================================
  watch: {
    /**
     * When the modal opens, synchronises local filter state with the global store
     * and attaches the Escape key listener. When it closes, removes the listener.
     * @param {boolean} val - The new modelValue
     */
    modelValue(val) {
      if (val) {
        this.localFilters = { ...this.filters }
        window.addEventListener('keydown', this.handleEscapeKey)
      } else {
        window.removeEventListener('keydown', this.handleEscapeKey)
      }
    },

    /**
     * Debounces the keyword input by 300ms before applying filters (Req 1.1).
     * Explanation: Whenever the keyword changes, we clear the previous timer
     * and set a new one. This ensures we only trigger the store update after
     * the user has stopped typing for 300 milliseconds.
     */
    'localFilters.keyword'(newVal) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        // Trigger applyFilters only if the search input is the trigger
        this.applyFilters({ ...this.localFilters, keyword: newVal })
      }, 300)
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('news', ['applyFilters', 'clearFilters']),

    /**
     * Closes the filter modal by emitting a false value for v-model.
     */
    close() {
      this.$emit('update:modelValue', false)
    },

    /**
     * Submits the locally modified filters to the Vuex news store.
     */
    handleApplyFilters() {
      // Explanation: Dispatches the local filter state to the news module action.
      this.applyFilters(this.localFilters)
      this.close()
    },

    /**
     * Resets all local filters to defaults and dispatches the clear action.
     */
    handleReset() {
      // Explanation: Reset local state to all defaults.
      this.localFilters = {
        date: 'all',
        type: [],
        color: [],
        fragrance: [],
        bloomingSeason: [],
        strength: [],
        thornLevel: [],
        idealFor: [],
        keyword: '',
      }
      // Explanation: Dispatch clearFilters to the Vuex store as well.
      this.clearFilters()
      this.close()
    },

    /**
     * Helper to format display labels for filter pills.
     * @param {string} value - The raw filter value
     * @returns {string} The formatted display label
     */
    formatLabel(value) {
      if (value === 'all') return 'All'
      if (value === 'pot') return 'In Pot'
      if (value === 'fence') return 'Fence'
      if (value === 'hedges') return 'Hedges'
      if (value === 'none') return 'None'
      if (value === 'few') return 'Few'
      if (value === 'many') return 'Many'
      return value
    },

    /**
     * Toggles a value within a multi-select filter array.
     * @param {string} key - The filter category key
     * @param {string} value - The value to add or remove
     */
    toggleFilter(key, value) {
      const arr = [...this.localFilters[key]]
      const index = arr.indexOf(value)
      if (index > -1) {
        arr.splice(index, 1)
      } else {
        arr.push(value)
      }
      this.localFilters[key] = arr
    },

    /**
     * Handles the Escape key to close the filter panel (Req 12).
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleEscapeKey(event) {
      if (event.key === 'Escape') {
        this.close()
      }
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  unmounted() {
    // Explanation: Safety cleanup to prevent memory leaks and timers.
    window.removeEventListener('keydown', this.handleEscapeKey)
    clearTimeout(this.debounceTimer)
  },
}
</script>

<template>
  <transition name="drop-down">
    <div
      v-if="modelValue"
      class="news-filter-overlay position-fixed inset-0 z-index-filter"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      <div class="news-filter-modal frosted-glass rounded-4 shadow-lg p-4" v-click-outside="close">
        <!-- Modal Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div class="d-flex align-items-center gap-2">
            <h4 id="filter-modal-title" class="mb-0 fw-bold font-zilla">
              Search & Filter
            </h4>
            <!-- Active Filter Count Badge -->
            <span
              v-if="activeFilterCount > 0"
              class="badge rounded-pill bg-primary text-white text-xs px-2 py-1"
            >
              {{ activeFilterCount }}
            </span>
          </div>
          <button @click="close" class="btn-close" aria-label="Close filters"></button>
        </div>

        <div class="news-filter-scroll d-flex flex-column gap-4">
          <!-- KEYWORD SEARCH SECTION -->
          <div>
            <label class="news-filter-label text-xs fw-bold text-uppercase ls-1 text-muted mb-2">
              Keywords
            </label>
            <div class="input-group shadow-sm rounded-pill overflow-hidden bg-white">
              <span class="input-group-text bg-white border-0 pe-1">
                <span class="material-symbols-outlined text-muted">search</span>
              </span>
              <input
                type="text"
                class="form-control border-0 ps-1"
                placeholder="Search roses..."
                v-model="localFilters.keyword"
                @keyup.enter="handleApplyFilters"
                aria-label="Search keywords"
              />
            </div>
          </div>

          <!-- DATE FILTER SECTION -->
          <div>
            <label class="news-filter-label text-xs fw-bold text-uppercase ls-1 text-muted mb-2">
              Date
            </label>
            <select
              class="form-select rounded-3 bg-dark text-white border-0 py-2 shadow-sm"
              v-model="localFilters.date"
              aria-label="Filter by date"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
          </div>

          <!-- TYPE FILTER SECTION -->
          <div>
            <label class="news-filter-label text-xs fw-bold text-uppercase ls-1 text-muted mb-2">
              Type
            </label>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="opt in typeOptions"
                :key="'type-' + opt"
                class="btn btn-sm rounded-pill px-3 py-1 fw-medium transition-base"
                :class="localFilters.type.includes(opt) ? 'btn-primary shadow-sm' : 'btn-outline-secondary'"
                @click="toggleFilter('type', opt)"
              >
                {{ formatLabel(opt) }}
              </button>
            </div>
          </div>

          <!-- COLOR FILTER SECTION -->
          <div>
            <label class="news-filter-label text-xs fw-bold text-uppercase ls-1 text-muted mb-2">
              Color
            </label>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="opt in colorOptions"
                :key="'color-' + opt"
                class="btn btn-sm rounded-pill px-3 py-1 fw-medium transition-base"
                :class="localFilters.color.includes(opt) ? 'btn-primary shadow-sm' : 'btn-outline-secondary'"
                @click="toggleFilter('color', opt)"
              >
                {{ formatLabel(opt) }}
              </button>
            </div>
          </div>

          <!-- FRAGRANCE FILTER SECTION -->
          <div>
            <label class="news-filter-label text-xs fw-bold text-uppercase ls-1 text-muted mb-2">
              Fragrance
            </label>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="opt in fragranceOptions"
                :key="'frag-' + opt"
                class="btn btn-sm rounded-pill px-3 py-1 fw-medium transition-base"
                :class="localFilters.fragrance.includes(opt) ? 'btn-primary shadow-sm' : 'btn-outline-secondary'"
                @click="toggleFilter('fragrance', opt)"
              >
                {{ formatLabel(opt) }}
              </button>
            </div>
          </div>

          <!-- BLOOMING SEASON FILTER SECTION -->
          <div>
            <label class="news-filter-label text-xs fw-bold text-uppercase ls-1 text-muted mb-2">
              Blooming Season
            </label>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="opt in bloomingSeasonOptions"
                :key="'bloom-' + opt"
                class="btn btn-sm rounded-pill px-3 py-1 fw-medium transition-base"
                :class="localFilters.bloomingSeason.includes(opt) ? 'btn-primary shadow-sm' : 'btn-outline-secondary'"
                @click="toggleFilter('bloomingSeason', opt)"
              >
                {{ formatLabel(opt) }}
              </button>
            </div>
          </div>

          <!-- STRENGTH FILTER SECTION -->
          <div>
            <label class="news-filter-label text-xs fw-bold text-uppercase ls-1 text-muted mb-2">
              Strength
            </label>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="opt in strengthOptions"
                :key="'str-' + opt"
                class="btn btn-sm rounded-pill px-3 py-1 fw-medium transition-base"
                :class="localFilters.strength.includes(opt) ? 'btn-primary shadow-sm' : 'btn-outline-secondary'"
                @click="toggleFilter('strength', opt)"
              >
                {{ opt === 'all' ? 'All' : '⭐'.repeat(Number(opt)) }}
              </button>
            </div>
          </div>

          <!-- THORN LEVEL FILTER SECTION -->
          <div>
            <label class="news-filter-label text-xs fw-bold text-uppercase ls-1 text-muted mb-2">
              Thorn Level
            </label>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="opt in thornLevelOptions"
                :key="'thorn-' + opt"
                class="btn btn-sm rounded-pill px-3 py-1 fw-medium transition-base"
                :class="localFilters.thornLevel.includes(opt) ? 'btn-primary shadow-sm' : 'btn-outline-secondary'"
                @click="toggleFilter('thornLevel', opt)"
              >
                {{ formatLabel(opt) }}
              </button>
            </div>
          </div>

          <!-- IDEAL FOR FILTER SECTION -->
          <div>
            <label class="news-filter-label text-xs fw-bold text-uppercase ls-1 text-muted mb-2">
              Ideal For
            </label>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="opt in idealForOptions"
                :key="'ideal-' + opt"
                class="btn btn-sm rounded-pill px-3 py-1 fw-medium transition-base"
                :class="localFilters.idealFor.includes(opt) ? 'btn-primary shadow-sm' : 'btn-outline-secondary'"
                @click="toggleFilter('idealFor', opt)"
              >
                {{ formatLabel(opt) }}
              </button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="d-flex gap-2 mt-4 pt-3 border-top border-light">
          <button
            class="btn btn-outline-secondary rounded-pill flex-fill fw-medium"
            @click="handleReset"
          >
            Reset All
          </button>
          <button
            class="btn btn-primary rounded-pill flex-fill fw-bold"
            @click="handleApplyFilters"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';

.news-filter-overlay {
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 1rem;
}

.news-filter-modal {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.news-filter-scroll {
  overflow-y: auto;
  flex: 1;
  // Explanation: Custom scrollbar styling for a polished look.
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 10px;
  }
}

.news-filter-label {
  font-family: 'Roboto Condensed', sans-serif;
  display: block;
}

@include media-breakpoint-down(md) {
  .news-filter-overlay {
    justify-content: center;
    align-items: flex-start;
    padding: 0.5rem;
  }
  .news-filter-modal {
    max-width: 100%;
  }
}

.drop-down-enter-active,
.drop-down-leave-active {
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;
}
.drop-down-enter-from,
.drop-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
