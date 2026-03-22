<script setup>
import { RouterLink } from 'vue-router'
import WeatherWidget from '@/components/weather/WeatherWidget.vue'

// --- Modular Data Layer  ---
// Easily extractable to a Pinia store or separate files later.
const heroData = {
  badge: 'EST. 2026',
  titleNormal: 'Sanctuary for the',
  titleHighlight: 'Botanical Mind',
  description: 'Explore our curated showcase of exquisite roses, read expert planting guides, and discover the perfect additions to your garden.',
  image: 'https://images.unsplash.com/photo-1468531428472-ad67ab141fdd?ixlib=rb-4.1.0&auto=format&fit=crop&w=1920&q=80'
}

const featuredProfile = {
  title: 'The Pink Paradise',
  description: 'A compact bush rose known for exceptional disease resistance and continuous blooming cycle from early spring to late fall.',
  image: 'https://images.unsplash.com/photo-1697557167328-eafb1f94a731?ixlib=rb-4.1.0&auto=format&fit=crop&w=1080&q=80',
  link: '/collection'
}

const publications = [
  {
    id: 1,
    category: 'PLANTING GUIDE',
    title: 'How to Prune the White Elegance',
    description: 'Learn the best techniques for encouraging new growth...',
    image: 'https://images.unsplash.com/photo-1623945392355-12af183b7acd?ixlib=rb-4.1.0&auto=format&fit=crop&w=300&q=80',
    link: '/news'
  },
  {
    id: 2,
    category: 'SHOP UPDATE',
    title: 'Ruby Romance is Back in Stock!',
    description: 'Our most requested deep red climbing rose is available...',
    image: 'https://images.unsplash.com/photo-1662110497736-06601647fe27?ixlib=rb-4.1.0&auto=format&fit=crop&w=300&q=80',
    link: '/news'
  }
]
</script>

<template>
  <main>
    <section
      class="position-relative d-flex align-items-center" style="min-height: 91vh;" aria-label="Welcome to The Rose Blog">
      <div
        class="position-absolute top-0 start-0 w-100 h-100 z-0"
        :style="`background: linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%), url(${heroData.image}) center/cover fixed;`"
        aria-hidden="true"
      ></div>

      <div class="container position-relative z-1 py-5">
        <div class="row align-items-center gx-5">

          <div class="col-12 col-lg-8 text-white animate-fade-up">
            <span class="badge bg-white text-dark px-3 py-2 rounded-pill fw-bolder mb-4 border border-dark shadow-sm">
              {{ heroData.badge }}
            </span>
            <h1 class="display-3 fw-bolder mb-4">
              {{ heroData.titleNormal }} <br>
              <span style="color: #ffa6c1;">{{ heroData.titleHighlight }}</span>
            </h1>
            <p class="fs-4 mb-5 opacity-75 fw-medium" style="max-width: 800px; line-height: 1.6;">
              {{ heroData.description }}
            </p>
            <RouterLink
              to="/collection"
              class="btn btn-lg rounded-pill px-5 py-3 fw-bold text-white text-uppercase shadow-sm"
              style="background-color: #ea063f; letter-spacing: 1px;"
              aria-label="Explore our rose collection"
            >
              Explore Collection
            </RouterLink>
          </div>

          <div class="col-12 col-lg-4 d-flex justify-content-lg-center" style="padding-bottom: 6rem;">
            <WeatherWidget />
          </div>

        </div>
      </div>
    </section>

    <section class="bg-white py-3" aria-label="Editorial Content">
      <div class="container py-3 mb-5 mt-4">
        <div class="row align-items-stretch" style="--bs-gutter-x: 4.5rem;">

          <article class="col-12 col-lg-5 col-xl-6 d-flex flex-column">

            <div class="d-flex align-items-center gap-3 mb-4">
              <h2 class="h3 fw-bolder mb-0 text-dark">Featured Profile</h2>
              <div class="flex-grow-1 border-bottom border-2 opacity-100" style="border-color: #be123c !important;"></div>
            </div>

            <div class="card thumbnail-hover border-0 rounded-4 overflow-hidden shadow-sm position-relative flex-grow-1 d-flex bg-dark" style="min-height: 406px;">
              <img :src="featuredProfile.image" :alt="featuredProfile.title" class="position-absolute w-100 h-100 object-fit-cover img-zoom" style="opacity: 0.65;">
              <div class="position-relative mt-auto w-100 px-4 py-3 px-md-5 py-md-3 z-1" style="background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);">
                <h3 class="text-white fw-bold display-6 mb-2">{{ featuredProfile.title }}</h3>
                <p class="text-white fs-6 opacity-75 mb-3 fw-medium" style="max-width: 500px;">{{ featuredProfile.description }}</p>
                <RouterLink :to="featuredProfile.link" class="btn btn-outline-light rounded-pill px-4 py-2 fw-bold" style="margin-bottom: 1.6rem;" :aria-label="`Read full guide on ${featuredProfile.title}`">
                  Read Full Guide
                </RouterLink>
              </div>
            </div>

          </article>

          <aside class="col-12 col-lg-7 col-xl-6 d-flex flex-column">

            <div class="d-flex align-items-center gap-3 mb-4">
              <h2 class="h3 fw-bolder mb-0 text-dark">Latest Publications</h2>
              <div class="flex-grow-1 border-bottom border-2 opacity-100" style="border-color: #be123c !important;"></div>
            </div>

            <div class="d-flex flex-column justify-content-between flex-grow-1 gap-4">

              <article v-for="item in publications" :key="item.id" class="card card-hover border-0 bg-transparent h-100 mb-2">
                <RouterLink :to="item.link" class="text-decoration-none d-block h-100 rounded-4 transition-all" :aria-label="`Read article: ${item.title}`">
                  <div class="row g-0 align-items-center h-100">
                    <div class="col-4 h-100 overflow-hidden rounded-3 shadow-sm" style="min-height: 120px;">
                      <img :src="item.image" :alt="`Thumbnail for ${item.title}`" class="w-100 h-100 object-fit-cover">
                    </div>
                    <div class="col-8 ps-4">
                      <p class="fw-bolder mb-1 text-uppercase" style="font-size: 0.75rem; letter-spacing: 1px; color: #9e0026;" aria-hidden="true">
                        {{ item.category }}
                      </p>
                      <h4 class="h5 fw-bolder text-dark mb-1">{{ item.title }}</h4>
                      <p class="small mb-0 fw-medium" style="color: #4b5563;">{{ item.description }}</p>
                    </div>
                  </div>
                </RouterLink>
              </article>

            </div>
          </aside>

        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Eliminated custom classes, maximizing Bootstrap 5 utilities */
.object-fit-cover { object-fit: cover; }

/* Clean, isolated interactive states */
.transition-all { transition: all 0.2s ease-in-out; }
.card-hover:hover { background-color: #f3f4f6 !important; transform: scale(1.02); transition: 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.thumbnail-hover:hover .img-zoom { transform: scale(1.08); transition: 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.img-zoom { transition: 0.5s cubic-bezier(0.16, 1, 0.3, 1); }

/* Standard Entrance Animation */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
