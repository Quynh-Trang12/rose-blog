<script>
/**
 * ==========================================
 * COMPONENT: NewsCreateBar.vue
 * ==========================================
 * Description:
 * An authenticated-only inline block that expands to reveal a post
 * creation form. Folds when inactive to prevent vertical obstruction
 * (Masonry requirement).
 *
 * Requirements (Issue 3, Bug C):
 *  - Fixed: 'Add Photo' button allows choosing from 3 random images.
 *  - Fixed: Avatar fallback now uses a real service if current user avatar is broken.
 *  - Fully Options API migration.
 */
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'NewsCreateBar',

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: Controls form expansion (inline accordion style).
      isExpanded: false,
      // Explanation: Two-way bound fields for the creation form.
      title: '',
      content: '',
      selectedCategory: 'Bush Rose',
      selectedImage: null,
      // Explanation: Predefined categories for news items.
      availableCategories: ['Bush Rose', 'Climbing Rose', 'Planting Guide', 'Botanical Tips'],
      // Explanation: Mock random images to simulate "Add Photo" (Requirement Issue 3).
      randomImages: [
         'https://images.unsplash.com/photo-1697557167328-eafb1f94a731?w=800&q=80',
         'https://images.unsplash.com/photo-1623945392355-12af183b7acd?w=800&q=80',
         'https://images.unsplash.com/photo-1719538832618-cd1d30219ee5?w=800&q=80'
      ],
      // Explanation: Validation error feedback.
      error: '',
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapGetters('auth', ['currentUser', 'isLoggedIn']),

    /**
     * Requirement (Bug C): Avatar fallback logic.
     * Use user avatar if present, otherwise fetch from a stable provider.
     */
    safeAvatar() {
      if (this.currentUser?.avatar) return this.currentUser.avatar
      const seed = this.currentUser?.username || 'anonymous'
      return `https://i.pravatar.cc/150?u=${seed}`
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('news', ['addNewsItem']),

    /**
     * Requirement (Issue 3): Cycles through 3 predefined random images.
     */
    addPhoto() {
      const idx = Math.floor(Math.random() * this.randomImages.length)
      this.selectedImage = this.randomImages[idx]
    },

    /**
     * Handles post creation.
     */
    handleSubmit() {
      this.error = ''
      if (!this.title.trim() || !this.content.trim()) {
        this.error = 'Title and content are required to publish.'
        return
      }

      const payload = {
        title: this.title.trim(),
        content: this.content.trim(),
        type: this.selectedCategory,
        images: this.selectedImage ? [this.selectedImage] : [],
        layoutType: 'A',
        authorID: this.currentUser.id,
        authorName: this.currentUser.displayName,
        authorAvatar: this.safeAvatar,
      }

      this.addNewsItem(payload)
      this.handleReset()
    },

    /**
     * Resets the form fields and collapses it.
     */
    handleReset() {
      this.title = ''
      this.content = ''
      this.selectedCategory = 'Bush Rose'
      this.selectedImage = null
      this.isExpanded = false
      this.error = ''
    },
  },
}
</script>

