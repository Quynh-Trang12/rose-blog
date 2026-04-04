<script>
/**
 * ==========================================
 * COMPONENT: NewsCard.vue
 * ==========================================
 * Description:
 * A versatile news display card that supports multiple layout styles (A, B, C).
 * Handles social interactions (likes, comments, shares), inline editing/deletion
 * for post owners, and image lightbox via the ImageLightbox shared component.
 *
 * Props: item (Object), isAuthed (Boolean), isOwner (Boolean).
 * Emits: react, comment, share, edit, delete.
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

    /**
     * Toggles bookmark state for the current post.
     */
    toggleSave() {
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
     * Explanation: Fixed emit format — sends an object payload with { id, title, content }
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
      if (window.confirm('Are you sure you want to delete this post?')) {
        this.$emit('delete', this.item.id)
      }
    },

    /**
     * Emits a reaction event to be handled by the parent.
     * @param {string} reaction - Type of reaction
     */
    handleReact(reaction) {
      if (!this.isAuthed) return
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
     * Validates and emits a new comment.
     */
    submitComment() {
      if (this.commentText.trim() && this.isAuthed) {
        this.$emit('comment', {
          id: this.item.id,
          comment: {
            id: Date.now(),
            text: this.commentText.trim(),
            authorName: this.$store.state.auth.currentUser.displayName,
            authorAvatar: `https://i.pravatar.cc/40?u=${this.$store.state.auth.currentUser.username}`,
          },
        })
        this.commentText = ''
      }
    },

    /**
     * Constructs the shareable URL for the current post.
     */
    getShareUrl() {
      return `${window.location.origin}${window.location.pathname}#post-${this.item.id}`
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
      this.$emit('share', { id: this.item.id, platform })
      this.showShareMenu = false
    },
  },
}
</script>

