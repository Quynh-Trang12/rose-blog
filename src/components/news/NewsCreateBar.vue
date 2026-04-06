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
      imageUrl: '',
      // Explanation: Current image input mode ('url' or 'upload').
      imageMode: 'url',
      // Explanation: Stores the created Object URL for cleanup.
      objectUrl: null,
      // Explanation: Predefined categories for news items.
      availableCategories: ['Bush Rose', 'Climbing Rose', 'Planting Guide', 'Botanical Tips'],
      // Botanical Attributes (Issue 3)
      color: '',
      fragrance: '',
      bloomingSeason: '',
      strength: 'all',
      thornLevel: 'all',
      idealFor: 'all',
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
     * Requirement (Issue 2): Handles local file selection.
     */
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        if (this.objectUrl) URL.revokeObjectURL(this.objectUrl)
        this.objectUrl = URL.createObjectURL(file)
        this.imageUrl = this.objectUrl
      }
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
        images: this.imageUrl ? [this.imageUrl] : [],
        layoutType: 'A',
        authorID: this.currentUser.id,
        authorName: this.currentUser.displayName,
        authorAvatar: this.safeAvatar,
        // Botanical fields (Issue 3)
        color: this.color || 'Unknown',
        fragrance: this.fragrance || 'Classic',
        bloomingSeason: this.bloomingSeason || 'Spring to Fall',
        strength: this.strength === 'all' ? 3 : Number(this.strength),
        thornLevel: this.thornLevel === 'all' ? 'few' : this.thornLevel,
        idealFor: this.idealFor === 'all' ? 'garden' : this.idealFor,
      }

      this.addNewsItem(payload)
      this.handleReset()
    },

    /**
     * Resets the form fields and collapses it.
     * Revokes any object URLs created for local files.
     */
    handleReset() {
      if (this.objectUrl) {
        URL.revokeObjectURL(this.objectUrl)
        this.objectUrl = null
      }
      this.title = ''
      this.content = ''
      this.selectedCategory = 'Bush Rose'
      this.imageUrl = ''
      this.imageMode = 'url'
      this.isExpanded = false
      this.error = ''
      this.color = ''
      this.fragrance = ''
      this.bloomingSeason = ''
      this.strength = 'all'
      this.thornLevel = 'all'
      this.idealFor = 'all'
    },
  },
}
</script>

