<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer mt-auto py-5 bg-dark text-white position-relative overflow-hidden">
    <div
      class="position-absolute top-0 start-0 w-100 h-100"
      style="
        background: radial-gradient(circle at top right, rgba(225, 29, 72, 0.15), transparent 50%);
        pointer-events: none;
      "
    ></div>

    <div class="container position-relative z-1">
      <div class="row g-5">
        <div class="col-12 col-lg-4 pe-lg-5">
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-danger fs-3">local_florist</span>
            <h4 class="fw-bold mb-0">The Rose Blog</h4>
          </div>
          <p class="text-secondary lh-lg mb-4" style="font-size: 0.95rem">
            A personal sanctuary for botanical enthusiasts. Written with love to share expert
            planting guides, seasonal care tips, and a beautifully curated showcase of exquisite
            rose varieties.
          </p>
          <div class="d-flex gap-3 text-secondary">
            <a href="#" class="text-secondary text-decoration-none hover-pink transition-all"
              ><span class="material-symbols-outlined fs-4">share</span></a
            >
            <a href="#" class="text-secondary text-decoration-none hover-pink transition-all"
              ><span class="material-symbols-outlined fs-4">photo_camera</span></a
            >
            <a href="#" class="text-secondary text-decoration-none hover-pink transition-all"
              ><span class="material-symbols-outlined fs-4">mail</span></a
            >
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-3 offset-lg-1">
          <h5 class="fw-bold mb-4">Explore</h5>
          <ul class="list-unstyled d-flex flex-column gap-3 mb-0">
            <li>
              <RouterLink
                to="/"
                class="text-secondary text-decoration-none hover-pink transition-all d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> Home</RouterLink
              >
            </li>
            <li>
              <RouterLink
                to="/collection"
                class="text-secondary text-decoration-none hover-pink transition-all d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> The
                Collection</RouterLink
              >
            </li>
            <li>
              <RouterLink
                to="/news"
                class="text-secondary text-decoration-none hover-pink transition-all d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> Latest
                News</RouterLink
              >
            </li>
            <li>
              <RouterLink
                to="/about"
                class="text-secondary text-decoration-none hover-pink transition-all d-inline-flex align-items-center gap-2"
                ><span class="material-symbols-outlined fs-6">chevron_right</span> About the
                Author</RouterLink
              >
            </li>
          </ul>
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <h5 class="fw-bold mb-4">Rose Care Newsletter</h5>
          <p class="text-secondary mb-3" style="font-size: 0.9rem">
            Subscribe to receive monthly gardening tips, pruning guides, and updates on new rose
            additions directly to your inbox.
          </p>
          <form class="d-flex flex-column gap-2" @submit.prevent>
            <div class="input-group mb-2 shadow-sm">
              <input
                type="email"
                class="form-control border-0 px-3 py-2 bg-secondary bg-opacity-10 text-white"
                placeholder="Email address"
                aria-label="Email address"
                required
              />
              <button class="btn btn-danger px-4 fw-bold" type="submit">Subscribe</button>
            </div>
            <small class="text-secondary" style="font-size: 0.75rem"
              >No spam. Unsubscribe at any time.</small
            >
          </form>
        </div>
      </div>

      <div class="row mt-5 pt-4 border-top border-secondary border-opacity-25">
        <div
          class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
        >
          <p class="text-secondary mb-0 small">
            © {{ currentYear }} The Rose Blog. All rights reserved.
          </p>
          <p class="text-secondary mb-0 small">Designed for botanical inspiration.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #111827 !important;
}

.transition-all {
  transition: all 0.2s ease-in-out;
}

.hover-pink:hover {
  color: #f43f5e !important;
  transform: translateX(4px);
}

.form-control::placeholder {
  color: #9ca3af;
}

.form-control:focus {
  background-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 0 0 0.25rem rgba(244, 63, 94, 0.25);
  color: white;
}
</style>