<template>
  <div
    class="news-create-bar frosted-glass rounded-4 shadow-sm border border-light overflow-hidden transition-base animate-fade-up"
    :class="{ 'expanded': isExpanded }"
  >
    <!-- Folded State: Header/Trigger -->
    <div
      v-if="!isExpanded"
      class="p-3 d-flex align-items-center gap-3 cursor-pointer hover-bg-light"
      @click="isExpanded = true"
    >
      <img
        :src="safeAvatar"
        class="rounded-circle shadow-sm border border-white"
        width="45"
        height="45"
        alt="User avatar"
      />
      <div class="flex-grow-1">
        <input
          type="text"
          class="form-control border-0 bg-light-subtle rounded-pill-start p-3 ps-4 shadow-none fs-6 text-muted-opacity-50"
          placeholder="Share your botanical wisdom, Rose Garden..."
          readonly
        />
      </div>
      <button class="btn btn-primary d-flex align-items-center justify-content-center p-0 rounded-circle shadow-sm" style="width: 48px; height: 48px;">
        <span class="material-symbols-outlined fs-2">add</span>
      </button>
    </div>

    <!-- Expanded State: Full Form -->
    <div v-else class="p-4 p-md-5 position-relative animate-fade-up">
      <button class="btn-close position-absolute top-0 end-0 m-4 shadow-none" @click="handleReset" aria-label="Close form"></button>

      <div class="text-center mb-4">
         <h2 class="display-6 fw-bold font-zilla fst-italic mb-2">Publish a Post</h2>
         <p class="text-muted small text-uppercase ls-wide">Contribute to the sanctuary</p>
      </div>

      <div class="row g-4">
         <!-- Left Column: Inputs -->
         <div class="col-12 col-lg-8">
            <div class="mb-3">
              <label class="form-label font-roboto fw-bold text-sm text-uppercase small" for="postTitle">POST TITLE</label>
              <input v-model="title" id="postTitle" type="text" class="form-control rounded-pill border-2 p-3 px-4 shadow-sm fw-bold font-zilla text-lg" placeholder="e.g. Vintage Floral Designs" />
            </div>
            <div class="mb-3">
              <label class="form-label font-roboto fw-bold text-sm text-uppercase small" for="postContent">BOTANICAL WISDOM (MARKDOWN SUPPORTED)</label>
              <textarea v-model="content" id="postContent" class="form-control rounded-4 border-2 p-3 px-4 shadow-sm font-roboto" rows="6" placeholder="Sprouting new ideas? Write them here..."></textarea>
            </div>
         </div>

         <!-- Right Column: Settings -->
         <div class="col-12 col-lg-4">
            <div class="mb-4">
               <label class="form-label font-roboto fw-bold text-sm text-uppercase small mb-3">SELECT TYPE</label>
               <div class="d-flex flex-column gap-2">
                   <button
                     v-for="cat in availableCategories"
                     :key="cat"
                     class="btn rounded-pill px-4 py-2 fw-bold text-start transition-base border"
                     :class="[selectedCategory === cat ? 'btn-primary' : 'btn-outline-secondary border-light-subtle']"
                     @click="selectedCategory = cat"
                   >
                     {{ cat }}
                   </button>
               </div>
            </div>

            <!-- Requirement (Issue 3): Add Photo button -->
            <div class="mb-4">
               <label class="form-label font-roboto fw-bold text-sm text-uppercase small mb-2 d-block">IMAGE ASSET</label>
               <div v-if="selectedImage" class="selected-photo-preview rounded-4 overflow-hidden mb-2 border shadow-sm ratio ratio-16x9">
                  <img :src="selectedImage" class="object-fit-cover w-100 h-100" />
                  <button class="btn btn-dark btn-sm rounded-circle position-absolute top-0 end-0 m-2 p-1" @click="selectedImage = null">
                     <span class="material-symbols-outlined fs-6">close</span>
                   </button>
               </div>
               <button v-else class="btn btn-light-soft w-100 border-2 border-dashed rounded-4 p-4 d-flex flex-column align-items-center justify-content-center gap-2" @click="addPhoto">
                  <span class="material-symbols-outlined fs-2 text-primary">add_photo_alternate</span>
                  <span class="small fw-bold text-muted font-roboto">Add Botanical Photo</span>
               </button>
            </div>

            <div v-if="error" class="text-danger small mb-3 text-center fst-italic animate-fade-up">
              {{ error }}
            </div>

            <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-lg text-uppercase ls-1" @click="handleSubmit">
               Sprout Post →
            </button>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.news-create-bar {
  background: white;
}

.expanded {
  background: white !important;
}

.hover-bg-light:hover {
  background-color: rgba(0,0,0,0.02);
}

.btn-light-soft {
  background-color: rgba(0,0,0,0.02);
  border-style: dashed !important;
  border-color: #ddd !important;
  &:hover { background-color: rgba(0,0,0,0.04); border-color: var(--bs-primary) !important; color: var(--bs-primary); }
}

.cursor-pointer { cursor: pointer; }
.ls-wide { letter-spacing: 0.15rem; }
.text-muted-opacity-50 { color: rgba(0,0,0,0.4); }

.selected-photo-preview {
  position: relative;
  background-color: #000;
}
</style>
