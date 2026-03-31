<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useNewsStore } from '@/stores/newsStore'
import RichTextEditor from './RichTextEditor.vue'

const authStore = useAuthStore()
const newsStore = useNewsStore()

const showModal = ref(false)
const form = ref({
  title: '',
  content: '',
  category: 'Life & Reflections',
  imageUrl: '',
  isPublic: true,
})

const currentUser = computed(() => authStore.currentUser)
const isValid = computed(() => {
  const textContent = form.value.content.replace(/<[^>]*>/g, '').trim()
  return form.value.title.trim() !== '' && textContent !== ''
})

const openModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    title: '',
    content: '',
    category: 'Life & Reflections',
    imageUrl: '',
    isPublic: true,
  }
}

const submitPost = () => {
  if (!isValid.value) return
  newsStore.addArticle({
    authorName: currentUser.value.displayName,
    authorAvatar: currentUser.value.avatar,
    date: new Date().toISOString(),
    title: form.value.title.trim(),
    content: form.value.content.trim(),
    category: form.value.category,
    imageUrl: form.value.imageUrl.trim() || null,
    isPublic: form.value.isPublic,
  })
  closeModal()
}
</script>

<template>
  <div>
    <!-- The Create Post Bar -->
    <div class="news-create-bar frosted-glass rounded-4 shadow-sm p-3 mb-4 d-flex flex-column gap-3">
      <div class="d-flex align-items-center gap-3">
        <img
          :src="currentUser?.avatar"
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
    <Teleport to="body">
      <div
        v-if="showModal"
        class="create-post-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
        style="z-index: 1055"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-modal-title"
        @click.self="closeModal"
      >
        <div class="card frosted-glass border-0 shadow-lg rounded-4 w-100 animate-fade-up" style="max-width: 500px">
          <div class="card-header border-0 bg-transparent px-4 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h5 id="create-modal-title" class="mb-0 fw-bold" style="font-family: 'Zilla Slab'; font-style: italic;">Create Post</h5>
            <button @click="closeModal" class="btn-close" aria-label="Close modal"></button>
          </div>
          
          <div class="card-body px-4 pb-4">
            <form @submit.prevent="submitPost" class="d-flex flex-column gap-3">
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
                <label for="post-image" class="form-label text-sm fw-bold">Image URL (Optional)</label>
                <input
                  id="post-image"
                  type="url"
                  class="form-control rounded-3"
                  placeholder="https://images.unsplash.com/..."
                  v-model="form.imageUrl"
                />
              </div>

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
    </Teleport>
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
