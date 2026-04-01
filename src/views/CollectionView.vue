<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useNewsStore } from '@/stores/newsStore'
import NewsCard from '@/components/news/NewsCard.vue'

const authStore = useAuthStore()
const newsStore = useNewsStore()

const savedArticles = computed(() => {
  return newsStore.filteredArticles.filter((a) =>
    authStore.mySavedPostIds.some((id) => String(id) === String(a.id)),
  )
})

const isOwner = (item) => {
  if (!authStore.isLoggedIn) return false
  if (authStore.isAdmin) return true
  return authStore.currentUser.displayName === item.authorName
}
</script>

<template>
  <div class="position-relative min-vh-100 py-5">
    <!-- Background layer -->
    <div
      class="position-fixed top-0 start-0 w-100 h-100"
      aria-hidden="true"
      style="
        z-index: -1;
        background: linear-gradient(135deg, #fff5f8 0%, #fce7f3 50%, #f5f3ff 100%);
      "
    ></div>

    <div class="container position-relative z-1 pt-4">
      <!-- Header -->
      <div class="mb-5">
        <h1
          class="display-4 fw-bold fst-italic mb-1 animate-fade-up"
          style="font-family: 'Zilla Slab'; color: #333"
        >
          The Collection
        </h1>
        <p class="text-muted fw-normal mb-0" style="font-family: 'Roboto Condensed'">
          A curated gallery of exceptional roses. Members-only access.
        </p>
      </div>

      <div class="mb-4">
        <p class="text-muted text-sm" style="font-family: 'Roboto Condensed'">
          Showing saved articles: <strong>{{ savedArticles.length }}</strong> of
          <strong>{{ newsStore.articles.length }}</strong>
        </p>
      </div>

      <div v-if="!authStore.isLoggedIn" class="text-center py-5 animate-fade-up">
        <span class="material-symbols-outlined fs-1 text-muted d-block mb-2">lock</span>
        <p class="text-muted fst-italic text-lg">Please login to view your collection.</p>
      </div>

      <div v-else-if="savedArticles.length === 0" class="text-center py-5 animate-fade-up">
        <span class="material-symbols-outlined fs-1 text-muted d-block mb-2">bookmark_border</span>
        <p class="text-muted fst-italic text-lg">You have no saved articles yet.</p>
      </div>

      <!-- Rose Grid -->
      <!-- <div v-else class="row g-4">
        <div
          v-for="rose in newsStore.filteredRoses"
          :key="rose.id"
          class="col-12 col-sm-6 col-lg-4"
        >
          <article
            class="card border-0 rounded-4 overflow-hidden shadow-sm h-100 img-zoom-hover"
            :class="{ 'border-2 border-primary': rose.isFeatured }"
            role="button"
            tabindex="0"
            :aria-label="`View details for ${rose.name}`"
            @click="openDetail(rose)"
            @keyup.enter="openDetail(rose)"
          > -->
      <!-- Image with lazy load -->
      <!-- <div style="height:220px;overflow:hidden;position:relative">
              <img
                v-lazy-load="rose.imageUrl"
                :alt="`${rose.name} rose`"
                class="img-zoom w-100 h-100"
                style="object-fit:cover"
              /> -->
      <!-- Featured badge -->
      <!-- <span
                v-if="rose.isFeatured"
                class="position-absolute top-0 end-0 m-2 badge rounded-pill bg-primary text-white text-xs fw-bold px-2 py-1"
              >
                ⭐ Featured
              </span>
            </div>

            <div class="card-body p-4">
              <div class="d-flex align-items-center gap-2 mb-2"> -->
      <!-- Color dot -->
      <!-- <span
                  class="rounded-circle border"
                  style="width:14px;height:14px;flex-shrink:0"
                  :style="{ backgroundColor: colorDotMap[rose.color] || '#ccc' }"
                  :title="rose.color"
                ></span>
                <span class="badge rounded-pill glassmorphism-pink text-primary text-xs fw-bold px-2">
                  {{ rose.type }}
                </span>
              </div>
              <h3 class="h5 fw-bold text-dark mb-1" style="font-family:'Zilla Slab';font-style:italic">
                {{ rose.name }}
              </h3>
              <p class="text-muted text-sm mb-3" style="font-family:'Roboto Condensed';display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
                {{ rose.description }}
              </p> -->

      <!-- Meta chips -->
      <!-- <div class="d-flex flex-wrap gap-2 mt-auto">
                <span class="d-flex align-items-center gap-1 text-xs text-muted fw-semibold">
                  <span class="material-symbols-outlined" style="font-size:0.9rem">air</span>
                  {{ rose.fragrance }} Fragrance
                </span>
                <span class="d-flex align-items-center gap-1 text-xs text-muted fw-semibold">
                  <span class="material-symbols-outlined" style="font-size:0.9rem">calendar_month</span>
                  {{ rose.bloomSeason }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </div> -->

      <!-- ─── My Collection (Saved News Posts) ────────────────────────── -->
      <div v-if="savedArticles.length > 0" class="mt-5 pt-5 animate-fade-up">
        <div class="mb-4 d-flex align-items-center gap-3">
          <h2
            class="display-5 fw-bold fst-italic mb-0"
            style="font-family: 'Zilla Slab'; color: #333"
          >
            My Collection
          </h2>
          <span class="badge rounded-pill bg-primary px-3 py-2 fs-6 shadow-sm">
            {{ savedArticles.length }} Articles
          </span>
        </div>
        <p class="text-muted mb-5" style="font-family: 'Roboto Condensed'; max-width: 600px">
          A dedicated space for the stories, tips, and inspirations you've saved from our daily news
          feed.
        </p>

        <div class="row g-4">
          <div v-for="item in savedArticles" :key="item.id" class="col-12 col-md-6">
            <NewsCard
              :item="item"
              layout="A"
              :is-authed="authStore.isLoggedIn"
              :is-owner="isOwner(item)"
              @react="newsStore.reactToArticle"
              @comment="newsStore.addComment"
              @share="newsStore.incrementShare"
              @edit="newsStore.updateArticle"
              @delete="newsStore.deleteArticle"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Detail Modal ──────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectedRose"
          class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style="z-index: 1055; background: rgba(0, 0, 0, 0.55)"
          role="dialog"
          :aria-label="`Details for ${selectedRose.name}`"
          @click.self="closeDetail"
        >
          <div
            class="card border-0 rounded-4 shadow-lg overflow-hidden animate-fade-up"
            style="max-width: 680px; width: 100%"
          >
            <div style="position: relative; height: 280px; overflow: hidden">
              <img
                v-lazy-load="selectedRose.imageUrl"
                :alt="selectedRose.name"
                class="w-100 h-100"
                style="object-fit: cover"
              />
              <div
                style="
                  position: absolute;
                  inset: 0;
                  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
                "
              ></div>
              <button
                class="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-3"
                @click="closeDetail"
                aria-label="Close"
                style="width: 36px; height: 36px"
              >
                <span class="material-symbols-outlined fs-6">close</span>
              </button>
              <div class="position-absolute bottom-0 start-0 p-4">
                <h2
                  class="text-white fw-bold display-6 mb-0"
                  style="font-family: 'Zilla Slab'; font-style: italic"
                >
                  {{ selectedRose.name }}
                </h2>
              </div>
            </div>
            <div class="card-body p-4">
              <p
                class="text-muted mb-4"
                style="font-family: 'Roboto Condensed'; font-size: 1rem; line-height: 1.7"
              >
                {{ selectedRose.description }}
              </p>
              <div class="row g-3 text-center">
                <div
                  v-for="[label, value] in [
                    ['Type', selectedRose.type],
                    ['Color', selectedRose.color],
                    ['Fragrance', selectedRose.fragrance],
                    ['Bloom', selectedRose.bloomSeason],
                    ['Hardiness', selectedRose.hardiness],
                  ]"
                  :key="label"
                  class="col-4 col-sm"
                >
                  <div class="frosted-glass rounded-3 p-3 h-100">
                    <div class="text-xs text-muted fw-bold text-uppercase ls-1 mb-1">
                      {{ label }}
                    </div>
                    <div class="fw-bold text-dark text-sm">{{ value }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
