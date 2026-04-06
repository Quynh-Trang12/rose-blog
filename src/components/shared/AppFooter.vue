<script>
/**
 * ==========================================
 * COMPONENT: AppFooter.vue
 * ==========================================
 * Description:
 * The application footer. Includes a newsletter subscription form
 * with email validation, social media links, and copyright info.
 */

export default {
  name: 'AppFooter',

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Dynamically calculate the current year for the copyright notice.
      currentYear: new Date().getFullYear(),
      // Two-way bound field for the newsletter email.
      email: '',
      // Provides validation error feedback to the user.
      error: '',
      // Controls success message visibility.
      isSubscribed: false,
      // Brief message shown when link is copied.
      shareMsg: '',
    }
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    /**
     * Copies the current page URL to clipboard.
     */
    async shareApp() {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'The Rose Blog',
            text: 'Discover the world of roses with expert guides and inspirations.',
            url: window.location.origin,
          })
        } catch (err) {
          console.error('Share failed', err)
        }
      } else {
        navigator.clipboard.writeText(window.location.origin)
        alert('Blog link copied to clipboard!')
      }
    },

    /**
     * Redirects to the news section.
     */
    goToNews() {
      this.$router.push('/news')
    },

    /**
     * Opens the default mail client with a pre-filled subject.
     */
    contactEmail() {
      window.location.href = 'mailto:105028463@student.swin.edu.au?subject=Inquiry from Rose Blog'
    },
  },
}
</script>

<template>
  <!-- Footer with gradient background and relative positioning for decorative elements -->
  <footer class="grad-pink mt-auto py-5 position-relative overflow-hidden">
    <div class="container position-relative z-1">
      <div class="row g-5">
        <!-- Brand information column with logo and description -->
        <div class="col-12 col-lg-9">
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-secondary fs-3">local_florist</span>
            <div class="fs-4 text-gray-800 fw-bold font-zilla fst-italic mb-0">The Rose Blog</div>
          </div>
          <p class="text-gray-800 lh-xl mb-4 text-md font-roboto mw-600">
            A personal collection for botanical enthusiasts. Written with love to share expert
            planting guides, seasonal care tips, and a beautifully curated showcase of exquisite
            rose varieties.
          </p>
          <!-- Social Icons (hover effects clearly visible) -->
          <div class="d-flex align-items-center gap-3 text-gray-800 position-relative">
            <button
              type="button"
              class="btn p-0 border-0 text-gray-800 hover-slide-primary d-flex align-items-center justify-content-center"
              aria-label="Share this blog"
              @click="shareApp"
            >
              <span class="material-symbols-outlined fs-4">share</span>
            </button>
            <button
              type="button"
              class="btn p-0 border-0 text-gray-800 hover-slide-primary d-flex align-items-center justify-content-center"
              aria-label="View our gallery"
              @click="goToNews"
            >
              <span class="material-symbols-outlined fs-4">photo_camera</span>
            </button>
            <a
              type="button"
              class="text-gray-800 text-decoration-none hover-slide-primary d-flex align-items-center justify-content-center"
              aria-label="Contact via email"
              rel="noopener noreferrer"
              @click="contactEmail"
            >
              <span class="material-symbols-outlined fs-4">mail</span>
            </a>
            <transition name="fade">
              <span v-if="shareMsg" class="small text-secondary fw-bold ms-2">{{ shareMsg }}</span>
            </transition>
          </div>
        </div>

        <!-- Quick links column with navigation shortcuts -->
        <div class="col-12 col-lg-3">
          <div class="fs-5 fw-bold text-gray-800 mb-4">Explore</div>
          <ul class="list-unstyled d-flex flex-column gap-3 mb-0">
            <li>
              <router-link
                to="/"
                class="text-gray-800 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> Home</router-link
              >
            </li>
            <li>
              <router-link
                to="/collection"
                class="text-gray-800 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> The Collection
              </router-link>
            </li>
            <li>
              <router-link
                to="/news"
                class="text-gray-800 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> Latest News
              </router-link>
            </li>
            <li>
              <router-link
                to="/about"
                class="text-gray-800 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> About
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Footer bottom row with copyright and attribution -->
      <div class="row mt-5 pt-4 border-top border-gray-900">
        <div
          class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-gray-800 mb-0 small"
        >
          <p>&copy; {{ currentYear }} The Rose Blog. All rights reserved.</p>
          <p>Designed for botanical inspiration.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';

.social-link {
  width: 42px;
  height: 42px;
  color: $gray-400;
  border-color: #333;

  &:hover {
    color: white;
    border-color: $primary;
    background-color: $primary;
    transform: translateY(-4px) scale(1.1);
    box-shadow: 0 8px 16px rgba($primary, 0.4);
  }
}

.form-control:focus {
  background-color: $gray-900;
}
</style>
