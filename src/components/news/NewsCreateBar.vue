<script>
/**
 * ==========================================
 * COMPONENT: NewsCreateBar.vue
 * ==========================================
 * Description:
 * Authenticated-only post creation form. Expands inline on click.
 *
 * Fixes applied:
 * B1. Select Type buttons render in a strict 2-column grid on all viewports.
 * B2. Private post toggle with isPublic flag; private posts hidden from other users.
 * B3. Rich text editor (TipTap via RichTextEditor component) replaces plain textarea.
 * C1. Custom dropdown z-index fixed so dropdowns are never clipped by siblings.
 */
import { mapGetters, mapActions } from 'vuex'
import RichTextEditor from '@/components/news/RichTextEditor.vue'

export default {
  name: 'NewsCreateBar',

  components: { RichTextEditor },

  data() {
    return {
      isExpanded: false,
      title: '',
      content: '',
      selectedCategory: 'Bush Rose',
      imageUrl: '',
      imageMode: 'url',
      objectUrl: null,
      // B2: Private post toggle
      isPrivate: false,
      availableCategories: ['Bush Rose', 'Climbing Rose', 'Planting Guide', 'Botanical Tips'],
      // Botanical attributes
      color: '',
      fragrance: '',
      bloomingSeason: '',
      strength: 'all',
      thornLevel: 'all',
      idealFor: 'all',
      activeDropdown: null,
      thornOptions: [
        { label: 'All levels', value: 'all' },
        { label: 'Thornless', value: 'none' },
        { label: 'Few thorns', value: 'few' },
        { label: 'Many thorns', value: 'many' },
      ],
      idealOptions: [
        { label: 'All locations', value: 'all' },
        { label: 'Pots / Containers', value: 'pot' },
        { label: 'Fences / Trellis', value: 'fence' },
        { label: 'Hedges / Privacy', value: 'hedges' },
      ],
      strengthOptions: [
        { label: 'Any strength', value: 'all' },
        { label: '★★★', value: '3' },
        { label: '★★★★', value: '4' },
        { label: '★★★★★', value: '5' },
      ],
      error: '',
    }
  },

  computed: {
    ...mapGetters('auth', ['currentUser', 'isLoggedIn']),

    /** Avatar with stable pravatar fallback. */
    safeAvatar() {
      if (this.currentUser?.avatar) return this.currentUser.avatar
      return `https://i.pravatar.cc/150?u=${this.currentUser?.username || 'anonymous'}`
    },
  },

  methods: {
    ...mapActions('news', ['addNewsItem']),

    /** Handle local file upload. */
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (!file) return
      if (this.objectUrl) URL.revokeObjectURL(this.objectUrl)
      this.objectUrl = URL.createObjectURL(file)
      this.imageUrl = this.objectUrl
    },

    /** Validate and dispatch new post. */
    handleSubmit() {
      this.error = ''
      if (!this.title.trim()) {
        this.error = 'A title is required to publish.'
        return
      }
      if (!this.content.trim() || this.content === '<p></p>') {
        this.error = 'Content cannot be empty.'
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
        // B2: propagate privacy flag
        isPublic: !this.isPrivate,
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
      this.isPrivate = false
      this.error = ''
      this.color = ''
      this.fragrance = ''
      this.bloomingSeason = ''
      this.strength = 'all'
      this.thornLevel = 'all'
      this.idealFor = 'all'
      this.activeDropdown = null
    },

    toggleDropdown(id) {
      this.activeDropdown = this.activeDropdown === id ? null : id
    },
  },
}
</script>