<template>
  <div
    class="news-create-bar frosted-glass rounded-4 shadow-sm border border-light overflow-hidden transition-base animate-fade-up"
    :class="{ expanded: isExpanded }"
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
      <button
        class="btn btn-primary d-flex align-items-center justify-content-center p-0 rounded-circle shadow-sm"
        style="width: 48px; height: 48px"
      >
        <span class="material-symbols-outlined fs-2">add</span>
      </button>
    </div>

    <!-- Expanded State: Full Form -->
    <div v-else class="p-4 p-md-5 position-relative animate-fade-up">
      <button
        class="btn-close position-absolute top-0 end-0 m-4 shadow-none"
        @click="handleReset"
        aria-label="Close form"
      ></button>

      <div class="text-center mb-4">
        <h2 class="display-6 fw-bold font-zilla fst-italic mb-2">Publish a Post</h2>
        <p class="text-muted small text-uppercase ls-wide">Contribute to the sanctuary</p>
      </div>

      <div class="row g-4">
        <!-- Left Column: Inputs -->
        <div class="col-12 col-lg-8">
          <div class="mb-3">
            <label
              class="form-label font-roboto fw-bold text-sm text-uppercase small"
              for="postTitle"
              >POST TITLE</label
            >
            <input
              v-model="title"
              id="postTitle"
              type="text"
              class="form-control rounded-pill border-2 p-3 px-4 shadow-sm fw-bold font-zilla text-lg"
              placeholder="e.g. Vintage Floral Designs"
            />
          </div>
          <div class="mb-3">
            <label
              class="form-label font-roboto fw-bold text-sm text-uppercase small"
              for="postContent"
              >BOTANICAL WISDOM (MARKDOWN SUPPORTED)</label
            >
            <textarea
              v-model="content"
              id="postContent"
              class="form-control rounded-4 border-2 p-3 px-4 shadow-sm font-roboto"
              rows="6"
              placeholder="Sprouting new ideas? Write them here..."
            ></textarea>
          </div>

          <!-- Detailed Botanical Fields (Issue 3) -->
          <div class="row g-3 mt-1">
            <div class="col-6 col-md-4">
              <label class="form-label font-roboto fw-bold text-sm text-uppercase small"
                >Rose Color</label
              >
              <input
                v-model="color"
                type="text"
                class="form-control rounded-pill border-2"
                placeholder="e.g. Peach Pastel"
              />
            </div>
            <div class="col-6 col-md-4">
              <label class="form-label font-roboto fw-bold text-sm text-uppercase small"
                >Fragrance Profile</label
              >
              <input
                v-model="fragrance"
                type="text"
                class="form-control rounded-pill border-2"
                placeholder="e.g. Citrus Amber"
              />
            </div>
            <div class="col-6 col-md-4">
              <label class="form-label font-roboto fw-bold text-sm text-uppercase small"
                >Blooming Season</label
              >
              <input
                v-model="bloomingSeason"
                type="text"
                class="form-control rounded-pill border-2"
                placeholder="e.g. Summer Peaking"
              />
            </div>
            <div class="col-6 col-md-4">
              <label class="form-label font-roboto fw-bold text-sm text-uppercase small"
                >Strength (1-5)</label
              >
              <select v-model="strength" class="form-select rounded-pill border-2">
                <option value="all">Default (3)</option>
                <option value="3">3 (Mild)</option>
                <option value="4">4 (Strong)</option>
                <option value="5">5 (Intense)</option>
              </select>
            </div>
            <div class="col-6 col-md-4">
              <label class="form-label font-roboto fw-bold text-sm text-uppercase small"
                >Thorn Level</label
              >
              <select v-model="thornLevel" class="form-select rounded-pill border-2">
                <option value="all">Default (Few)</option>
                <option value="none">None</option>
                <option value="few">Few</option>
                <option value="many">Many</option>
              </select>
            </div>
            <div class="col-6 col-md-4">
              <label class="form-label font-roboto fw-bold text-sm text-uppercase small"
                >Ideal Environment</label
              >
              <select v-model="idealFor" class="form-select rounded-pill border-2">
                <option value="all">Default (Garden)</option>
                <option value="pot">Pots / Containers</option>
                <option value="fence">Fence / Climbing</option>
                <option value="hedges">Hedges</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Right Column: Settings -->
        <div class="col-12 col-lg-4">
          <div class="mb-4">
            <label class="form-label font-roboto fw-bold text-sm text-uppercase small mb-3"
              >SELECT TYPE</label
            >
            <div class="column g-3">
              <button
                v-for="cat in availableCategories"
                :key="cat"
                class="btn rounded-pill px-3 py-2 m-auto text-md fw-bold text-start transition-base border"
                :class="[
                  selectedCategory === cat
                    ? 'btn-primary'
                    : 'btn-outline-secondary border-light-subtle',
                ]"
                @click="selectedCategory = cat"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <!-- Requirement (Issue 2): Image Mode Toggle and Input -->
          <div class="mb-4">
            <label class="form-label font-roboto fw-bold text-sm text-uppercase small mb-2 d-block"
              >IMAGE ASSET</label
            >

            <div class="btn-group w-100 mb-3 shadow-sm rounded-pill overflow-hidden border">
              <button
                type="button"
                class="btn btn-sm py-2 fw-bold"
                :class="[imageMode === 'url' ? 'btn-primary' : 'btn-white']"
                @click="imageMode = 'url'"
              >
                URL
              </button>
              <button
                type="button"
                class="btn btn-sm py-2 fw-bold"
                :class="[imageMode === 'upload' ? 'btn-primary' : 'btn-white']"
                @click="imageMode = 'upload'"
              >
                Upload
              </button>
            </div>

            <div
              v-if="imageUrl"
              class="selected-photo-preview rounded-4 overflow-hidden mb-3 border shadow-sm ratio ratio-16x9"
            >
              <img :src="imageUrl" class="object-fit-cover w-100 h-100" />
              <button
                class="btn btn-dark btn-sm rounded-circle position-absolute top-0 end-0 m-2 p-1"
                @click="imageUrl = ''"
              >
                <span class="material-symbols-outlined fs-6">close</span>
              </button>
            </div>

            <div v-else>
              <div v-if="imageMode === 'url'">
                <input
                  v-model="imageUrl"
                  type="url"
                  class="form-control rounded-pill border-2 p-3 px-4 shadow-sm"
                  placeholder="https://example.com/rose.jpg"
                />
              </div>
              <div v-else>
                <label
                  class="btn btn-outline-secondary rounded-pill w-100 py-3 fw-bold border-2 border-dashed d-flex align-items-center justify-content-center gap-2 cursor-pointer"
                >
                  <span class="material-symbols-outlined">upload_file</span>
                  Browse / Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    class="d-none"
                    ref="fileInput"
                    @change="handleFileSelect"
                  />
                </label>
              </div>
            </div>
          </div>

          <div v-if="error" class="text-danger small mb-3 text-center fst-italic animate-fade-up">
            {{ error }}
          </div>

          <button
            class="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-lg text-uppercase ls-1"
            @click="handleSubmit"
          >
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
  background-color: rgba(0, 0, 0, 0.02);
}

.btn-light-soft {
  background-color: rgba(0, 0, 0, 0.02);
  border-style: dashed !important;
  border-color: #ddd !important;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
    border-color: var(--bs-primary) !important;
    color: var(--bs-primary);
  }
}

.cursor-pointer {
  cursor: pointer;
}
.ls-wide {
  letter-spacing: 0.15rem;
}
.text-muted-opacity-50 {
  color: rgba(0, 0, 0, 0.4);
}

.selected-photo-preview {
  position: relative;
  background-color: #000;
}
</style>
