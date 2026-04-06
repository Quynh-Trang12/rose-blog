<script>
/**
 * ==========================================
 * COMPONENT: PaginationBar.vue
 * ==========================================
 * Description:
 * A reusable pagination component with numbered pages and previous/next
 * controls. Adapts to showing up to 5 numbered buttons with ellipses
 * to handle large result sets.
 *
 * Props:
 *   currentPage (Number): The current active page (1-indexed).
 *   totalPages (Number): The total number of available pages.
 *
 * Emits:
 *   page-change (Number): Fired when a digit or navigation button is clicked.
 */

export default {
  name: 'PaginationBar',

  props: {
    currentPage: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
  },

  emits: ['page-change'],

  computed: {
    /**
     * Calculates the sequence of page numbers to display.
     * Ensures a maximum of 5 buttons are shown, providing
     * ellipses where necessary for large page counts.
     * @returns {(number|string)[]} Array of page numbers or '...'
     */
    pageNumbers() {
      const total = this.totalPages
      const current = this.currentPage
      const range = []

      // If less than 6 pages, show all
      if (total <= 5) {
        for (let i = 1; i <= total; i++) range.push(i)
        return range
      }

      // Logic for 5 buttons with potential ellipses
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)

      range.push(1)
      if (start > 2) range.push('...')
      for (let i = start; i <= end; i++) range.push(i)
      if (end < total - 1) range.push('...')
      range.push(total)

      return range
    },
  },

  methods: {
    /**
     * Emits the selected page number to the parent component.
     * @param {number|string} page - The target page number
     */
    changePage(page) {
      if (page === '...' || page === this.currentPage) return
      this.$emit('page-change', page)
    },
  },
}
</script>

<template>
  <!-- Semantic nav element for accessibility -->
  <nav aria-label="Pagination" class="d-flex justify-content-center mt-5 mb-4 animate-fade-up">
    <div class="pagination-wrapper d-flex align-items-center gap-2">
      <!-- Previous Button -->
      <button
        class="btn btn-light rounded-circle shadow-sm border p-2 d-flex align-items-center justify-content-center"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
        aria-label="Previous page"
      >
        <span class="material-symbols-outlined">chevron_left</span>
      </button>

      <!-- Page Numbers -->
      <div class="d-flex align-items-center gap-2 px-2">
        <template v-for="(page, index) in pageNumbers" :key="index">
          <span v-if="page === '...'" class="text-muted px-1">...</span>
          <button
            v-else
            class="btn rounded-circle shadow-sm fw-bold border p-0 pagination-btn"
            :class="[currentPage === page ? 'btn-primary' : 'btn-light']"
            :aria-current="currentPage === page ? 'page' : undefined"
            :aria-label="'Page ' + page"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </template>
      </div>

      <!-- Next Button -->
      <button
        class="btn btn-light rounded-circle shadow-sm border p-2 d-flex align-items-center justify-content-center"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
        aria-label="Next page"
      >
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* Fixed width/height for circular pagination buttons */
.pagination-btn {
  width: 40px;
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(.btn-primary) {
  background-color: var(--bs-gray-100);
}

.pagination-wrapper button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