<template>
  <div
    class="news-create-bar rounded-4 shadow-sm border border-light transition-base animate-fade-up"
    :class="{
      expanded: isExpanded,
      'overflow-visible': isExpanded,
      'glass-off': isExpanded,
    }"
    style="background: white"
  >
    <!-- ── Folded trigger ── -->
    <div
      v-if="!isExpanded"
      class="p-3 d-flex align-items-center gap-3 cursor-pointer"
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
        <div
          class="form-control border-0 bg-light rounded-pill px-4 py-2 text-muted text-sm font-roboto"
          style="cursor: pointer"
        >
          Share your botanical wisdom, {{ currentUser?.displayName }}...
        </div>
      </div>
      <button
        class="btn btn-primary d-flex align-items-center justify-content-center p-0 rounded-circle shadow-sm"
        style="width: 48px; height: 48px"
        aria-label="Create post"
      >
        <span class="material-symbols-outlined fs-2">add</span>
      </button>
    </div>

    <!-- ── Expanded form ── -->
    <div v-else class="p-4 p-md-5 position-relative animate-fade-up" style="overflow: visible">
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
        <!-- Left column -->
        <div class="col-12 col-lg-8" style="overflow: visible">
          <!-- Title -->
          <div class="mb-3">
            <label
              class="form-label font-roboto fw-bold text-sm text-uppercase small"
              for="postTitle"
              >Post Title</label
            >
            <input
              v-model="title"
              id="postTitle"
              type="text"
              class="form-control rounded-pill border-2 p-3 px-4 shadow-sm fw-bold font-zilla text-lg"
              placeholder="e.g. Vintage Floral Designs"
            />
          </div>

          <!-- B3: Rich Text Editor replaces plain textarea -->
          <div class="mb-3">
            <label class="form-label font-roboto fw-bold text-sm text-uppercase small"
              >Content</label
            >
            <RichTextEditor
              v-model="content"
              placeholder="Share your rose story, garden tips, or health remedy..."
            />
          </div>

          <!-- Botanical fields -->
          <div
            class="rounded-4 border bg-white p-3 mt-4 mb-4"
            style="position: relative; z-index: 200; overflow: visible"
          >
            <h6 class="text-xs text-uppercase ls-wide fw-bold text-primary mb-3">
              <span class="material-symbols-outlined fs-6 align-middle">psychiatry</span>
              Growth &amp; Characteristics
            </h6>
            <div class="row g-3" style="overflow: visible">
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
                  placeholder="e.g. Summer"
                />
              </div>

              <!-- C1: Each dropdown col has an explicit z-index so it layers above siblings -->
              <div class="col-6 col-md-4" style="position: relative; z-index: 130">
                <label class="form-label font-roboto fw-bold text-sm text-uppercase small"
                  >Strength</label
                >
                <div class="custom-select-wrapper" v-click-outside="() => (activeDropdown = null)">
                  <div
                    class="select-display-custom rounded-pill border-2"
                    @click.stop="toggleDropdown('create-strength')"
                  >
                    {{ strengthOptions.find((o) => o.value === strength)?.label || 'Select...' }}
                    <span
                      class="material-symbols-outlined transition-base"
                      :class="{ 'rotate-180': activeDropdown === 'create-strength' }"
                      >expand_more</span
                    >
                  </div>
                  <transition name="fade">
                    <div
                      class="dropdown-menu-custom"
                      v-if="activeDropdown === 'create-strength'"
                      style="z-index: 9999; position: absolute"
                    >
                      <div
                        v-for="opt in strengthOptions"
                        :key="opt.value"
                        class="dropdown-item-custom"
                        :class="{ active: strength === opt.value }"
                        @click.stop="((strength = opt.value), (activeDropdown = null))"
                      >
                        <span v-if="opt.value === 'all'">Any strength</span>
                        <span v-else>{{ '★'.repeat(Number(opt.value)) }}</span>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

              <div class="col-6 col-md-4" style="position: relative; z-index: 120">
                <label class="form-label font-roboto fw-bold text-sm text-uppercase small"
                  >Thorn Level</label
                >
                <div class="custom-select-wrapper" v-click-outside="() => (activeDropdown = null)">
                  <div
                    class="select-display-custom rounded-pill border-2"
                    @click.stop="toggleDropdown('create-thorn')"
                  >
                    {{ thornOptions.find((o) => o.value === thornLevel)?.label || 'Select...' }}
                    <span
                      class="material-symbols-outlined transition-base"
                      :class="{ 'rotate-180': activeDropdown === 'create-thorn' }"
                      >expand_more</span
                    >
                  </div>
                  <transition name="fade">
                    <div
                      class="dropdown-menu-custom"
                      v-if="activeDropdown === 'create-thorn'"
                      style="z-index: 9999; position: absolute"
                    >
                      <div
                        v-for="opt in thornOptions"
                        :key="opt.value"
                        class="dropdown-item-custom"
                        :class="{ active: thornLevel === opt.value }"
                        @click.stop="((thornLevel = opt.value), (activeDropdown = null))"
                      >
                        {{ opt.label }}
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

              <div class="col-6 col-md-4" style="position: relative; z-index: 110">
                <label class="form-label font-roboto fw-bold text-sm text-uppercase small"
                  >Ideal Environment</label
                >
                <div class="custom-select-wrapper" v-click-outside="() => (activeDropdown = null)">
                  <div
                    class="select-display-custom rounded-pill border-2"
                    @click.stop="toggleDropdown('create-ideal')"
                  >
                    {{ idealOptions.find((o) => o.value === idealFor)?.label || 'Select...' }}
                    <span
                      class="material-symbols-outlined transition-base"
                      :class="{ 'rotate-180': activeDropdown === 'create-ideal' }"
                      >expand_more</span
                    >
                  </div>
                  <transition name="fade">
                    <div
                      class="dropdown-menu-custom"
                      v-if="activeDropdown === 'create-ideal'"
                      style="z-index: 9999; position: absolute"
                    >
                      <div
                        v-for="opt in idealOptions"
                        :key="opt.value"
                        class="dropdown-item-custom"
                        :class="{ active: idealFor === opt.value }"
                        @click.stop="((idealFor = opt.value), (activeDropdown = null))"
                      >
                        {{ opt.label }}
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="col-12 col-lg-4">
          <!-- B1: Select Type — strict 2-column grid on all viewports -->
          <div class="mb-4">
            <label class="form-label font-roboto fw-bold text-sm text-uppercase small mb-3"
              >Select Type</label
            >
            <!-- Use CSS grid for guaranteed 2 columns regardless of viewport -->
            <div class="create-bar__type-grid">
              <button
                v-for="cat in availableCategories"
                :key="cat"
                type="button"
                class="btn rounded-4 px-2 py-2 w-100 text-sm fw-bold border transition-base"
                :class="
                  selectedCategory === cat
                    ? 'btn-primary'
                    : 'btn-outline-secondary border-light-subtle'
                "
                @click="selectedCategory = cat"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <!-- B2: Private / Public toggle -->
          <div class="mb-4">
            <label class="form-label font-roboto fw-bold text-sm text-uppercase small mb-2 d-block"
              >Post Visibility</label
            >
            <div
              class="create-bar__visibility-toggle d-flex rounded-4 border overflow-hidden shadow-sm"
            >
              <button
                type="button"
                class="btn btn-sm py-2 flex-grow-1 d-flex align-items-center justify-content-center gap-2 fw-bold"
                :class="!isPrivate ? 'btn-primary' : 'btn-white text-muted'"
                @click="isPrivate = false"
                :aria-pressed="!isPrivate"
              >
                <span class="material-symbols-outlined fs-6">public</span> Public
              </button>
              <button
                type="button"
                class="btn btn-sm py-2 flex-grow-1 d-flex align-items-center justify-content-center gap-2 fw-bold"
                :class="isPrivate ? 'btn-primary' : 'btn-white text-muted'"
                @click="isPrivate = true"
                :aria-pressed="isPrivate"
              >
                <span class="material-symbols-outlined fs-6">lock</span> Only Me
              </button>
            </div>
            <p class="text-xs text-muted mt-2 font-roboto">
              <span v-if="isPrivate">Only you will see this post.</span>
              <span v-else>Visible to all visitors.</span>
            </p>
          </div>

          <!-- Image asset -->
          <div class="mb-4">
            <label class="form-label font-roboto fw-bold text-sm text-uppercase small mb-2 d-block"
              >Image Asset</label
            >
            <div class="btn-group w-100 mb-3 shadow-sm rounded-pill overflow-hidden border">
              <button
                type="button"
                class="btn btn-sm py-2 fw-bold"
                :class="imageMode === 'url' ? 'btn-primary' : 'btn-white'"
                @click="imageMode = 'url'"
              >
                URL
              </button>
              <button
                type="button"
                class="btn btn-sm py-2 fw-bold"
                :class="imageMode === 'upload' ? 'btn-primary' : 'btn-white'"
                @click="imageMode = 'upload'"
              >
                Upload
              </button>
            </div>

            <div
              v-if="imageUrl"
              class="rounded-4 overflow-hidden mb-3 border shadow-sm ratio ratio-1x1 position-relative"
            >
              <img :src="imageUrl" class="object-fit-cover w-100 h-100" alt="Preview" />
              <button
                class="btn btn-dark btn-sm rounded-circle position-absolute top-0 end-0 m-2 p-1"
                @click="imageUrl = ''"
                aria-label="Remove image"
              >
                <span class="material-symbols-outlined fs-6">close</span>
              </button>
            </div>

            <div v-else>
              <input
                v-if="imageMode === 'url'"
                v-model="imageUrl"
                type="url"
                class="form-control rounded-pill border-2 p-3 px-4 shadow-sm"
                placeholder="https://example.com/rose.jpg"
              />
              <label
                v-else
                class="btn btn-outline-secondary rounded-pill w-100 py-3 fw-bold border-2 d-flex align-items-center justify-content-center gap-2 cursor-pointer"
                style="border-style: dashed"
              >
                <span class="material-symbols-outlined">upload_file</span>
                Browse / Upload Photo
                <input type="file" accept="image/*" class="d-none" @change="handleFileSelect" />
              </label>
            </div>
          </div>

          <!-- Error -->
          <div
            v-if="error"
            class="text-danger small mb-3 text-center fst-italic animate-fade-up"
            role="alert"
          >
            {{ error }}
          </div>

          <!-- Submit -->
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
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';

.news-create-bar {
  background: white;
  overflow: visible;
}

.cursor-pointer {
  cursor: pointer;
}
.ls-wide {
  letter-spacing: 0.15rem;
}

// ── B1: Strict 2-column type grid ────────────────────
// CSS grid guarantees exactly 2 columns on every viewport.
.create-bar__type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

// ── B2: Visibility toggle ────────────────────────────
.create-bar__visibility-toggle .btn-white {
  background: white;
}

// ── Rotate chevron in dropdowns ──────────────────────
.rotate-180 {
  transform: rotate(180deg);
}

// ── Fade transition ──────────────────────────────────
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.fade-enter-from,
.fade-leave-to {
  transform: translateY(-8px) scale(0.97);
  opacity: 0;
}
</style>
