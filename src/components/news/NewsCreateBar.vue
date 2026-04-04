<script>
/**
 * ==========================================
 * COMPONENT: NewsCreateBar.vue
 * ==========================================
 * Description:
 * A sticky interface for creating new blog posts. Provides an entry point
 * to a modal form where users can input titles, write rich-text content,
 * select categories, and attach image URLs.
 *
 * Props: None (relies on Vuex auth state).
 * Emits: None (dispatches directly to Vuex news store).
 */
import { mapState, mapActions } from 'vuex'
import RichTextEditor from './RichTextEditor.vue'

export default {
  name: 'NewsCreateBar',

  // ==========================================
  // COMPONENTS
  // ==========================================
  components: {
    RichTextEditor,
  },

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: Controls the visibility of the creation modal.
      showModal: false,
      // Explanation: The form state object for new post creation.
      form: {
        title: '',
        content: '',
        type: 'Bush Rose',
        images: [],
        isPublic: true,
      },
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapState('auth', ['currentUser']),

    /**
     * Basic validation — title and non-empty content are required.
     * Explanation: Strips HTML tags from the content before checking for
     * emptiness because the rich-text editor wraps text in <p> tags.
     * @returns {boolean}
     */
    isValid() {
      const textContent = (this.form.content || '').replace(/<[^>]*>/g, '').trim()
      return this.form.title.trim() !== '' && textContent !== ''
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('news', ['addArticle']),

    /**
     * Opens the creation modal.
     */
    openModal() {
      this.showModal = true
    },

    /**
     * Closes the creation modal and resets the form state.
     */
    closeModal() {
      this.showModal = false
      this.form = {
        title: '',
        content: '',
        type: 'Bush Rose',
        images: [],
        isPublic: true,
      }
    },

    /**
     * Validates the creation form before proceeding to submit.
     * Explanation: Uses the explicit checkForm pattern with event.preventDefault().
     * @param {Event} event - Native DOM submit event
     */
    checkForm(event) {
      event.preventDefault()
      // Explanation: Only proceed to submit if basic validation conditions are met.
      if (this.isValid) {
        this.submitPost()
      }
    },

    /**
     * Dispatches the new article to the news store and closes the modal.
     */
    submitPost() {
      // Explanation: Prepare the payload for the Vuex addArticle action.
      this.addArticle({
        authorName: this.currentUser.displayName,
        authorAvatar:
          this.currentUser.avatar || `https://i.pravatar.cc/150?u=${this.currentUser.username}`,
        date: new Date().toISOString(),
        title: this.form.title.trim(),
        content: this.form.content.trim(),
        type: this.form.type,
        images: this.form.images,
        isPublic: this.form.isPublic,
        layoutType: this.form.images.length > 0 ? 'B' : 'A',
      })
      this.closeModal()
    },

    /**
     * Triggers the hidden file input for photo selection.
     * Explanation: Opens the modal first, then uses $nextTick to ensure
     * the DOM has updated before programmatically clicking the file input.
     * @param {Event} event - The triggering click event
     */
    triggerFileUpload(event) {
      if (event) event.preventDefault()
      this.openModal()
      this.$nextTick(() => {
        const input = document.getElementById('post-image-upload')
        if (input) input.click()
      })
    },

    /**
     * Handles file selection and creates object URLs for preview.
     * Explanation: Each file is converted to a blob URL so it can be
     * displayed as a thumbnail in the photo grid.
     * @param {Event} event - The native file input change event
     */
    handleFileUpload(event) {
      const files = event.target.files
      if (!files) return
      Array.from(files).forEach((file) => {
        const url = URL.createObjectURL(file)
        this.form.images.push(url)
      })
    },

    /**
     * Expands the creation form but does not focus anything specific yet.
     */
    openCategory() {
      this.openModal()
    },
  },
}
</script>

