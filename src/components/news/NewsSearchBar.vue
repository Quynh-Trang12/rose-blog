<script>
/**
 * ==========================================
 * COMPONENT: NewsSearchBar.vue
 * ==========================================
 * Description:
 * A modal-based search and filtering bar. Handles keyword searching
 * with debounce, category selection, and date range filtering.
 *
 * Requirements (Issue 4, Bug G):
 *  - Fixed: Race condition — modal now only closes on @click.self of the backdrop.
 *  - Fixed: Debounce keyword search (500ms) to prevent excessive store updates.
 */
import { mapState, mapActions } from 'vuex'

export default {
  name: 'NewsSearchBar',

  // ==========================================
  // PROPS
  // ==========================================
  props: {
    // Controls the visibility of the absolute-positioned modal.
    modelValue: {
      type: Boolean,
      required: true,
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
      // Explanation: Local buffer for keyword search to handle debouncing.
      localKeyword: '',
      // Explanation: Timeout reference for the debounce timer.
      debounceTimer: null,
      // Explanation: Mapping for category filter buttons.
      categoryOptions: [
        { label: 'All Roses', value: 'all' },
        { label: 'Bush Rose', value: 'Bush Rose' },
        { label: 'Climbing Rose', value: 'Climbing Rose' },
        { label: 'Planting Guide', value: 'Planting Guide' },
        { label: 'Botanical Tips', value: 'Botanical Tips' },
      ],
      // Explanation: Mapping for date filter select options.
      dateOptions: [
        { label: 'All Time', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
      ],
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
     * Requirement (Bug G): Debounce keyword search input.
     */
    localKeyword(newVal) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.setSearchQuery(newVal)
      }, 500)
    },

    /**
     * Sync local keyword with store on mount or reset.
     */
    'filters.keyword'(newVal) {
      if (this.localKeyword !== newVal) {
         this.localKeyword = newVal
      }
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('news', ['applyFilters', 'clearFilters', 'setSearchQuery']),

    /**
     * Requirement (Issue 4): Closes the modal only by clicking the overlay backdrop.
     */
    handleBackdropClick() {
      this.$emit('update:modelValue', false)
    },

    /**
     * Selects a category and closes the modal.
     */
    handleCategorySelect(category) {
      this.applyFilters({ category })
    },

    /**
     * Selects a date range and closes the modal.
     */
    handleDateSelect(e) {
      this.applyFilters({ date: e.target.value })
    },

    /**
     * Resets all search and filter states.
     */
    handleReset() {
      this.localKeyword = ''
      this.clearFilters()
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  mounted() {
    this.localKeyword = this.filters.keyword || ''
    // Add keyboard listener for ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modelValue) this.handleBackdropClick()
    })
  },
}
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <!-- Requirement (Issue 4): backdrop with @click.self -->
      <div
        v-if="modelValue"
        class="search-overlay position-fixed inset-0 d-flex align-items-center justify-content-center z-index-filter"
        @click.self="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        aria-label="Search and Filter"
      >
        <div class="search-modal-container container glassmorphism p-4 p-md-5 rounded-5 shadow-2xl animate-fade-up">
          <!-- Close button -->
          <button class="position-absolute top-0 end-0 m-4 btn btn-link text-dark opacity-50 p-2" @click="handleBackdropClick">
            <span class="material-symbols-outlined fs-3">close</span>
          </button>

          <header class="text-center mb-5">
             <h2 class="display-6 fw-bold font-zilla fst-italic mb-2">Refine Your View</h2>
             <p class="text-muted small text-uppercase ls-wide">Find the perfect bloom</p>
          </header>

          <!-- keyword search input (Requirement Bug G) -->
          <div class="search-input-wrapper position-relative mb-5 mw-600 mx-auto">
             <span class="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ms-4 text-primary fs-3">search</span>
             <input
               v-model="localKeyword"
               type="text"
               class="form-control form-control-lg rounded-pill border-2 p-4 ps-5 fs-5 shadow-sm font-roboto"
               placeholder="Search by rose name or guide content..."
               aria-label="Search keywords"
             />
          </div>

          <div class="row g-5">
            <!-- Category Chips -->
            <div class="col-lg-8">
              <h3 class="h6 fw-bold text-uppercase ls-1 mb-4 text-primary">Botanical Categories</h3>
              <div class="d-flex flex-wrap gap-2">
                <button
                  v-for="cat in categoryOptions"
                  :key="cat.value"
                  class="btn rounded-pill px-4 py-2 fw-bold transition-base border"
                  :class="[filters.category === cat.value ? 'btn-primary' : 'btn-outline-secondary border-light-subtle']"
                  @click="handleCategorySelect(cat.value)"
                  aria-label="'Filter by ' + cat.label"
                >
                  {{ cat.label }}
                </button>
              </div>
            </div>

            <!-- Date & Sort -->
            <div class="col-lg-4">
              <h3 class="h6 fw-bold text-uppercase ls-1 mb-4 text-primary">Blooming Time</h3>
              <select
                class="form-select form-select-lg rounded-pill border-2 p-3 px-4 font-roboto fs-6 mb-4"
                @change="handleDateSelect"
                :value="filters.date"
                aria-label="Filter by date"
              >
                <option v-for="d in dateOptions" :key="d.value" :value="d.value">{{ d.label }}</option>
              </select>

              <button class="btn btn-link text-muted text-decoration-none w-100 fw-bold d-flex align-items-center justify-content-center gap-2" @click="handleReset">
                <span class="material-symbols-outlined text-xs">refresh</span> Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
.search-overlay {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
}

.inset-0 { top: 0; left: 0; right: 0; bottom: 0; }

.search-modal-container {
  max-width: 960px;
  background: white;
  min-height: auto;
}

.search-input-wrapper input {
  border-color: #eee;
  &:focus { border-color: var(--bs-primary); background-color: rgba(226, 6, 95, 0.02); }
}

.ls-wide { letter-spacing: 0.15rem; }

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
}

// Fade transition
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