<template>
  <!-- Main Card Container -->
  <article
    class="news-card frosted-glass rounded-4 shadow-sm p-3 position-relative d-flex flex-column gap-3"
    :id="'post-' + item.id"
    role="article"
    :aria-labelledby="'post-title-' + item.id"
  >
    <!-- Card Header: Author info and status -->
    <div class="d-flex justify-content-between align-items-start">
      <div class="d-flex align-items-center gap-2 mb-2">
        <img
          v-lazy-load="item.authorAvatar || 'https://i.pravatar.cc/150?u=anonymous'"
          :alt="'Avatar for ' + item.authorName"
          class="rounded-circle avatar-sm"
          width="40"
          height="40"
        />
        <div>
          <p class="fw-semibold text-dark mb-0 text-md font-roboto">
            {{ item.authorName || 'Guest Gardener' }}
          </p>
          <div class="d-flex align-items-center gap-1">
            <span class="text-muted text-xs font-roboto">{{ formattedDate }}</span>
            <span class="material-symbols-outlined text-muted text-xs" aria-hidden="true">
              {{ item.isPublic !== false ? 'public' : 'lock' }}
            </span>
          </div>
        </div>
      </div>

      <div class="d-flex align-items-center gap-3">
        <!-- Category Badge -->
        <span
          class="badge rounded-pill text-xs fw-bolder ls-1 text-primary text-uppercase glassmorphism-pink p-2"
        >
          {{ item.type || item.category || 'Rose News' }}
        </span>

        <!-- Post Options Menu (Ellipsis) -->
        <div class="position-relative">
          <button
            class="btn btn-sm btn-light rounded-circle p-1 d-flex align-items-center justify-content-center ellipsis-btn"
            @click.stop="toggleEllipsis"
            aria-label="Post options"
            :aria-expanded="showEllipsisMenu"
          >
            <span class="material-symbols-outlined fs-5">more_horiz</span>
          </button>

          <!-- Dropdown Menu (Teleported) -->
          <teleport to="body">
            <div
              v-if="showEllipsisMenu"
              v-click-outside="closeEllipsis"
              class="frosted-glass rounded-3 shadow-lg position-absolute py-1 d-flex flex-column z-index-modal ellipsis-menu"
              :style="{ top: ellipsisMenuPos.top + 'px', left: ellipsisMenuPos.left + 'px' }"
              role="menu"
              aria-label="Post options"
            >
              <button
                role="menuitem"
                class="btn btn-sm text-start px-3 py-2 w-100 d-flex align-items-center gap-2 menu-item"
                :disabled="!isAuthed"
                @click="toggleSave"
              >
                <span class="material-symbols-outlined fs-5">
                  {{ isSaved ? 'bookmark_added' : 'bookmark_add' }}
                </span>
                {{ isSaved ? 'Unsave' : 'Save' }}
              </button>
              <button
                role="menuitem"
                class="btn btn-sm text-start px-3 py-2 w-100 d-flex align-items-center gap-2 menu-item"
                @click="initiateEdit"
                :disabled="!isOwner"
                :title="!isOwner ? 'Only the author can edit this post' : ''"
              >
                <span class="material-symbols-outlined fs-5">edit</span> Edit
              </button>
              <button
                role="menuitem"
                class="btn btn-sm text-start px-3 py-2 w-100 d-flex align-items-center gap-2 menu-item text-danger"
                @click="requestDelete"
                :disabled="!isOwner"
                :title="!isOwner ? 'Only the author can delete this post' : ''"
              >
                <span class="material-symbols-outlined fs-5">delete</span> Delete
              </button>
            </div>
          </teleport>
        </div>
      </div>
    </div>

    <!-- 2. Card Body: Content area -->

    <!-- Overlay Edit Form (prevents masonry shift) -->
    <div
      v-if="isEditing"
      class="edit-form-overlay position-absolute top-0 start-0 w-100 h-100 bg-white rounded-4 shadow-lg p-3 z-3 d-flex flex-column gap-2"
      style="min-height: 200px"
    >
      <h5 class="fw-bold font-zilla fst-italic mb-1">Edit Post</h5>
      <input
        type="text"
        class="form-control form-control-sm fw-bold font-zilla"
        v-model="editTitle"
        placeholder="Title"
      />
      <textarea
        class="form-control form-control-sm font-roboto flex-grow-1"
        v-model="editContent"
        placeholder="Content"
      ></textarea>
      <div class="d-flex justify-content-end gap-2 mt-auto">
        <button class="btn btn-xs btn-link text-muted text-decoration-none" @click="cancelEdit">
          Cancel
        </button>
        <button class="btn btn-xs btn-primary rounded-pill px-3 fw-bold" @click="saveEdit">
          Update Data
        </button>
      </div>
    </div>

    <div v-else>
      <!-- Layout Type B: Featured Image with Overlay Text (Req 11) -->
      <div
        v-if="item.layoutType === 'B' && hasImage"
        class="type-b-card position-relative overflow-hidden rounded-4 mb-3 card-hover shadow-sm"
      >
        <div
          class="type-b-img-container h-100 w-100"
          @click="showLightbox(0)"
          role="button"
          tabindex="0"
        >
          <img
            v-lazy-load="item.images?.[0] || item.image"
            :alt="'Cover image for ' + item.title"
            class="type-b-img w-100 h-100 object-fit-cover"
          />
          <div
            v-if="item.images && item.images.length > 1"
            class="photo-count-badge badge bg-dark bg-opacity-60 text-white rounded-pill text-xs px-2 py-1 position-absolute"
          >
            +{{ item.images.length - 1 }} photos
          </div>
        </div>

        <div class="position-absolute bottom-0 start-0 w-100 p-4 pt-5 overlay-gradient text-white">
          <h2
            :id="'post-title-' + item.id"
            class="fs-4 mb-2 fw-bold text-shadow font-zilla fst-italic"
          >
            {{ item.title }}
          </h2>
          <!-- Content with expansion -->
          <div
            class="content-body content-body--on-dark"
            :class="{ 'is-expanded': isExpanded }"
            v-html="contentText"
          ></div>
          <button
            v-if="isLongContent"
            class="read-more-btn read-more-btn--on-dark"
            @click="isExpanded = !isExpanded"
          >
            {{ isExpanded ? 'Show less' : 'Show more' }}
          </button>
        </div>
      </div>

      <!-- Layout Type C: Compact Horizontal (Req 11) -->
      <div v-else-if="item.layoutType === 'C'" class="type-c-card d-flex flex-column gap-2 p-1">
        <div class="d-flex flex-row gap-3">
          <div
            v-if="hasImage"
            class="type-c-img-wrapper rounded-3 overflow-hidden flex-shrink-0"
            @click="showLightbox(0)"
            role="button"
          >
            <img
              v-lazy-load="item.images?.[0] || item.image"
              class="w-100 h-100 object-fit-cover"
              alt="Thumbnail"
            />
          </div>
          <div class="flex-grow-1 overflow-hidden d-flex flex-column justify-content-center">
            <h2
              :id="'post-title-' + item.id"
              class="fs-5 mb-1 fw-bold font-zilla fst-italic text-dark"
            >
              {{ item.title }}
            </h2>
            <div v-if="!isExpanded" class="text-muted text-xs font-roboto text-truncate">
              {{ contentText.replace(/<[^>]*>/g, '') }}
            </div>
          </div>
        </div>
        <!-- Expansion for Type C -->
        <div
          v-if="isExpanded"
          class="content-body"
          :class="{ 'is-expanded': isExpanded }"
          v-html="contentText"
        ></div>
        <button v-if="isLongContent" class="read-more-btn" @click="isExpanded = !isExpanded">
          {{ isExpanded ? 'Read less' : 'Read more' }}
        </button>
      </div>

      <!-- Layout Type A: Standard Text Layout -->
      <div v-else class="type-a-card pt-1 pb-1 px-1">
        <h2 :id="'post-title-' + item.id" class="fs-4 mb-2 fw-bold font-zilla fst-italic text-dark">
          {{ item.title }}
        </h2>

        <!-- Content View (Req 8.2: CSS Fade-Out) -->
        <div class="content-body" :class="{ 'is-expanded': isExpanded }" v-html="contentText"></div>

        <!-- Read more Link (Req 8.2: Simple Link, NOT a button) -->
        <button
          v-if="isLongContent"
          class="read-more-btn"
          @click="isExpanded = !isExpanded"
          :aria-expanded="isExpanded"
        >
          {{ isExpanded ? 'Read less' : 'Read more' }}
        </button>
      </div>
    </div>

    <!-- 3. Social Interaction Row -->
    <div class="d-flex align-items-center gap-3 pt-2 border-top border-light position-relative">
      <!-- Reaction Picker -->
      <div class="position-relative reaction-container">
        <!-- Reaction Tooltip gating (Req 7.2) -->
        <div
          class="reaction-trigger-wrapper"
          :class="{ 'not-authed': !isAuthed }"
          :title="!isAuthed ? 'Log in to react' : ''"
        >
          <button
            class="reaction-btn btn btn-sm d-flex align-items-center gap-2 border-0 shadow-none px-2 rounded-pill social-btn"
            :class="{ 'text-primary bg-primary bg-opacity-10': item.userReaction }"
            aria-label="React"
          >
            <span class="material-symbols-outlined fs-5">
              {{ item.userReaction || 'thumb_up' }}
            </span>
            <span class="fw-semibold text-sm">{{ (item.likes || 0) + (item.hearts || 0) }}</span>
          </button>

          <!-- Reaction Menu (Req 12) -->
          <div
            v-if="isAuthed"
            class="reaction-picker frosted-glass rounded-pill shadow-sm d-flex gap-2 p-2 px-3 border border-white"
            role="menu"
          >
            <button
              role="menuitem"
              class="btn btn-sm p-0 rounded-circle text-primary hover-scale"
              @click="handleReact('favorite')"
              aria-label="Favorite"
            >
              <span class="material-symbols-outlined fs-4">favorite</span>
            </button>
            <button
              role="menuitem"
              class="btn btn-sm p-0 rounded-circle text-primary hover-scale"
              @click="handleReact('thumb_up')"
              aria-label="Like"
            >
              <span class="material-symbols-outlined fs-4">thumb_up</span>
            </button>
            <button
              role="menuitem"
              class="btn btn-sm p-0 rounded-circle text-warning hover-scale"
              @click="handleReact('sentiment_very_satisfied')"
              aria-label="Wow"
            >
              <span class="material-symbols-outlined fs-4">sentiment_very_satisfied</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Comment Toggle -->
      <button
        class="btn btn-sm d-flex align-items-center gap-2 text-muted border-0 shadow-none px-2 rounded-pill social-btn"
        @click="showComments = !showComments"
        aria-label="Toggle comments"
      >
        <span class="material-symbols-outlined fs-5">chat_bubble_outline</span>
        <span class="fw-semibold text-sm">{{ (item.comments || []).length }}</span>
      </button>

      <!-- Share Menu (Teleported) -->
      <button
        class="btn btn-sm d-flex align-items-center gap-2 text-muted border-0 shadow-none px-2 rounded-pill social-btn ms-auto"
        @click.stop="toggleShare"
        aria-label="Share post"
      >
        <span class="material-symbols-outlined fs-5">share</span>
        <span class="fw-semibold text-sm">{{ item.shares || 0 }}</span>
      </button>

      <teleport to="body">
        <div
          v-if="showShareMenu"
          class="share-modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-index-modal"
          @click.self="closeShare"
        >
          <div
            v-click-outside="closeShare"
            class="share-popup frosted-glass rounded-4 shadow-lg p-3"
            role="menu"
          >
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="fw-bold font-roboto">Share this post</span>
              <button class="btn-close" @click="closeShare" aria-label="Close"></button>
            </div>
            <div class="d-flex flex-column gap-2">
              <button
                role="menuitem"
                class="btn btn-light text-start d-flex align-items-center gap-3 p-3 rounded-3"
                @click="handleShare('facebook')"
              >
                <i class="bi bi-facebook text-primary fs-5"></i>
                <span>Facebook</span>
              </button>
              <button
                role="menuitem"
                class="btn btn-light text-start d-flex align-items-center gap-3 p-3 rounded-3"
                @click="handleShare('twitter')"
              >
                <i class="bi bi-twitter-x text-dark fs-5"></i>
                <span>X (Twitter)</span>
              </button>
              <button
                role="menuitem"
                class="btn btn-light text-start d-flex align-items-center gap-3 p-3 rounded-3"
                @click="handleShare('link')"
              >
                <span class="material-symbols-outlined fs-5">link</span>
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      </teleport>

      <ImageLightbox
        :visible="lightboxVisible"
        :images="lightboxImages"
        :start-index="lightboxIndex"
        @close="hideLightbox"
      />
    </div>

    <!-- Comments Section -->
    <transition name="fade">
      <div v-show="showComments" class="pt-3 border-top border-light mt-1 w-100">
        <div class="d-flex flex-column gap-3 mb-3">
          <div v-for="c in item.comments || []" :key="c.id" class="d-flex gap-2">
            <img
              v-lazy-load="c.authorAvatar"
              alt="Avatar"
              class="rounded-circle mt-1"
              width="28"
              height="28"
            />
            <div class="bg-light p-2 px-3 rounded-4 w-100">
              <p class="mb-0 fw-bold text-dark text-sm font-roboto">{{ c.authorName }}</p>
              <p class="mb-0 text-muted text-sm lh-sm font-roboto">{{ c.text }}</p>
            </div>
          </div>
        </div>
        <div v-if="isAuthed" class="d-flex gap-2">
          <textarea
            class="form-control rounded-3 text-sm"
            rows="2"
            placeholder="Write a comment..."
            v-model="commentText"
          ></textarea>
          <button
            class="btn btn-primary rounded-pill btn-sm d-flex align-items-center"
            @click="submitComment"
            :disabled="!commentText.trim()"
          >
            <span class="material-symbols-outlined fs-5">send</span>
          </button>
        </div>
        <!-- Lock placeholder for guests -->
        <div
          v-else
          class="text-center p-2 rounded-3 bg-light d-flex align-items-center justify-content-center gap-2 mt-2 border"
        >
          <span class="material-symbols-outlined text-muted fs-6">lock</span>
          <p class="mb-0 text-muted fst-italic text-sm">Log in to join the conversation.</p>
        </div>
      </div>
    </transition>
  </article>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';

