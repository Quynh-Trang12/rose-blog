<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-grad-tright mt-auto py-5 position-relative overflow-hidden">
    <div class="container position-relative z-1">
      <div class="row g-5">
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
          <div class="d-flex gap-3 text-gray-600">
            <a href="#" class="text-gray-600 text-decoration-none hover-slide-primary"
              ><span class="material-symbols-outlined fs-4">share</span></a
            >
            <a href="#" class="text-gray-600 text-decoration-none hover-slide-primary"
              ><span class="material-symbols-outlined fs-4">photo_camera</span></a
            >
            <a href="#" class="text-gray-600 text-decoration-none hover-slide-primary"
              ><span class="material-symbols-outlined fs-4">mail</span></a
            >
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-3 offset-lg-1">
          <div class="fs-5 fw-bold text-gray-500 mb-4">Explore</div>
          <ul class="list-unstyled d-flex flex-column gap-3 mb-0">
            <li>
              <RouterLink
                to="/"
                class="text-gray-600 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> Home</RouterLink
              >
            </li>
            <li>
              <RouterLink
                to="/collection"
                class="text-gray-600 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> The Collection
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/news"
                class="text-gray-600 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> Latest News
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/about"
                class="text-gray-600 text-decoration-none hover-slide-primary d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> About
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <div class="fs-5 fw-bold text-gray-500 mb-3">Rose Care Newsletter</div>
          <p class="text-gray-600 mb-3 text-md">
            Subscribe to receive monthly gardening tips, pruning guides, and updates on new rose
            additions directly to your inbox.
          </p>
          <form class="d-flex flex-column gap-2 shadow-sm" @submit.prevent>
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
