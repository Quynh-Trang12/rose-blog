<script>
/**
 * ==========================================
 * COMPONENT: NewsSearchBar.vue
 * ==========================================
 * Description:
 * A full-screen modal overlay for searching and filtering news items.
 * Supports keyword search with debounce, category selection, date range,
 * thorn level, ideal-for location, and fragrance strength filters.
 * Teleports to <body> to avoid z-index stacking issues.
 *
 * Props:
 *   modelValue (Boolean) - Controls modal visibility via v-model.
 *   target (String)      - Which filter context to modify: 'news' | 'collection'.
 *
 * Emits:
 *   update:modelValue - Emitted to close the modal from inside.
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
      required: true,
    },
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
      // Explanation: Local keyword buffer to handle debounce without
      // triggering a Vuex commit on every keystroke.
      localKeyword: '',
      // Explanation: Holds the debounce timer reference for cleanup.
      debounceTimer: null,
      // Explanation: Available category filter options.
      categoryOptions: [
        { label: 'All Roses', value: 'all' },
        { label: 'Bush Rose', value: 'Bush Rose' },
        { label: 'Climbing Rose', value: 'Climbing Rose' },
        { label: 'Planting Guide', value: 'Planting Guide' },
        { label: 'Botanical Tips', value: 'Botanical Tips' },
      ],
      // Explanation: Available date range options for the date filter select.
      dateOptions: [
        { label: 'All Time', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
      ],
      thornOptions: [
        { label: 'All levels', value: 'all' },
        { label: 'Thornless', value: 'none' },
        { label: 'Few thorns', value: 'few' },
        { label: 'Many thorns', value: 'many' },
      ],
      idealOptions: [
        { label: 'All locations', value: 'all' },
        { label: 'Pots / Containers', value: 'pot' },
        { label: 'Fences / Trellis', value: 'fence' },
        { label: 'Hedges / Privacy', value: 'hedges' },
      ],
      strengthOptions: [
        { label: 'Any strength', value: 'all' },
        { label: '★★★', value: '3' },
        { label: '★★★★', value: '4' },
        { label: '★★★★★', value: '5' },
      ],
      activeDropdown: null,
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapState('news', ['newsFilters', 'collectionFilters']),

    /**
     * Returns the active filter object based on the target context.
     * @returns {Object} The current filters for either 'news' or 'collection'.
     */
    filters() {
      return this.target === 'news' ? this.newsFilters : this.collectionFilters
    },
  },

  // ==========================================
  // WATCH
  // ==========================================
  watch: {
    /**
     * Debounces the keyword dispatch to avoid excessive Vuex mutations
     * while the user is still typing.
     * @param {string} newVal - The updated keyword string.
     */
    localKeyword(newVal) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.setSearchQuery({ query: newVal, target: this.target })
      }, 500)
    },

    /**
     * Syncs the local keyword whenever the store filters reset externally.
     */
    filters: {
      deep: true,
      handler(newVal) {
        if (this.localKeyword !== newVal.keyword) {
          this.localKeyword = newVal.keyword || ''
        }
      },
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('news', ['applyFilters', 'clearFilters', 'setSearchQuery']),

    /**
     * Closes the modal by emitting false to the parent via v-model.
     */
    close() {
      this.$emit('update:modelValue', false)
    },

    /**
     * Applies an immediate keyword search on button press.
     */
    handleSearchSubmit() {
      clearTimeout(this.debounceTimer)
      this.setSearchQuery({ query: this.localKeyword, target: this.target })
    },

    /**
     * Toggles the visibility of a custom dropdown.
     */
    toggleDropdown(id) {
      if (this.activeDropdown === id) {
        this.activeDropdown = null
      } else {
        this.activeDropdown = id
      }
    },

    /**
     * Selects a category filter and dispatches to the store.
     * @param {string} category - The category value to apply.
     */
    handleCategorySelect(category) {
      this.applyFilters({ filters: { category }, target: this.target })
    },

    /**
     * Applies the date range filter from the select element's change event.
     * @param {Event} e - The native change event.
     */
    handleDateSelect(e) {
      this.applyFilters({ filters: { date: e.target.value }, target: this.target })
    },

    /**
     * Resets all local and store filter state to defaults.
     */
    handleReset() {
      this.localKeyword = ''
      clearTimeout(this.debounceTimer)
      this.clearFilters(this.target)
    },
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  mounted() {
    // Explanation: Sync the local keyword buffer from the store on first mount.
    this.localKeyword = this.filters.keyword || ''

    // Explanation: Allows closing the modal with the Escape key.
    this._escapeHandler = (e) => {
      if (e.key === 'Escape' && this.modelValue) this.close()
    }
    window.addEventListener('keydown', this._escapeHandler)
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this._escapeHandler)
    clearTimeout(this.debounceTimer)
  },
}
</script>