// Req 8.1: Photo count badge positioning
.photo-count-badge {
  bottom: 0.5rem;
  right: 0.5rem;
  z-index: 2;
}

// Req 8.2: CSS Fade-out logic
.content-body {
  position: relative;
  max-height: 4.8rem; // Fixed height for truncation
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  font-family: 'Roboto Condensed', sans-serif;
  color: $gray-700;
  line-height: $line-height-base;
  font-size: 0.9rem;

  // Use a modern mask-image approach for seamless UI
  -webkit-mask-image: linear-gradient(180deg, black 60%, transparent 100%);
  mask-image: linear-gradient(180deg, black 60%, transparent 100%);

  &.is-expanded {
    max-height: 200rem; // Virtually unlimited
    -webkit-mask-image: none;
    mask-image: none;
  }

  &--on-dark {
    color: rgba(255, 255, 255, 0.85);
  }

  :deep(p) {
    margin-bottom: 0.5rem;
    &:last-child {
      margin-bottom: 0;
    }
  }
}

// Req 8.2: Read more sleek link
.read-more-btn {
  @extend %btn-reset !optional;
  color: var(--bs-primary);
  font-weight: 600;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;

  &::after {
    content: '→';
    font-size: 0.9rem;
    transition: transform 0.2s ease;
  }

  &:hover {
    color: darken($primary, 15%);
    border-bottom-color: currentColor;
    &::after {
      transform: translateX(3px);
    }
  }

  &--on-dark {
    color: $white;
    opacity: 0.9;
    &:hover {
      color: $white;
      opacity: 1;
    }
  }
}

// Req 11: Type B Image Card specifically
.type-b-card {
  height: auto;
  .type-b-img {
    aspect-ratio: 16 / 9; // Req 11 aspect ratio fix
  }
}

// Req 11: Type C horizontal card
.type-c-card {
  height: auto;
  min-height: 96px;
  .type-c-img-wrapper {
    width: 80px;
    height: 80px;
  }
}

.btn-xs {
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
}

.overlay-gradient {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
}

.ellipsis-btn {
  width: 32px;
  height: 32px;
}

.ellipsis-menu {
  min-width: 150px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.reaction-container {
  &:hover .reaction-picker {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

.reaction-trigger-wrapper.not-authed {
  opacity: 0.5;
  cursor: not-allowed;
  .reaction-btn {
    pointer-events: none;
  }
}

.reaction-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.share-modal-overlay {
  background: rgba(0, 0, 0, 0.4);
}

.share-popup {
  width: 320px;
}
</style>
