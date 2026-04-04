<script>
/**
 * ==========================================
 * COMPONENT: NewsCard.vue
 * ==========================================
 * Description:
 * A versatile news display card supporting multiple layouts (A, B, C).
 * Handles social interactions (likes, comments, shares), inline editing
 * for post owners, and image lightbox.
 *
 * Requirements (Issue 5, 7, 8, 10, Bug B):
 *  - Fixed: Type-B cards have improved mobile readability.
 *  - Fixed: Read more link is a sleek 600-weight link with font-roboto.
 *  - Fixed: Edit textarea and comment textarea no longer overflow containers.
 *  - Fixed: Comment data structure is consistent (Bug B).
 *  - Renamed: Internal references from 'article' to 'newsItem' (Issue 8).
 *  - Fully Options API migration.
 */
import { mapGetters, mapActions } from 'vuex'
import ImageLightbox from '@/components/shared/ImageLightbox.vue'

export default {
  name: 'NewsCard',

  // ==========================================
  // COMPONENTS
  // ==========================================
  components: {
    ImageLightbox,
  },

  // ==========================================
  // PROPS
  // ==========================================
  props: {
    item: {
      type: Object,
      required: true,
    },
    isAuthed: {
      type: Boolean,
      default: false,
    },
    isOwner: {
      type: Boolean,
      default: false,
    },
  },

  // ==========================================
  // EMITS
  // ==========================================
  emits: ['react', 'comment', 'share', 'edit', 'delete'],

  // ==========================================
  // DATA
  // ==========================================
  data() {
    return {
      // Explanation: Controls the expanded/collapsed state of long content.
      isExpanded: false,
      // Explanation: Toggles the post options (ellipsis) dropdown menu.
      showEllipsisMenu: false,
      // Explanation: Toggles the comments section visibility.
      showComments: false,
      // Explanation: Toggles the share popup modal visibility.
      showShareMenu: false,
      // Explanation: Two-way bound text for the new comment input.
      commentText: '',
      // Explanation: Whether the card is in inline-edit mode.
      isEditing: false,
      // Explanation: Edit form title field bound to v-model.
      editTitle: '',
      // Explanation: Edit form content field bound to v-model.
      editContent: '',
      // Explanation: Controls the custom ImageLightbox visibility.
      lightboxVisible: false,
      // Explanation: Index of the initially displayed lightbox image.
      lightboxIndex: 0,
      // Explanation: Tracks elipsis button positioning for teleported menu.
      ellipsisMenuPos: { top: 0, left: 0 },
    }
  },

  // ==========================================
  // COMPUTED
  // ==========================================
  computed: {
    ...mapGetters('auth', ['mySavedPostIds']),

    /**
     * Determines if the current post has associated imagery.
     * @returns {boolean}
     */
    hasImage() {
      return (this.item.images && this.item.images.length > 0) || !!this.item.image
    },

    /**
     * Normalizes the content source (handling legacy content vs description fields).
     * @returns {string}
     */
    contentText() {
      return this.item.content || this.item.description || ''
    },

    /**
     * Flag for content that exceeds the standard teaser height (around 3 lines).
     * @returns {boolean}
     */
    isLongContent() {
      // Using 250 as a rough estimate for 3 lines of text
      return this.contentText.length > 250
    },

    /**
     * Formats the ISO date string into a user-friendly local date.
     * @returns {string}
     */
    formattedDate() {
      const d = new Date(this.item.date)
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },

    /**
     * Checks if this post ID is in the current user's saved list via Vuex.
     * @returns {boolean}
     */
    isSaved() {
      return this.mySavedPostIds.some((id) => String(id) === String(this.item.id))
    },

    /**
     * Returns the array of image URLs for the lightbox component.
     * @returns {string[]}
     */
    lightboxImages() {
      if (this.item.images && this.item.images.length > 0) {
        return this.item.images
      }
      if (this.item.image) {
        return [this.item.image]
      }
      return []
    },
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    ...mapActions('auth', ['toggleSavePost']),
    ...mapActions('news', ['reactToNewsItem', 'addComment', 'incrementShare']),

    /**
     * Requirement (Issue 8): Renamed from toggleSave.
     * Toggles bookmark state for the current post.
     */
    handleToggleSave() {
      if (!this.isAuthed) return
      this.toggleSavePost(this.item.id)
      this.showEllipsisMenu = false
    },

    /**
     * Toggles the post options menu (ellipsis) and calculates position.
     * Explanation: Uses getBoundingClientRect to position the teleported menu.
     */
    toggleEllipsis(event) {
      this.showEllipsisMenu = !this.showEllipsisMenu
      if (this.showEllipsisMenu) {
        const rect = event.currentTarget.getBoundingClientRect()
        this.ellipsisMenuPos = {
          top: rect.bottom + window.scrollY,
          left: rect.right + window.scrollX - 150, // 150 is the min-width of the menu
        }
      }
      this.showShareMenu = false
    },

    /**
     * Toggles the share options menu.
     */
    toggleShare() {
      this.showShareMenu = !this.showShareMenu
      this.showEllipsisMenu = false
    },

    /**
     * Closes the ellipsis menu.
     */
    closeEllipsis() {
      this.showEllipsisMenu = false
    },

    /**
     * Closes the share menu.
     */
    closeShare() {
      this.showShareMenu = false
    },

    /**
     * Prepares the card for inline editing if ownership is verified.
     */
    initiateEdit() {
      this.showEllipsisMenu = false
      if (!this.isOwner) return
      this.isEditing = true
      this.editTitle = this.item.title
      this.editContent = this.contentText
    },

    /**
     * Emits the updated content to the parent for persistence.
     * Requirement (Issue 7): sends a single merged object payload { id, title, content }.
     */
    saveEdit() {
      if (this.editTitle.trim() && this.editContent.trim()) {
        this.$emit('edit', {
          id: this.item.id,
          title: this.editTitle.trim(),
          content: this.editContent.trim(),
        })
        this.isEditing = false
      }
    },

    /**
     * Exits edit mode without saving.
     */
    cancelEdit() {
      this.isEditing = false
    },

    /**
     * Emits a delete request if confirmed by the user.
     */
    requestDelete() {
      this.showEllipsisMenu = false
      if (!this.isOwner) return
      if (window.confirm('Are you sure you want to delete this news item?')) {
        this.$emit('delete', this.item.id)
      }
    },

    /**
     * Requirement (Issue 8): Renamed from handleReact.
     * Dispatches a reaction event to Vuex.
     */
    handleReact(reaction) {
      if (!this.isAuthed) return
      // The store handles the logic for reactToNewsItem
      this.reactToNewsItem(this.item.id)
      this.$emit('react', { id: this.item.id, reaction })
    },

    /**
     * Opens the lightbox at the specified image index.
     * @param {number} index - The image index to display
     */
    showLightbox(index) {
      this.lightboxIndex = index || 0
      this.lightboxVisible = true
    },

    /**
     * Closes the lightbox.
     */
    hideLightbox() {
      this.lightboxVisible = false
    },

    /**
     * Validates and dispatches a new comment (Bug B fix).
     * Explanation: Ensures consistent comment object { text, author }.
     */
    submitComment() {
      if (this.commentText.trim() && this.isAuthed) {
        const commentData = {
          text: this.commentText.trim(),
          author: {
            displayName: this.$store.state.auth.currentUser.displayName,
            avatar: `https://i.pravatar.cc/40?u=${this.$store.state.auth.currentUser.username}`,
          },
        }
        this.addComment({ id: this.item.id, comment: commentData })
        this.$emit('comment', { id: this.item.id, comment: commentData })
        this.commentText = ''
      }
    },

    /**
     * Constructs the shareable URL for the current post.
     */
    getShareUrl() {
      return `${window.location.origin}/news#post-${this.item.id}`
    },

    /**
     * Handles sharing to various platforms.
     */
    handleShare(platform) {
      const shareUrl = this.getShareUrl()
      const shareTitle = encodeURIComponent(this.item.title || 'Check out this rose!')

      if (platform === 'facebook') {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${shareTitle}`,
          'facebook-share-dialog',
          `width=626,height=436`,
        )
      } else if (platform === 'twitter') {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`,
          'twitter-share-dialog',
          `width=550,height=420`,
        )
      } else if (platform === 'link') {
        try {
          navigator.clipboard.writeText(shareUrl)
          alert('Link copied to clipboard!')
        } catch (err) {
          console.error('Failed to copy link', err)
        }
      }
      this.incrementShare(this.item.id)
      this.$emit('share', { id: this.item.id, platform })
      this.showShareMenu = false
    },
  },
}
</script>