<template>
  <!-- Explanation: Teleported to <body> so the overlay renders above all page content
       regardless of the stacking context of its parent component. -->
  <teleport to="body">
    <transition name="search-fade">
      <div
        v-if="modelValue"
        class="search-overlay d-flex align-items-center justify-content-center z-index-filter"
        role="dialog"
        aria-modal="true"
        aria-label="Search and Filter"
        @click.self="close"
      >
        <div
          class="search-modal-container frosted-glass rounded-5 shadow-2xl p-4 p-md-5 position-relative overflow-visible animate-fade-up"
        >
          <!-- Close Button -->
          <button
            class="search-modal__close btn btn-link text-dark p-2 position-absolute top-0 end-0 m-3"
            @click="close"
            aria-label="Close search panel"
          >
            <span class="material-symbols-outlined fs-3">close</span>
          </button>

          <!-- Header -->
          <header class="text-center mb-5">
            <h2 class="display-6 fw-bold font-zilla fst-italic mb-2">Refine Your View</h2>
            <p class="text-muted text-xs text-uppercase ls-1">Find the perfect bloom</p>
          </header>

          <!-- Keyword Search Input -->
          <div class="search-modal__input-wrapper d-flex align-items-stretch mb-5 mx-auto">
            <input
              v-model="localKeyword"
              type="text"
              class="form-control form-control-lg rounded-start-4 border-2 p-3 ps-4 fs-6 shadow-sm font-roboto"
              placeholder="Search by rose name or guide content..."
              aria-label="Search keywords"
              @keyup.enter="handleSearchSubmit"
            />
            <button
              class="btn btn-primary rounded-end-4 px-4 shadow-sm border-2 d-flex align-items-center justify-content-center fs-4 font-zilla fw-medium"
              @click="handleSearchSubmit"
              aria-label="Submit search"
            >
              Search
            </button>
          </div>

          <!-- Filter Columns -->
          <div class="row g-4">
            <!-- Left: Categories and Attribute Selects -->
            <div class="col-lg-7">
              <div class="mb-4">
                <h3
                  class="search-modal__section-title h6 fw-bold text-uppercase ls-1 mb-3 text-primary"
                >
                  Botanical Categories
                </h3>
                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="cat in categoryOptions"
                    :key="cat.value"
                    class="btn btn-sm rounded-pill px-3 py-2 fw-bold transition-base border"
                    :class="filters.category === cat.value ? 'btn-primary' : 'btn-outline-primary'"
                    @click="handleCategorySelect(cat.value)"
                  >
                    {{ cat.label }}
                  </button>
                </div>
              </div>

              <div class="search-modal__filter-card rounded-4 border-dashed bg-white p-3">
                <h3
                  class="search-modal__section-title h6 fw-bold text-uppercase ls-1 mb-3 text-primary"
                >
                  <span class="material-symbols-outlined fs-6 align-middle">psychiatry</span>
                  Thorns &amp; Placement
                </h3>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="search-modal__label text-muted text-uppercase small fw-bold mb-2">
                      Thorn Level
                    </label>
                    <div
                      class="custom-select-wrapper"
                      v-click-outside="() => (activeDropdown = null)"
                    >
                      <div
                        class="select-display-custom rounded-pill border-2"
                        @click.stop="toggleDropdown('thorn')"
                      >
                        {{
                          thornOptions.find((o) => o.value === filters.thornLevel)?.label ||
                          'Select...'
                        }}
                        <span
                          class="material-symbols-outlined transition-base"
                          :class="{ 'rotate-180': activeDropdown === 'thorn' }"
                          >expand_more</span
                        >
                      </div>
                      <transition name="fade">
                        <div class="dropdown-menu-custom" v-if="activeDropdown === 'thorn'">
                          <div
                            v-for="opt in thornOptions"
                            :key="opt.value"
                            class="dropdown-item-custom"
                            :class="{ active: filters.thornLevel === opt.value }"
                            @click.stop="
                              (applyFilters({ filters: { thornLevel: opt.value }, target }),
                              (activeDropdown = null))
                            "
                          >
                            {{ opt.label }}
                          </div>
                        </div>
                      </transition>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="search-modal__label text-muted text-uppercase small fw-bold mb-2">
                      Ideal For
                    </label>
                    <div
                      class="custom-select-wrapper"
                      v-click-outside="() => (activeDropdown = null)"
                    >
                      <div
                        class="select-display-custom rounded-pill border-2"
                        @click.stop="toggleDropdown('ideal')"
                      >
                        {{
                          idealOptions.find((o) => o.value === filters.idealFor)?.label ||
                          'Select...'
                        }}
                        <span
                          class="material-symbols-outlined transition-base"
                          :class="{ 'rotate-180': activeDropdown === 'ideal' }"
                          >expand_more</span
                        >
                      </div>
                      <transition name="fade">
                        <div class="dropdown-menu-custom" v-if="activeDropdown === 'ideal'">
                          <div
                            v-for="opt in idealOptions"
                            :key="opt.value"
                            class="dropdown-item-custom"
                            :class="{ active: filters.idealFor === opt.value }"
                            @click.stop="
                              (applyFilters({ filters: { idealFor: opt.value }, target }),
                              (activeDropdown = null))
                            "
                          >
                            {{ opt.label }}
                          </div>
                        </div>
                      </transition>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Date and Strength Selects -->
            <div class="col-lg-5">
              <div
                class="search-modal__filter-card rounded-4 border-dashed bg-white p-3 mb-4 h-100"
              >
                <h3
                  class="search-modal__section-title h6 fw-bold text-uppercase ls-1 mb-3 text-primary"
                >
                  <span class="material-symbols-outlined fs-6 align-middle">calendar_month</span>
                  Blooming &amp; Care
                </h3>

                <div class="mb-3">
                  <label class="search-modal__label text-muted text-uppercase small fw-bold mb-1">
                    Time Range
                  </label>
                  <div
                    class="custom-select-wrapper"
                    v-click-outside="() => (activeDropdown = null)"
                  >
                    <div
                      class="select-display-custom rounded-pill border-2"
                      @click.stop="toggleDropdown('date')"
                    >
                      {{ dateOptions.find((o) => o.value === filters.date)?.label || 'All Time' }}
                      <span
                        class="material-symbols-outlined transition-base"
                        :class="{ 'rotate-180': activeDropdown === 'date' }"
                        >expand_more</span
                      >
                    </div>
                    <transition name="fade">
                      <div class="dropdown-menu-custom" v-if="activeDropdown === 'date'">
                        <div
                          v-for="d in dateOptions"
                          :key="d.value"
                          class="dropdown-item-custom"
                          :class="{ active: filters.date === d.value }"
                          @click.stop="
                            (applyFilters({ filters: { date: d.value }, target }),
                            (activeDropdown = null))
                          "
                        >
                          {{ d.label }}
                        </div>
                      </div>
                    </transition>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="search-modal__label text-muted text-uppercase small fw-bold mb-1">
                    Fragrance Strength
                  </label>
                  <div
                    class="custom-select-wrapper"
                    v-click-outside="() => (activeDropdown = null)"
                  >
                    <div
                      class="select-display-custom rounded-pill border-2"
                      @click.stop="toggleDropdown('strength')"
                    >
                      {{
                        strengthOptions.find((o) => o.value === filters.strength)?.label ||
                        'Any strength'
                      }}
                      <span
                        class="material-symbols-outlined transition-base"
                        :class="{ 'rotate-180': activeDropdown === 'strength' }"
                        >expand_more</span
                      >
                    </div>
                    <transition name="fade">
                      <div class="dropdown-menu-custom" v-if="activeDropdown === 'strength'">
                        <div
                          v-for="opt in strengthOptions"
                          :key="opt.value"
                          class="dropdown-item-custom"
                          :class="{ active: filters.strength === opt.value }"
                          @click.stop="
                            (applyFilters({ filters: { strength: opt.value }, target }),
                            (activeDropdown = null))
                          "
                        >
                          <span v-if="opt.value === 'all'">Any strength</span>
                          <span v-else>{{ '★'.repeat(Number(opt.value)) }}</span>
                        </div>
                      </div>
                    </transition>
                  </div>
                </div>

                <!-- Reset Filters -->
                <button
                  class="btn btn-link text-muted text-decoration-none w-100 fw-bold d-flex align-items-center justify-content-center gap-2 mt-2"
                  @click="handleReset"
                >
                  <span class="material-symbols-outlined text-sm">refresh</span>
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';

