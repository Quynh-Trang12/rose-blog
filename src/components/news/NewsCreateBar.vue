<script>
/**
 * ==========================================
 * COMPONENT: NewsCreateBar.vue
 * ==========================================
 * Description:
 * A sticky interface for creating new blog posts. Provides an entry point
 * to a modal form where users can input titles, write rich-text content,
 * select categories, and attach image URLs.
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
  data: function () {
    return {
      showModal: false,
      form: {
        title: '',
        content: '',
        category: 'Life & Reflections',
        imageUrl: '',
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
     * Basic validation to ensure the post has a title and non-empty content.
     * @returns {boolean}
     */
    isValid: function () {
      var textContent = (this.form.content || '').replace(/<[^>]*>/g, '').trim()
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
    openModal: function () {
      this.showModal = true
    },

    /**
     * Closes the creation modal and resets the form state.
     */
    closeModal: function () {
      this.showModal = false
      this.form = {
        title: '',
        content: '',
        category: 'Life & Reflections',
        imageUrl: '',
        isPublic: true,
      }
    },

    /**
     * Validates the creation form before proceeding to submit.
     * @param {Event} event - Native DOM submit event
     */
    checkForm: function (event) {
      event.preventDefault()
      // Explanation: Only proceed to submit if basic validation conditions are met.
      if (this.isValid) {
        this.submitPost()
      }
    },

    /**
     * Dispatches the new article to the news store and closes the modal.
     */
    submitPost: function () {
      // Explanation: Prepare the payload for the Vuex addArticle action.
      this.addArticle({
        authorName: this.currentUser.displayName,
        authorAvatar: this.currentUser.avatar || 'https://i.pravatar.cc/150?u=' + this.currentUser.username,
        date: new Date().toISOString(),
        title: this.form.title.trim(),
        content: this.form.content.trim(),
        category: this.form.category,
        imageUrl: this.form.imageUrl.trim() || null,
        isPublic: this.form.isPublic,
      })
      this.closeModal()
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
          class="btn btn-sm btn-light rounded-pill d-flex align-items-center gap-2 fw-medium border shadow-sm px-3"
          @click="openModal"
        >
          <span class="material-symbols-outlined text-muted fs-5">photo_camera</span>
          Add Photo
        </button>
        <button
          class="btn btn-sm btn-light rounded-pill d-flex align-items-center gap-2 fw-medium border shadow-sm px-3"
          @click="openModal"
        >
          <span class="material-symbols-outlined text-muted fs-5">label</span>
          Add Category
        </button>
      </div>
    </div>

    <!-- Create Post Modal via Teleport -->
    <teleport to="body">
      <div
        v-if="showModal"
        class="create-post-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
        style="z-index: 1055"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-modal-title"
        @click.self="closeModal"
      >
        <div
          class="card frosted-glass border-0 shadow-lg rounded-4 w-100 animate-fade-up"
          style="max-width: 500px"
        >
          <!-- Modal Header -->
          <div
            class="card-header border-0 bg-transparent px-4 pt-4 pb-0 d-flex justify-content-between align-items-center"
          >
            <h5
              id="create-modal-title"
              class="mb-0 fw-bold"
              style="font-family: 'Zilla Slab'; font-style: italic"
            >
              Create Post
            </h5>
            <button @click="closeModal" class="btn-close" aria-label="Close modal"></button>
          </div>

          <div class="card-body px-4 pb-4">
            <!-- Explanation: Using explicit checkForm pattern for Item 9 requirements -->
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
                  <select id="post-category" class="form-select rounded-3" v-model="form.category">
                    <option value="Health & Remedies">Health & Remedies</option>
                    <option value="Garden Stories">Garden Stories</option>
                    <option value="Life & Reflections">Life & Reflections</option>
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
                <label for="post-image" class="form-label text-sm fw-bold"
                  >Image URL (Optional)</label
                >
                <input
                  id="post-image"
                  type="url"
                  class="form-control rounded-3"
                  placeholder="https://images.unsplash.com/..."
                  v-model="form.imageUrl"
                />
              </div>

              <!-- Submit button only enabled if title and content are present -->
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
    </teleport>
  </div>
</template>

<style scoped lang="scss">
.create-post-overlay {
  background: rgba(0, 0, 0, 0.4);
}
.hover-bg-light:hover {
  background-color: var(--bs-gray-200) !important;
}
.transition-base {
  transition: all 0.2s ease-in-out;
}
</style>
