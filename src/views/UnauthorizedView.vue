<script>
/**
 * ==========================================
 * COMPONENT: UnauthorizedView.vue
 * ==========================================
 * Description:
 * A fallback view displayed when a guest user attempts to access a protected
 * route without authentication. Informs the user of the requirement
 * and provides navigation options (Go Home, Go Back).
 */

export default {
  name: 'UnauthorizedView',

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    /**
     * Navigates the user to the home page.
     */
    goHome() {
      this.$router.push('/')
    },

    /**
     * Navigates the user back to the previous page.
     */
    goBack() {
      this.$router.go(-1)
    },
  },
}
</script>

<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center py-5">
    <div class="text-center animate-fade-up px-4 unauth-content">
      <!-- Lock icon providing visual feedback for restricted access -->
      <span class="material-symbols-outlined text-primary mb-3 d-block unauth-icon">lock</span>

      <h1 class="display-6 fw-bold fst-italic mb-2 font-zilla text-dark">Members Only</h1>

      <p class="text-muted mb-4 font-roboto">
        You need to be logged in to access this section of The Rose Blog. Please sign in to continue
        your botanical journey.
      </p>

      <!-- Navigation actions — semantic button elements for programmatic navigation -->
      <div class="d-flex gap-3 justify-content-center flex-wrap">
        <button class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" @click="goHome">
          Go Home
        </button>
        <button class="btn btn-outline-primary rounded-pill px-4 fw-bold" @click="goBack">
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Replaces inline style="max-width: 480px" */
.unauth-content {
  max-width: 480px;
}

/* Replaces inline style="font-size: 4rem" */
.unauth-icon {
  font-size: 4rem;
}
</style>
