<script>
/**
 * ==========================================
 * COMPONENT: PaginationBar.vue
 * ==========================================
 * Description:
 * A reusable pagination control component that renders prev/next buttons
 * and numbered page buttons with ellipsis for large page counts.
 * Fully keyboard-navigable with ARIA attributes for accessibility.
 *
 * Props: currentPage (Number), totalPages (Number).
 * Emits: page-change (Number) — the target page number.
 */

export default {
  name: 'PaginationBar',

  // ==========================================
  // PROPS
  // ==========================================
  props: {
    /**
     * The currently active page number (1-indexed).
     */
    currentPage: {
      type: Number,
      required: true,
    },
    /**
     * The total number of available pages.
     */
    totalPages: {
      type: Number,
      required: true,
    },
  },

  // ==========================================
  // EMITS
  // ==========================================
  emits: ['page-change'],

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    /**
     * Generates the array of page numbers and ellipsis markers to display.
     * Explanation: Shows at most 5 page buttons. When totalPages exceeds 5,
     * ellipsis ('...') placeholders are inserted to indicate skipped ranges.
     * The algorithm always includes the first page, the last page, and up to
     * three pages surrounding the current page.
     * @returns {Array<number|string>} Array of page numbers and '...' strings
     */
    visiblePages() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage

      // Explanation: If 5 or fewer pages, show all page numbers without ellipsis.
      if (total <= 5) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
        return pages
      }

      // Explanation: Always include page 1.
      pages.push(1)

      // Explanation: Determine the start and end of the window around currentPage.
      let start = Math.max(2, current - 1)
      let end = Math.min(total - 1, current + 1)

      // Explanation: Adjust window to always show 3 middle pages when possible.
      if (current <= 3) {
        end = 4
      }
      if (current >= total - 2) {
        start = total - 3
      }

      // Explanation: Insert leading ellipsis if there is a gap after page 1.
      if (start > 2) {
        pages.push('...')
      }

      // Explanation: Add the middle page numbers.
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Explanation: Insert trailing ellipsis if there is a gap before the last page.
      if (end < total - 1) {
        pages.push('...')
      }

      // Explanation: Always include the last page.
      pages.push(total)

      return pages
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    /**
     * Emits the page-change event if the target page is valid and not the current page.
     * @param {number} page - The target page number
     */
    goToPage(page) {
      if (typeof page === 'number' && page !== this.currentPage && page >= 1 && page <= this.totalPages) {
        this.$emit('page-change', page)
      }
    },
  },
}
</script>

<template>
  <!-- Explanation: Wrapping nav element with ARIA label for screen readers -->
  <nav
    v-if="totalPages > 1"
    class="d-flex justify-content-center mt-5 mb-5 align-items-center"
    aria-label="Pagination"
  >
    <div
      class="d-flex gap-2 align-items-center frosted-glass rounded-pill p-2 shadow-sm border border-light bg-white bg-opacity-50"
    >
      <!-- Explanation: Previous page button, disabled on the first page -->
      <button
        class="pagination-btn btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm transition-base"
        :disabled="currentPage === 1"
        aria-label="Previous page"
        @click="goToPage(currentPage - 1)"
        @keydown.enter="goToPage(currentPage - 1)"
      >
        <span class="material-symbols-outlined fs-5">chevron_left</span>
      </button>

      <!-- Explanation: Numbered page buttons with ellipsis support -->
      <div class="d-flex gap-1 px-2">
        <template v-for="(page, index) in visiblePages" :key="'page-' + index">
          <!-- Explanation: Ellipsis indicator for skipped page ranges -->
          <span
            v-if="page === '...'"
            class="pagination-btn d-flex align-items-center justify-content-center text-muted fw-bold"
            aria-hidden="true"
          >
            &hellip;
          </span>

          <!-- Explanation: Clickable page number button -->
          <button
            v-else
            class="pagination-btn btn btn-sm rounded-circle fw-bold transition-base d-flex align-items-center justify-content-center border-0"
            :class="
              currentPage === page
                ? 'btn-primary shadow-sm text-white'
                : 'text-dark hover-bg-light'
            "
            @click="goToPage(page)"
            @keydown.enter="goToPage(page)"
            :aria-current="currentPage === page ? 'page' : null"
            :aria-label="'Page ' + page"
          >
            {{ page }}
          </button>
        </template>
      </div>

      <!-- Explanation: Next page button, disabled on the last page -->
      <button
        class="pagination-btn btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm transition-base"
        :disabled="currentPage === totalPages"
        aria-label="Next page"
        @click="goToPage(currentPage + 1)"
        @keydown.enter="goToPage(currentPage + 1)"
      >
        <span class="material-symbols-outlined fs-5">chevron_right</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* Explanation: Fixed dimensions for pagination buttons to maintain circular shape */
.pagination-btn {
  width: 36px;
  height: 36px;
}

.pagination-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.hover-bg-light:hover {
  background-color: var(--bs-gray-200);
}
</style>