// ==========================================
// SEARCH OVERLAY
// ==========================================

.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 1500;
  background: rgba($white, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  overflow-y: auto;
  padding: 2rem 1rem;
}

// ==========================================
// SEARCH MODAL CONTAINER
// ==========================================

.search-modal-container {
  width: 100%;
  max-width: 960px;
  background: $white;
  margin: 0 auto;
  box-shadow: 0 25px 50px -12px rgba($black, 0.1);
}

// ==========================================
// CLOSE BUTTON
// ==========================================

.search-modal__close {
  opacity: 0.5;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
}

// ==========================================
// SEARCH INPUT WRAPPER
// ==========================================

.search-modal__input-wrapper {
  max-width: 640px;

  input {
    border-color: $gray-200;

    &:focus {
      border-color: $primary;
      background-color: rgba($primary, 0.02);
    }
  }
}

// ==========================================
// SEARCH ICON IMAGE (inside the submit button)
// ==========================================

.search-modal__icon-img {
  width: 26px;
  height: 26px;
  object-fit: contain;
  // Explanation: Invert the coloured icon to white so it reads on the primary button.
  filter: brightness(0) invert(1);
}

// ==========================================
// SECTION TITLE & LABEL
// ==========================================

.search-modal__section-title {
  font-family: 'Roboto Condensed', sans-serif;
}

.search-modal__label {
  display: block;
  font-family: 'Roboto Condensed', sans-serif;
}

// ==========================================
// FADE TRANSITION
// ==========================================

.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.3s ease;
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}
</style>