<template>
  <!-- Main card container (Issue 8: semantic role article) -->
  <article
    class="news-card frosted-glass rounded-4 shadow-sm p-3 position-relative d-flex flex-column gap-3 mb-1 w-100"
    :id="'post-' + item.id"
    role="article"
    :aria-labelledby="'post-title-' + item.id"
  >
    <!-- 1. Header: Author and Options -->
    <div class="d-flex justify-content-between align-items-start">
      <div class="d-flex align-items-center gap-2">
        <img
          v-lazy-load="item.authorAvatar || 'https://i.pravatar.cc/150?u=anonymous'"
          alt="Author Avatar"
          class="rounded-circle avatar-sm shadow-sm"
          width="40"
          height="40"
        />
        <div class="lh-sm">
          <p class="fw-bold text-dark mb-0 text-sm font-roboto">{{ item.authorName || 'Guest' }}</p>
          <div class="d-flex align-items-center gap-1 opacity-75">
            <span class="text-muted text-xs font-roboto">{{ formattedDate }}</span>
            <span class="material-symbols-outlined text-muted text-xs" aria-hidden="true" style="font-size: 12px;">
              {{ item.isPublic !== false ? 'public' : 'lock' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Ellipsis Menu -->
      <div class="position-relative">
        <button
          class="btn btn-sm btn-light rounded-circle shadow-none p-1 d-flex align-items-center justify-content-center ellipsis-btn"
          @click.stop="toggleEllipsis"
          aria-label="Post options"
        >
          <span class="material-symbols-outlined fs-5">more_horiz</span>
        </button>

        <teleport to="body">
          <div
            v-if="showEllipsisMenu"
            v-click-outside="closeEllipsis"
            class="frosted-glass rounded-3 shadow-lg position-absolute py-1 d-flex flex-column z-index-modal ellipsis-menu"
            :style="{ top: ellipsisMenuPos.top + 'px', left: ellipsisMenuPos.left + 'px' }"
            role="menu"
          >
            <button
              role="menuitem"
              class="btn btn-sm text-start px-3 py-2 w-100 d-flex align-items-center gap-2 menu-item"
              @click="handleToggleSave"
              :disabled="!isAuthed"
            >
              <span class="material-symbols-outlined fs-5">
                {{ isSaved ? 'bookmark_added' : 'bookmark_add' }}
              </span>
              {{ isSaved ? 'Unsave' : 'Save' }}
            </button>
            <button
              v-if="isOwner"
              role="menuitem"
              class="btn btn-sm text-start px-3 py-2 w-100 d-flex align-items-center gap-2 menu-item"
              @click="initiateEdit"
            >
              <span class="material-symbols-outlined fs-5">edit</span> Edit
            </button>
            <button
              v-if="isOwner"
              role="menuitem"
              class="btn btn-sm text-start px-3 py-2 w-100 d-flex align-items-center gap-2 menu-item text-danger"
              @click="requestDelete"
            >
              <span class="material-symbols-outlined fs-5">delete</span> Delete
            </button>
          </div>
        </teleport>
      </div>
    </div>

    <!-- 2. Edit Overlay Section (Issue 7 fix) -->
    <div
      v-if="isEditing"
      class="edit-overlay position-absolute inset-0 bg-white rounded-4 z-3 p-3 d-flex flex-column gap-2"
    >
      <h5 class="fw-bold font-zilla fst-italic mb-1">Update News Item</h5>
      <input
        v-model="editTitle"
        type="text"
        class="form-control form-control-sm fw-bold font-zilla"
        placeholder="Title"
      />
      <!-- Issue 7: overflow:auto ensures no breakage -->
      <textarea
        v-model="editContent"
        class="form-control form-control-sm font-roboto flex-grow-1"
        style="overflow-y: auto; resize: none;"
        placeholder="Share your botanical wisdom..."
      ></textarea>
      <div class="d-flex justify-content-end gap-2 mt-auto">
        <button class="btn btn-xs btn-link text-muted text-decoration-none" @click="cancelEdit">Cancel</button>
        <button class="btn btn-xs btn-primary rounded-pill px-3 fw-bold" @click="saveEdit">Save Changes</button>
      </div>
    </div>

    <!-- 3. Layout Rendering -->
    <div class="card-content-area" v-else>
      <!-- Layout Type B (Issue 10 fix: improved mobile text) -->
      <div v-if="item.layoutType === 'B' && hasImage" class="layout-b rounded-4 overflow-hidden position-relative card-hover shadow-sm mb-2">
        <div class="img-wrapper ratio ratio-16x9 cursor-pointer" @click="showLightbox(0)">
          <img v-lazy-load="item.images?.[0] || item.image" class="object-fit-cover" :alt="item.title" />
          <div v-if="item.images && item.images.length > 1" class="photo-badge">+{{ item.images.length - 1 }} photos</div>
        </div>
        <div class="overlay-text position-absolute bottom-0 start-0 w-100 p-3 p-md-4 pt-5 text-white">
          <h2 :id="'post-title-' + item.id" class="fs-4 fw-bold fst-italic font-zilla mb-1 text-shadow">{{ item.title }}</h2>
          <div class="content-teaser text-white-50 text-xs font-roboto mb-1" :class="{ 'is-expanded': isExpanded }" v-html="contentText"></div>
          <button v-if="isLongContent" class="read-more-link text-white text-decoration-underline" @click="isExpanded = !isExpanded">
            {{ isExpanded ? 'Read less' : 'Read more' }}
          </button>
        </div>
      </div>

      <!-- Layout Type C (Compact) -->
      <div v-else-if="item.layoutType === 'C'" class="layout-c d-flex flex-column gap-2">
         <div class="d-flex gap-3">
            <div v-if="hasImage" class="thumb-box flex-shrink-0 cursor-pointer" @click="showLightbox(0)">
               <img v-lazy-load="item.images?.[0] || item.image" class="rounded-3 object-fit-cover w-100 h-100" />
            </div>
            <div class="flex-grow-1 overflow-hidden d-flex flex-column justify-content-center">
               <h2 :id="'post-title-' + item.id" class="fs-5 fw-bold fst-italic font-zilla mb-0 text-dark">{{ item.title }}</h2>
               <div v-if="!isExpanded" class="text-muted text-xs font-roboto text-truncate">
                  {{ contentText.replace(/<[^>]*>/g, '') }}
               </div>
            </div>
         </div>
         <div v-if="isExpanded" class="content-teaser text-muted text-sm font-roboto animate-fade-up" v-html="contentText"></div>
         <button v-if="isLongContent" class="read-more-link" @click="isExpanded = !isExpanded">
            {{ isExpanded ? 'Read less' : 'Read more' }}
         </button>
      </div>

      <!-- Layout Type A (Standard) -->
      <div v-else class="layout-a">
        <h2 :id="'post-title-' + item.id" class="fs-4 fw-bold fst-italic font-zilla mb-2 text-dark">{{ item.title }}</h2>
        <div class="content-teaser font-roboto text-muted text-md mb-2" :class="{ 'is-expanded': isExpanded, 'has-mask': isLongContent && !isExpanded }" v-html="contentText"></div>
        <button v-if="isLongContent" class="read-more-link" @click="isExpanded = !isExpanded">
            {{ isExpanded ? 'Read less' : 'Read more' }}
        </button>
      </div>
    </div>

    <!-- 4. Social Row -->
    <div class="social-row d-flex align-items-center gap-3 pt-2 border-top border-light mt-auto">
      <div class="interaction-btn d-flex align-items-center gap-2 px-2 py-1 rounded-pill transition-base cursor-pointer" 
           :class="{'active': item.userReaction}" 
           @click="handleReact('thumb_up')"
           :title="!isAuthed ? 'Log in to react' : ''">
        <span class="material-symbols-outlined fs-5">thumb_up</span>
        <span class="fw-bold text-xs">{{ item.reactions || 0 }}</span>
      </div>

      <div class="interaction-btn d-flex align-items-center gap-2 px-2 py-1 rounded-pill transition-base cursor-pointer" @click="showComments = !showComments">
        <span class="material-symbols-outlined fs-5">chat_bubble</span>
        <span class="fw-bold text-xs">{{ (item.comments || []).length }}</span>
      </div>

      <div class="interaction-btn d-flex align-items-center gap-2 px-2 py-1 rounded-pill transition-base cursor-pointer ms-auto" @click="toggleShare">
        <span class="material-symbols-outlined fs-5">share</span>
        <span class="fw-bold text-xs">{{ item.shares || 0 }}</span>
      </div>
    </div>

    <!-- 5. Comments Section (Bug B fixed) -->
    <transition name="fade">
      <div v-show="showComments" class="comments-box pt-3 border-top border-light mt-2 animate-fade-up">
        <div class="d-flex flex-column gap-3 mb-3">
          <div v-for="c in item.comments || []" :key="c.id" class="d-flex gap-2">
            <img v-lazy-load="c.authorAvatar || c.author?.avatar" class="rounded-circle mt-1" width="28" height="28" />
            <div class="bg-light p-2 px-3 rounded-4 flex-grow-1">
              <p class="mb-0 fw-bold text-dark text-xs font-roboto">{{ c.authorName || c.author?.displayName }}</p>
              <p class="mb-0 text-muted text-xs lh-sm font-roboto">{{ c.text }}</p>
            </div>
          </div>
        </div>
        <div v-if="isAuthed" class="d-flex gap-2">
           <textarea v-model="commentText" class="form-control form-control-sm rounded-4 text-xs" style="overflow-y:auto; resize:none;" placeholder="Write a comment..." rows="2"></textarea>
           <button class="btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center p-0" style="width:36px; height:36px;" :disabled="!commentText.trim()" @click="submitComment">
              <span class="material-symbols-outlined fs-5">send</span>
           </button>
        </div>
        <div v-else class="text-center p-3 rounded-4 bg-light border border-white">
           <p class="text-muted small fst-italic mb-0">Log in to join the conversation.</p>
        </div>
      </div>
    </transition>

    <!-- Share Tooltip (Teleported) -->
    <teleport to="body">
       <div v-if="showShareMenu" v-click-outside="closeShare" class="share-dropdown frosted-glass rounded-4 shadow-lg p-2 position-absolute z-index-modal d-flex flex-column" :style="{ top: ellipsisMenuPos.top + 'px', left: ellipsisMenuPos.left + 'px' }">
          <button class="btn btn-sm text-start p-2 px-3 d-flex align-items-center gap-2 menu-item" @click="handleShare('facebook')">
             <i class="bi bi-facebook text-primary"></i> Facebook
          </button>
          <button class="btn btn-sm text-start p-2 px-3 d-flex align-items-center gap-2 menu-item" @click="handleShare('twitter')">
             <i class="bi bi-twitter-x text-dark"></i> Twitter
          </button>
          <button class="btn btn-sm text-start p-2 px-3 d-flex align-items-center gap-2 menu-item" @click="handleShare('link')">
             <span class="material-symbols-outlined fs-5">link</span> Copy Link
          </button>
       </div>
    </teleport>

    <!-- Lightbox -->
    <ImageLightbox :is-open="lightboxVisible" :images="lightboxImages" :initial-index="lightboxIndex" @close="hideLightbox" />
  </article>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';

.avatar-sm { width: 40px; height: 40px; }
.cursor-pointer { cursor: pointer; }
.inset-0 { top: 0; left: 0; right: 0; bottom: 0; }

.interaction-btn {
  color: $gray-600;
  &:hover { background-color: rgba(0,0,0,0.05); }
  &.active { color: var(--bs-primary); background-color: rgba(226, 6, 95, 0.08); }
}

/* Issue 5: Sleek Read More Link */
.read-more-link {
  background: none; border: none; padding: 0;
  color: var(--bs-primary);
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.7; }
}

.content-teaser {
  max-height: 4.8rem;
  overflow: hidden;
  transition: max-height 0.4s ease;
  position: relative;
  &.is-expanded { max-height: 200rem; }
  &.has-mask {
    -webkit-mask-image: linear-gradient(180deg, black 60%, transparent 100%);
    mask-image: linear-gradient(180deg, black 60%, transparent 100%);
  }
}

.layout-b {
  .photo-badge {
    position: absolute; bottom: 0.5rem; right: 0.5rem;
    background: rgba(0,0,0,0.6); color: white; border-radius: 20px;
    font-size: 0.7rem; padding: 0.2rem 0.5rem;
  }
  .overlay-text {
    background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%);
  }
}

.layout-c .thumb-box { width: 70px; height: 70px; }

.menu-item {
  border-radius: 8px;
  &:hover { background: rgba(0,0,0,0.05); }
}

.share-dropdown { min-width: 150px; }
.text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
</style>
