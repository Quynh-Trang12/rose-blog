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
    // Controls visibility
    modelValue: {
      type: Boolean,
      required: true,
    },
    // Controls which view's filters to modify ('news' or 'collection')
    target: {
      type: String,
      default: 'news',
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
    ...mapState('news', ['newsFilters', 'collectionFilters']),
    filters() {
      return this.target === 'news' ? this.newsFilters : this.collectionFilters
    }
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
        this.setSearchQuery({ query: newVal, target: this.target })
      }, 500)
    },

    /**
     * Sync local keyword with store on mount or reset.
     */
    filters: {
      deep: true,
      handler(newVal) {
        if (this.localKeyword !== newVal.keyword) {
           this.localKeyword = newVal.keyword || ''
        }
      }
    }
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
      this.applyFilters({ filters: { category }, target: this.target })
    },

    /**
     * Selects a date range and closes the modal.
     */
    handleDateSelect(e) {
      this.applyFilters({ filters: { date: e.target.value }, target: this.target })
    },

    /**
     * Resets all search and filter states.
     */
    handleReset() {
      this.localKeyword = ''
      this.clearFilters(this.target)
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

          <!-- keyword search input (Requirement Issue 3) -->
          <div class="search-input-wrapper position-relative mb-5 mw-600 mx-auto d-flex align-items-center">
             <input
               v-model="localKeyword"
               type="text"
               class="form-control form-control-lg rounded-pill-start border-2 p-4 ps-4 fs-5 shadow-sm font-roboto border-end-0 flex-grow-1"
               placeholder="Search by rose name or guide content..."
               aria-label="Search keywords"
             />
             <button 
               class="btn btn-primary rounded-pill-end p-3 px-4 shadow-sm h-100 border-2 border-start-0 d-flex align-items-center justify-content-center" 
               style="min-height: 70px;"
               @click="setSearchQuery({ query: localKeyword, target: target })"
             >
                <img src="@/assets/images/search-icon.png" style="width: 28px; height: 28px; object-fit: contain; filter: brightness(0) invert(1);" alt="Search" />
             </button>
          </div>

          <div class="row g-4">
            <!-- Left Side: Basic Categories & Attributes -->
            <div class="col-lg-7">
               <div class="mb-4">
                  <h3 class="h6 fw-bold text-uppercase ls-1 mb-3 text-primary">Botanical Categories</h3>
                  <div class="d-flex flex-wrap gap-2">
                    <button
                      v-for="cat in categoryOptions"
                      :key="cat.value"
                      class="btn btn-sm rounded-pill px-3 py-2 fw-bold transition-base border"
                      :class="[filters.category === cat.value ? 'btn-primary' : 'btn-outline-secondary border-light-subtle']"
                      @click="handleCategorySelect(cat.value)"
                    >
                      {{ cat.label }}
                    </button>
                  </div>
               </div>

               <div class="row g-3">
                  <div class="col-md-6">
                     <label class="small fw-bold text-muted text-uppercase mb-2">Thorn Level</label>
                     <select class="form-select rounded-pill border-2" :value="filters.thornLevel" @change="e => applyFilters({ filters: { thornLevel: e.target.value }, target: target })">
                        <option value="all">All levels</option>
                        <option value="none">Thornless</option>
                        <option value="few">Few thorns</option>
                        <option value="many">Many thorns</option>
                     </select>
                  </div>
                  <div class="col-md-6">
                     <label class="small fw-bold text-muted text-uppercase mb-2">Ideal For</label>
                     <select class="form-select rounded-pill border-2" :value="filters.idealFor" @change="e => applyFilters({ filters: { idealFor: e.target.value }, target: target })">
                        <option value="all">All locations</option>
                        <option value="pot">Pots / Containers</option>
                        <option value="fence">Fences / Trellis</option>
                        <option value="hedges">Hedges / Privacy</option>
                     </select>
                  </div>
               </div>
            </div>

            <!-- Right Side: Specific Attributes -->
            <div class="col-lg-5">
               <div class="mb-4">
                  <h3 class="h6 fw-bold text-uppercase ls-1 mb-3 text-primary">Blooming & Care</h3>
                  <div class="mb-3">
                     <label class="small fw-bold text-muted text-uppercase mb-1">Time Range</label>
                     <select class="form-select rounded-pill border-2" :value="filters.date" @change="handleDateSelect">
                        <option v-for="d in dateOptions" :key="d.value" :value="d.value">{{ d.label }}</option>
                     </select>
                  </div>
                  <div class="mb-3">
                     <label class="small fw-bold text-muted text-uppercase mb-1">Fragrance Strength</label>
                     <select class="form-select rounded-pill border-2" :value="filters.strength" @change="e => applyFilters({ filters: { strength: e.target.value }, target: target })">
                        <option value="all">Any strength</option>
                        <option value="3">Mild (3+)</option>
                        <option value="4">Moderate (4+)</option>
                        <option value="5">Intense (5+)</option>
                     </select>
                  </div>
               </div>

               <button class="btn btn-link text-muted text-decoration-none w-100 fw-bold d-flex align-items-center justify-content-center gap-2 mt-4" @click="handleReset">
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
  overflow-y: auto;
  padding: 2rem 1rem;
}

.search-modal-container {
  max-width: 960px;
  background: white;
  margin: 0 auto;
  position: relative;
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
