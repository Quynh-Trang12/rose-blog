<script>
/**
 * ==========================================
 * COMPONENT: AppFooter.vue
 * ==========================================
 * Description:
 * The application footer containing brand information, navigation links,
 * and a newsletter subscription form.
 */

export default {
  name: 'AppFooter',

  // ==========================================
  // DATA
  // ==========================================
  data: function () {
    return {
      // Explanation: Dynamically calculate the current year for the copyright notice.
      currentYear: new Date().getFullYear(),
    }
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    /**
     * Validates the newsletter form before submission.
     * Explanation: Following the week-6 taught pattern of explicit preventDefault.
     * @param {Event} event - The native DOM form submit event
     */
    checkForm: function (event) {
      event.preventDefault()
      // Explanation: Logs a mock submission to the console.
      console.log('Newsletter subscription submitted (mock)')
    },
  },
}
</script>

<template>
  <footer class="bg-grad-tright mt-auto py-5 position-relative overflow-hidden">
    <div class="container position-relative z-1">
      <div class="row g-5">
        <!-- Brand Info -->
        <div class="col-12 col-lg-4 pe-lg-5">
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-primary fs-3">local_florist</span>
            <div class="fs-4 text-gray-500 fw-bold mb-0">The Rose Blog</div>
          </div>
          <p class="text-gray-600 lh-xl mb-4 text-md">
            A personal sanctuary for botanical enthusiasts. Written with love to share expert
            planting guides, seasonal care tips, and a beautifully curated showcase of exquisite
            rose varieties.
          </p>
          <!-- Social Icons (Mock Links) -->
          <div class="d-flex gap-3 text-gray-600">
            <a href="#" class="text-gray-600 text-decoration-none hover-slide-primary">
              <span class="material-symbols-outlined fs-4">share</span>
            </a>
            <a href="#" class="text-gray-600 text-decoration-none hover-slide-primary">
              <span class="material-symbols-outlined fs-4">photo_camera</span>
            </a>
            <a href="#" class="text-gray-600 text-decoration-none hover-slide-primary">
              <span class="material-symbols-outlined fs-4">mail</span>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="col-12 col-md-6 col-lg-3 offset-lg-1">
          <div class="fs-5 fw-bold text-gray-500 mb-4">Explore</div>
          <ul class="list-unstyled d-flex flex-column gap-3 mb-0">
            <li>
              <router-link
                to="/"
                class="text-gray-600 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> Home</router-link
              >
            </li>
            <li>
              <router-link
                to="/collection"
                class="text-gray-600 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> The Collection
              </router-link>
            </li>
            <li>
              <router-link
                to="/news"
                class="text-gray-600 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> Latest News
              </router-link>
            </li>
            <li>
              <router-link
                to="/about"
                class="text-gray-600 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> About
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Newsletter Subscription -->
        <div class="col-12 col-md-6 col-lg-4">
          <div class="fs-5 fw-bold text-gray-500 mb-3">Rose Care Newsletter</div>
          <p class="text-gray-600 mb-3 text-md">
            Subscribe to receive monthly gardening tips, pruning guides, and updates on new rose
            additions directly to your inbox.
          </p>
          <!-- Explanation: Using explicit checkForm pattern with novalidate -->
          <form class="d-flex flex-column gap-2 shadow-sm" @submit="checkForm" novalidate>
            <div class="input-group border border-1 input-group-focus rounded-2 mb-1">
              <input
                type="email"
                class="form-control border-0 px-3 py-2 bg-white bg-opacity-10 rounded-start"
                placeholder="Email address"
                aria-label="Email address"
                required
              />
              <button class="btn btn-primary px-4 fw-bold" type="submit">Subscribe</button>
            </div>
          </form>
          <small class="text-white-50 text-sm">No spam. Unsubscribe at any time.</small>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="row mt-5 pt-4 border-top border-gray-600 border-opacity-25">
        <div
          class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
        >
          <p class="text-gray-600 mb-0 small">
            &copy; {{ currentYear }} The Rose Blog. All rights reserved.
          </p>
          <p class="text-gray-600 mb-0 small">Designed for botanical inspiration.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* No specific styles needed beyond Bootstrap and global SCSS */
</style>
