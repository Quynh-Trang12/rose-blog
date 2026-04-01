<script>
/**
 * ==========================================
 * COMPONENT: NewsSearchBar.vue
 * ==========================================
 * Description:
 * A slide-down modal component that provides advanced filtering options
 * for the news article list, including date ranges, categories,
 * and keyword-based search.
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
  data: function () {
    return {
      // Explanation: Local filter state synced from the store when the modal opens.
      localFilters: {
        date: 'all',
        category: 'all',
        keyword: '',
      },
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapState('news', ['filters']),
  },

  // ==========================================
  // WATCH
  // ==========================================
  watch: {
    /**
     * When the modal opens, synchronize the local filter state with the global store.
     */
    modelValue: function (val) {
      if (val) {
        this.localFilters = { ...this.filters }
      }
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('news', ['applyFilters']),

    /**
     * Closes the filter modal by emitting a false value for v-model.
     */
    close: function () {
      this.$emit('update:modelValue', false)
    },

    /**
     * Submits the locally modified filters to the Vuex news store.
     */
    handleApplyFilters: function () {
      // Explanation: Dispatches the local filter state to the news module action.
      this.applyFilters(this.localFilters)
      this.close()
    },

    /**
     * Helper to check if a category is currently selected in the local filter state.
     * @param {string} category - Category name to check
     * @returns {boolean}
     */
    isCategoryActive: function (category) {
      return this.localFilters.category === category
    },

    /**
     * Updates the local category selection.
     * @param {string} category - Category name
     */
    setCategory: function (category) {
      this.localFilters.category = category
    },
  },
}
</script>

<template>
  <transition name="drop-down">
    <div
      v-if="modelValue"
      class="news-filter-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      <div class="news-filter-modal frosted-glass rounded-4 shadow-lg p-4" v-click-outside="close">
        <!-- Modal Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 id="filter-modal-title" class="mb-0 fw-bold" style="font-family: 'Zilla Slab'">
            Filter & Search
          </h4>
          <button @click="close" class="btn-close" aria-label="Close filters"></button>
        </div>

        <div class="d-flex flex-column gap-4">
          <!-- DATE FILTER SECTION -->
          <div>
            <label class="text-xs fw-bold text-uppercase ls-1 text-muted mb-2">Date</label>
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

          <!-- CATEGORY FILTER SECTION -->
          <div>
            <label class="text-xs fw-bold text-uppercase ls-1 text-muted mb-2">Category</label>
            <div class="d-flex flex-wrap gap-2">
              <!-- Explanation: Category badge buttons that toggle local selection -->
              <button
                class="btn btn-sm rounded-pill px-3 py-1 fw-medium"
                :class="isCategoryActive('all') ? 'btn-primary shadow-sm' : 'btn-outline-secondary'"
                @click="setCategory('all')"
              >
                All
              </button>
              <button
                class="btn btn-sm rounded-pill px-3 py-1 fw-medium"
                :class="isCategoryActive('Health & Remedies') ? 'btn-primary shadow-sm' : 'btn-outline-secondary'"
                @click="setCategory('Health & Remedies')"
              >
                Health & Remedies
              </button>
              <button
                class="btn btn-sm rounded-pill px-3 py-1 fw-medium"
                :class="isCategoryActive('Garden Stories') ? 'btn-primary shadow-sm' : 'btn-outline-secondary'"
                @click="setCategory('Garden Stories')"
              >
                Garden Stories
              </button>
              <button
                class="btn btn-sm rounded-pill px-3 py-1 fw-medium"
                :class="isCategoryActive('Life & Reflections') ? 'btn-primary shadow-sm' : 'btn-outline-secondary'"
                @click="setCategory('Life & Reflections')"
              >
                Life & Reflections
              </button>
            </div>
          </div>

          <!-- KEYWORD SEARCH SECTION -->
          <div>
            <label class="text-xs fw-bold text-uppercase ls-1 text-muted mb-2">Keywords</label>
            <div class="input-group shadow-sm rounded-pill overflow-hidden bg-white">
              <span class="input-group-text bg-white border-0 pe-1">
                <span class="material-symbols-outlined text-muted">search</span>
              </span>
              <input
                type="text"
                class="form-control border-0 ps-1"
                placeholder="Search articles..."
                v-model="localFilters.keyword"
                @keyup.enter="handleApplyFilters"
                aria-label="Search keywords"
              />
              <button class="btn btn-primary fw-bold px-4" @click="handleApplyFilters">SEARCH</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/variables-dark';
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';
@import 'bootstrap/scss/utilities';

.news-filter-overlay {
  position: fixed;
  inset: 0;
  z-index: 1055;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 1rem;
}

.news-filter-modal {
  width: 100%;
  max-width: 480px;
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
