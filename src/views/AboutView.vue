<script>
/**
 * ==========================================
 * COMPONENT: AboutView.vue
 * ==========================================
 * Description:
 * The static About page for The Rose Blog. Shares the vision, history,
 * and mission of the sanctuary. All inline styles have been replaced
 * with scoped CSS classes and global utility classes.
 */

export default {
  name: 'AboutView',
}
</script>

<template>
  <div class="about-view min-vh-100 py-5 position-relative overflow-hidden">
    <!-- Decorative background blobs -->
    <div class="bg-blob position-absolute top-0 end-0 opacity-10" aria-hidden="true"></div>
    <div class="bg-blob position-absolute bottom-0 start-0 opacity-10" aria-hidden="true"></div>

    <div class="container position-relative z-1 pt-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8 animate-fade-up">
          <!-- Page Header -->
          <div class="text-center mb-5">
            <h1 class="display-4 fw-bold fst-italic mb-3 font-zilla text-dark">
              Our Botanical Story
            </h1>
            <div class="mx-auto border-bottom border-primary border-4 about-divider"></div>
          </div>

          <!-- Main Content -->
          <div class="frosted-glass rounded-4 p-4 p-md-5 shadow-sm mb-5">
            <h2 class="fs-3 fw-bold mb-4 font-zilla fst-italic">
              More Than Just a Blog
            </h2>
            <p class="text-muted lh-xl mb-4 font-roboto about-body-text">
              The Rose Blog was founded in 2024 as a digital sanctuary for those who find
              peace among petals. What started as a simple gardening journal has evolved
              into a vibrant community for botanical enthusiasts, professional
              horticulturists, and those who simply appreciate the timeless elegance
              of the world's most beloved flower.
            </p>
            <p class="text-muted lh-xl mb-4 font-roboto about-body-text">
              Our mission is to democratize rose care knowledge, providing expert-level
              guidance that is accessible to the hobbyist gardener. From pruning
              techniques to organic health remedies, we believe every garden, no
              matter how small, deserves to bloom with majesty.
            </p>

            <!-- Mission Cards -->
            <div class="row g-4 mt-2">
              <div class="col-md-4 text-center">
                <div class="p-3">
                  <span class="material-symbols-outlined fs-1 text-primary mb-2">park</span>
                  <h3 class="h6 fw-bold text-uppercase ls-1">Sustainability</h3>
                  <p class="small text-muted">Promoting organic and eco-friendly rose care.</p>
                </div>
              </div>
              <div class="col-md-4 text-center">
                <div class="p-3">
                  <span class="material-symbols-outlined fs-1 text-primary mb-2">menu_book</span>
                  <h3 class="h6 fw-bold text-uppercase ls-1">Education</h3>
                  <p class="small text-muted">Sharing expert botanical wisdom daily.</p>
                </div>
              </div>
              <div class="col-md-4 text-center">
                <div class="p-3">
                  <span class="material-symbols-outlined fs-1 text-primary mb-2">diversity_1</span>
                  <h3 class="h6 fw-bold text-uppercase ls-1">Community</h3>
                  <p class="small text-muted">Building a global network of flower lovers.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact/CTA Section -->
          <div class="text-center">
            <p class="text-muted mb-4 fst-italic">"A rose by any other name would smell as sweet."</p>
            <router-link to="/news" class="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-sm">
              Explore Our Latest News
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-view {
  background: linear-gradient(135deg, #fff5f8 0%, #fef9c3 100%);
}

.bg-blob {
  width: 400px;
  height: 400px;
  background-color: var(--bs-primary);
  border-radius: 50%;
  filter: blur(120px);
}

/* Explanation: Replaces inline style="width: 80px" on the divider */
.about-divider {
  width: 80px;
}

/* Explanation: Replaces inline style="font-size: 1.1rem" on body paragraphs */
.about-body-text {
  font-size: 1.1rem;
}
</style>