<template>
  <div>
    <!-- The Create Post entry bar -->
    <div class="news-create-bar frosted-glass rounded-4 shadow-sm p-3 mb-4 d-flex flex-column gap-3">
      <div class="d-flex align-items-center gap-3">
        <img
          :src="currentUser?.avatar || 'https://i.pravatar.cc/150?u=' + currentUser?.username"
          alt="Your avatar"
          class="rounded-circle"
          width="40"
          height="40"
        />
        <button
          class="btn w-100 text-start text-muted rounded-pill bg-light border-0 px-4 py-2 hover-bg-light transition-base"
          @click="openModal"
        >
          What's blooming today, {{ currentUser?.displayName.split(' ')[0] }}?
        </button>
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-sm btn-light rounded-pill d-flex align-items-center gap-2 fw-medium border shadow-sm px-3 transition-base hover-bg-light"
          @click="triggerFileUpload"
        >
          <span class="material-symbols-outlined text-muted fs-5">photo_camera</span>
          Add Photo
        </button>
        <select
          class="form-select form-select-sm rounded-pill fw-medium border shadow-sm px-3 text-muted"
          style="width: auto; cursor: pointer"
          v-model="form.type"
          @change="openCategory"
        >
          <option value="Bush Rose">Bush Rose</option>
          <option value="Climbing Rose">Climbing Rose</option>
          <option value="Planting Guide">Planting Guide</option>
          <option value="Botanical Tips">Botanical Tips</option>
        </select>
      </div>

      <!-- Expandable Inline Form (Replaces Full Screen Modal) -->
      <div v-if="showModal" class="create-post-form animate-fade-down mt-2 border-top pt-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0 fw-bold font-zilla fst-italic">Compose Post</h5>
          <button @click="closeModal" class="btn-close btn-sm" aria-label="Cancel compose"></button>
        </div>
            <!-- Explanation: Using explicit checkForm pattern for form validation -->
            <form @submit="checkForm" novalidate class="d-flex flex-column gap-3">
              <div>
                <label for="post-title" class="form-label text-sm fw-bold">Title</label>
                <input
                  id="post-title"
                  type="text"
                  class="form-control rounded-3"
                  v-model="form.title"
                  aria-required="true"
                  required
                />
              </div>

              <div>
                <label for="post-content" class="form-label text-sm fw-bold">Content</label>
                <RichTextEditor
                  id="post-content"
                  v-model="form.content"
                  placeholder="Share your rose story, garden tips, or health remedy..."
                />
              </div>

              <div class="row g-3">
                <div class="col-sm-6">
                  <label for="post-category" class="form-label text-sm fw-bold">Category</label>
                  <select id="post-category" class="form-select rounded-3" v-model="form.type">
                    <option value="Bush Rose">Bush Rose</option>
                    <option value="Climbing Rose">Climbing Rose</option>
                    <option value="Planting Guide">Planting Guide</option>
                    <option value="Botanical Tips">Botanical Tips</option>
                  </select>
                </div>
                <div class="col-sm-6 d-flex align-items-end mb-1">
                  <div class="form-check form-switch ps-5">
                    <input
                      class="form-check-input ms-n5"
                      type="checkbox"
                      role="switch"
                      id="post-visibility"
                      v-model="form.isPublic"
                    />
                    <label class="form-check-label ms-2 text-sm fw-bold mt-1" for="post-visibility">
                      {{ form.isPublic ? 'Public' : 'Private' }}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label class="form-label text-sm fw-bold">Photos</label>
                <div class="d-flex flex-wrap gap-2 mb-2">
                  <div
                    v-for="(img, idx) in form.images"
                    :key="idx"
                    class="position-relative border rounded-3 overflow-hidden photo-thumb"
                  >
                    <img v-lazy-load="img" class="w-100 h-100 object-fit-cover" />
                    <button
                      type="button"
                      class="btn-close btn-close-white position-absolute top-0 end-0 p-1 bg-dark bg-opacity-50 btn-close-sm"
                      @click="form.images.splice(idx, 1)"
                    ></button>
                  </div>
                  <button
                    type="button"
                    class="btn btn-outline-dashed rounded-3 d-flex flex-column align-items-center justify-content-center gap-1 text-muted photo-add-btn"
                    @click="triggerFileUpload"
                  >
                    <span class="material-symbols-outlined">add_a_photo</span>
                    <span class="photo-add-label">Add More</span>
                  </button>
                </div>
                <input
                  id="post-image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  class="d-none"
                  @change="handleFileUpload"
                />
              </div>

              <!-- Explanation: Submit button only enabled if title and content are present -->
              <button
                type="submit"
                class="btn btn-primary rounded-pill w-100 fw-bold mt-2"
                :disabled="!isValid"
              >
                Post
              </button>
            </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hover-bg-light:hover {
  background-color: var(--bs-gray-200) !important;
}

/* Explanation: Photo thumbnail grid item dimensions */
.photo-thumb {
  width: 80px;
  height: 80px;
}

/* Explanation: Photo add button dimensions */
.photo-add-btn {
  width: 80px;
  height: 80px;
  border: 2px dashed #ddd;
}

/* Explanation: Small close button sizing */
.btn-close-sm {
  font-size: 0.5rem;
}

/* Explanation: Label sizing for the add more button */
.photo-add-label {
  font-size: 0.6rem;
}
</style>
