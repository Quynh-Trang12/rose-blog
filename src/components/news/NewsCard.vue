<script>
/**
 * ==========================================
 * COMPONENT: NewsCard.vue
 * ==========================================
 * Description:
 * A versatile news display card supporting multiple layouts (A, B, C).
 * Handles social interactions (reactions with hover emoji picker, comments,
 * shares via centered modal), inline editing for post owners, image lightbox,
 * category badges, and custom toast notifications.
 *
 * Fixes applied:
 * A1. Redesigned +N photos badge for better visibility and interaction.
 * A2. Category badge top-right of each card.
 * A3. Ellipsis tooltip positions directly below its trigger button.
 * A4. Share modal centered on screen; Facebook share opens new post composer.
 * A5. Facebook-style reaction picker on hover with animated emoji set.
 * A6. Gradient overlay fixed so images are clearly visible.
 * C1. Custom dropdown z-index fixed so dropdowns are never clipped.
 */
import { mapGetters, mapActions } from 'vuex'
import ImageLightbox from '@/components/shared/ImageLightbox.vue'

// Reaction set replicating Facebook's picker
const REACTIONS = [
  { key: 'like', emoji: '👍' },
  { key: 'love', emoji: '❤️' },
  { key: 'haha', emoji: '😂' },
  { key: 'wow', emoji: '😮' },
  { key: 'sad', emoji: '😢' },
  { key: 'angry', emoji: '😡' },
]

export default {
  name: 'NewsCard',

  components: { ImageLightbox },

  props: {
    item: { type: Object, required: true },
    isAuthed: { type: Boolean, default: false },
    isOwner: { type: Boolean, default: false },
  },

  emits: ['react', 'comment', 'share', 'edit', 'delete'],

  data() {
    return {
      isExpanded: false,
      // Ellipsis menu
      showEllipsisMenu: false,
      ellipsisAnchorEl: null,
      // Comments
      showComments: false,
      commentText: '',
      // Share modal
      showShareModal: false,
      shareCopied: false,
      // Reactions
      showReactionPicker: false,
      reactionHoverTimer: null,
      reactionLeaveTimer: null,
      // Toast notification
      toastMessage: '',
      toastTimer: null,
      // Edit mode
      isEditing: false,
      editTitle: '',
      editContent: '',
      editColor: '',
      editFragrance: '',
      editBloomingSeason: '',
      editStrength: 3,
      editThornLevel: 'few',
      editIdealFor: 'garden',
      activeDropdown: null,
      // Lightbox
      lightboxVisible: false,
      lightboxIndex: 0,
      // Shared option sets
      thornOptions: [
        { label: 'All levels', value: 'all' },
        { label: 'Thornless', value: 'none' },
        { label: 'Few thorns', value: 'few' },
        { label: 'Many thorns', value: 'many' },
      ],
      idealOptions: [
        { label: 'Garden', value: 'garden' },
        { label: 'Pots', value: 'pot' },
        { label: 'Fence', value: 'fence' },
        { label: 'Hedges', value: 'hedges' },
      ],
      strengthOptions: [
        { label: '★★★', value: '3' },
        { label: '★★★★', value: '4' },
        { label: '★★★★★', value: '5' },
      ],
      // Category badge map
      categoryBadgeMap: {
        'Bush Rose': { icon: 'local_florist', cls: 'badge-bush' },
        'Climbing Rose': { icon: 'nature', cls: 'badge-climbing' },
        'Planting Guide': { icon: 'eco', cls: 'badge-guide' },
        'Botanical Tips': { icon: 'psychiatry', cls: 'badge-tips' },
      },
      reactions: REACTIONS,
    }
  },

  computed: {
    ...mapGetters('auth', ['mySavedPostIds']),

    hasImage() {
      return (this.item.images && this.item.images.length > 0) || !!this.item.image
    },

    contentText() {
      return this.item.content || this.item.description || ''
    },

    isLongContent() {
      return this.contentText.length > 250
    },

    formattedDate() {
      return new Date(this.item.date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },

    isSaved() {
      return this.mySavedPostIds.some((id) => String(id) === String(this.item.id))
    },

    lightboxImages() {
      if (this.item.images && this.item.images.length > 0) return this.item.images
      if (this.item.image) return [this.item.image]
      return []
    },

    categoryMeta() {
      const type = this.item.type || this.item.category || ''
      return this.categoryBadgeMap[type] || null
    },

    /** Reaction count including the user's own reaction. */
    totalReactions() {
      return this.item.reactions || 0
    },

    /** Emoji shown on the reaction button. */
    reactionEmoji() {
      return this.userReaction ? this.userReaction.emoji : '👍'
    },

    /** Persistent user reaction from auth state. */
    userReaction() {
      if (!this.isAuthed || !this.$store.state.auth.currentUser.reactions) return null
      const key = this.$store.state.auth.currentUser.reactions[this.item.id]
      if (!key) return null
      return REACTIONS.find((r) => r.key === key) || null
    },

    extraPhotoCount() {
      if (this.item.images && this.item.images.length > 1) return this.item.images.length - 1
      return 0
    },
  },

  methods: {
    ...mapActions('auth', ['toggleSavePost']),
    ...mapActions('news', ['reactToNewsItem', 'addComment', 'incrementShare']),

    // ==========================================
    // TOAST NOTIFICATIONS
    // ==========================================
    showToast(message) {
      clearTimeout(this.toastTimer)
      this.toastMessage = message
      this.toastTimer = setTimeout(() => {
        this.toastMessage = ''
      }, 3000)
    },

    // ==========================================
    // SAVE / BOOKMARK
    // ==========================================
    handleToggleSave() {
      if (!this.isAuthed) {
        this.showToast('Please log in to save posts.')
        return
      }
      this.toggleSavePost(this.item.id)
      this.showEllipsisMenu = false
      this.showToast(this.isSaved ? 'Post unsaved.' : 'Post saved to your collection!')
    },

    // ==========================================
    // ELLIPSIS MENU — positioned directly below button
    // ==========================================
    toggleEllipsis(event) {
      this.showEllipsisMenu = !this.showEllipsisMenu
      this.ellipsisAnchorEl = event.currentTarget
      this.showShareModal = false
    },

    closeEllipsis() {
      this.showEllipsisMenu = false
    },

    /** Compute teleported menu position directly below the trigger. */
    ellipsisStyle() {
      if (!this.ellipsisAnchorEl) return {}
      const rect = this.ellipsisAnchorEl.getBoundingClientRect()
      return {
        position: 'fixed',
        top: `${rect.bottom + 6}px`,
        right: `${window.innerWidth - rect.right}px`,
        zIndex: 9999,
      }
    },

    // ==========================================
    // REACTIONS — Facebook-style hover picker
    // ==========================================
    onReactionButtonEnter() {
      clearTimeout(this.reactionLeaveTimer)
      if (!this.isAuthed) return
      this.reactionHoverTimer = setTimeout(() => {
        this.showReactionPicker = true
      }, 500)
    },

    onReactionButtonLeave() {
      clearTimeout(this.reactionHoverTimer)
      this.reactionLeaveTimer = setTimeout(() => {
        this.showReactionPicker = false
      }, 300)
    },

    onReactionPickerEnter() {
      clearTimeout(this.reactionLeaveTimer)
    },

    onReactionPickerLeave() {
      this.reactionLeaveTimer = setTimeout(() => {
        this.showReactionPicker = false
      }, 300)
    },

    /**
     * core method to toggle or change a reaction.
     * calculates the counter diff (+1, -1, 0) for the news store.
     */
    applyReaction(reactionKey) {
      if (!this.isAuthed) {
        this.showToast('Please log in to react.')
        return
      }

      const postID = this.item.id
      const currentReactionKey = this.userReaction ? this.userReaction.key : null

      let diff = 0
      if (!currentReactionKey) {
        diff = 1
      } else if (currentReactionKey === reactionKey) {
        diff = -1
      }

      // 1. Update user state (persists via auth module)
      this.$store.dispatch('auth/toggleReaction', {
        postId: postID,
        reactionKey: reactionKey,
      })

      // 2. Update global total count (in-memory total)
      this.reactToNewsItem({ id: postID, diff })

      // 3. Optional: let parent know
      this.$emit('react', { id: postID, reaction: reactionKey })
    },

    selectReaction(reaction) {
      this.applyReaction(reaction.key)
      this.showReactionPicker = false
    },

    handleReactClick() {
      // Default to "like" if none selected, or toggle the current one off.
      this.applyReaction(this.userReaction ? this.userReaction.key : 'like')
    },

    // ==========================================
    // SHARE MODAL — centered on screen
    // ==========================================
    openShareModal() {
      this.showShareModal = true
      this.showEllipsisMenu = false
    },

    closeShareModal() {
      this.showShareModal = false
      this.shareCopied = false
    },

    getShareUrl() {
      return `${window.location.origin}/news#post-${this.item.id}`
    },

    handleShare(platform) {
      const url = this.getShareUrl()
      const title = encodeURIComponent(this.item.title || 'The Rose Blog')

      if (platform === 'facebook') {
        // Opens Facebook's "Create Post" composer — user pastes the link themselves.
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'width=626,height=436,noopener,noreferrer',
        )
      } else if (platform === 'twitter') {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${title}`,
          '_blank',
          'width=550,height=420,noopener,noreferrer',
        )
      } else if (platform === 'whatsapp') {
        window.open(
          `https://wa.me/?text=${title}%20${encodeURIComponent(url)}`,
          '_blank',
          'noopener,noreferrer',
        )
      } else if (platform === 'copy') {
        navigator.clipboard.writeText(url).then(() => {
          this.shareCopied = true
          this.showToast('Link copied to clipboard!')
          setTimeout(() => {
            this.shareCopied = false
          }, 2500)
        })
      }

      this.incrementShare(this.item.id)
      this.$emit('share', { id: this.item.id, platform })
    },

    // ==========================================
    // LIGHTBOX
    // ==========================================
    showLightbox(index) {
      this.lightboxIndex = index || 0
      this.lightboxVisible = true
    },

    hideLightbox() {
      this.lightboxVisible = false
    },

    // ==========================================
    // EDITING
    // ==========================================
    initiateEdit() {
      this.showEllipsisMenu = false
      if (!this.isOwner) return
      this.isEditing = true
      this.editTitle = this.item.title
      this.editContent = this.contentText
      this.editColor = this.item.color || ''
      this.editFragrance = this.item.fragrance || ''
      this.editBloomingSeason = this.item.bloomingSeason || ''
      this.editStrength = this.item.strength || 3
      this.editThornLevel = this.item.thornLevel || 'few'
      this.editIdealFor = this.item.idealFor || 'garden'
      this.activeDropdown = null
    },

    saveEdit() {
      if (this.editTitle.trim() && this.editContent.trim()) {
        this.$emit('edit', {
          id: this.item.id,
          title: this.editTitle.trim(),
          content: this.editContent.trim(),
          color: this.editColor,
          fragrance: this.editFragrance,
          bloomingSeason: this.editBloomingSeason,
          strength: Number(this.editStrength),
          thornLevel: this.editThornLevel,
          idealFor: this.editIdealFor,
        })
        this.isEditing = false
        this.showToast('Post updated successfully!')
      }
    },

    cancelEdit() {
      this.isEditing = false
      this.activeDropdown = null
    },

    requestDelete() {
      if (this.isEditing) this.cancelEdit()
      this.closeEllipsis()
      if (!this.isOwner) return
      if (window.confirm('Are you sure you want to delete this post?')) {
        this.$emit('delete', this.item.id)
      }
    },

    toggleDropdown(id) {
      this.activeDropdown = this.activeDropdown === id ? null : id
    },

    // ==========================================
    // COMMENTS
    // ==========================================
    submitComment() {
      if (!this.commentText.trim() || !this.isAuthed) return
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
      this.showToast('Comment posted!')
    },
  },

  beforeUnmount() {
    clearTimeout(this.toastTimer)
    clearTimeout(this.reactionHoverTimer)
    clearTimeout(this.reactionLeaveTimer)
  },
}
</script>

<template>
  <!-- Toast Notification -->
  <teleport to="body">
    <transition name="toast-fade">
      <div
        v-if="toastMessage"
        class="news-card__toast position-fixed d-flex align-items-center gap-2 shadow-lg"
        role="status"
        aria-live="polite"
      >
        <span class="material-symbols-outlined fs-5 text-primary">info</span>
        {{ toastMessage }}
      </div>
    </transition>
  </teleport>

  <!-- Main Card -->
  <article
    class="news-card frosted-glass rounded-4 shadow-sm p-3 position-relative d-flex flex-column gap-3 mb-1 w-100"
    :class="{
      'card-editing': isEditing,
      'overflow-visible': isEditing || activeDropdown,
      'z-index-top': isEditing || activeDropdown,
      'glass-off': isEditing || activeDropdown,
    }"
    :id="'post-' + item.id"
    role="article"
    :aria-labelledby="'post-title-' + item.id"
  >
    <!-- ── Header ── -->
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
          <span class="text-muted text-xs font-roboto">{{ formattedDate }}</span>
        </div>
      </div>

      <!-- A2: Category badge -->
      <div class="d-flex align-items-center gap-2">
        <span
          v-if="categoryMeta"
          class="category-badge d-inline-flex align-items-center gap-1"
          :class="categoryMeta.cls"
        >
          <span class="material-symbols-outlined" style="font-size: 11px">{{
            categoryMeta.icon
          }}</span>
          {{ item.type || item.category }}
        </span>

        <!-- Ellipsis -->
        <button
          class="btn btn-sm btn-light rounded-circle shadow-none p-1 d-flex align-items-center justify-content-center ellipsis-btn"
          @click.stop="toggleEllipsis"
          aria-label="Post options"
          aria-haspopup="true"
          :aria-expanded="showEllipsisMenu"
        >
          <span class="material-symbols-outlined fs-5">more_horiz</span>
        </button>
      </div>
    </div>

    <!-- A3: Ellipsis menu — teleported and positioned directly below its button -->
    <teleport to="body">
      <div
        v-if="showEllipsisMenu"
        v-click-outside="closeEllipsis"
        class="news-card__ellipsis-menu frosted-glass rounded-3 shadow-lg py-1 d-flex flex-column"
        :style="ellipsisStyle()"
        role="menu"
      >
        <button
          role="menuitem"
          class="btn btn-sm text-start px-3 py-2 w-100 d-flex align-items-center gap-2 menu-item"
          @click="handleToggleSave"
        >
          <span class="material-symbols-outlined fs-5">{{
            isSaved ? 'bookmark_added' : 'bookmark_add'
          }}</span>
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

    <!-- ── Edit form ── -->
    <div
      v-if="isEditing"
      class="edit-form bg-white rounded-4 p-3 d-flex flex-column gap-2"
      style="min-height: 380px; overflow: visible; position: relative; z-index: 200"
    >
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="fw-bold font-zilla fst-italic mb-0 text-primary">Update Post</h5>
        <button class="btn-close" @click="cancelEdit" aria-label="Cancel edit"></button>
      </div>

      <label class="form-label font-roboto fw-bold text-xs text-uppercase mb-0 opacity-75"
        >Title</label
      >
      <input
        v-model="editTitle"
        type="text"
        class="form-control form-control-sm fw-bold font-zilla mb-1 border-2"
        placeholder="Title"
      />

      <label class="form-label font-roboto fw-bold text-xs text-uppercase mb-0 opacity-75"
        >Content</label
      >
      <textarea
        v-model="editContent"
        class="form-control form-control-sm font-roboto border-2"
        placeholder="Share your botanical wisdom..."
        style="min-height: 120px; resize: vertical; width: 100%; box-sizing: border-box"
      ></textarea>

      <!-- Botanical Attributes — C1: dropdown z-index fixed via inline position:relative + high z-index -->
      <div
        class="rounded-4 border bg-light p-3 mt-2"
        style="position: relative; z-index: 300; overflow: visible"
      >
        <h6
          class="text-xs text-uppercase ls-wide fw-bold text-muted mb-3 d-flex align-items-center gap-2"
        >
          <span class="material-symbols-outlined fs-6">psychiatry</span> Botanical Attributes
        </h6>
        <div class="row g-2">
          <div class="col-6 col-md-4">
            <label class="form-label font-roboto fw-bold text-xs text-uppercase mb-1 opacity-75"
              >Color</label
            >
            <input
              v-model="editColor"
              type="text"
              class="form-control form-control-sm rounded-pill border-2"
            />
          </div>
          <div class="col-6 col-md-4">
            <label class="form-label font-roboto fw-bold text-xs text-uppercase mb-1 opacity-75"
              >Fragrance</label
            >
            <input
              v-model="editFragrance"
              type="text"
              class="form-control form-control-sm rounded-pill border-2"
            />
          </div>
          <div class="col-6 col-md-4">
            <label class="form-label font-roboto fw-bold text-xs text-uppercase mb-1 opacity-75"
              >Blooming</label
            >
            <input
              v-model="editBloomingSeason"
              type="text"
              class="form-control form-control-sm rounded-pill border-2"
            />
          </div>

          <!-- C1: Each dropdown wrapper gets position:relative + explicit z-index that decrements per row -->
          <div class="col-6 col-md-4" style="position: relative; z-index: 150">
            <label class="form-label font-roboto fw-bold text-xs text-uppercase mb-1 opacity-75"
              >Strength</label
            >
            <div class="custom-select-wrapper">
              <div
                class="select-display-custom form-control-sm rounded-pill border-2"
                @click.stop="toggleDropdown('edit-strength')"
              >
                <span class="text-xs">
                  {{
                    strengthOptions.find((o) => Number(o.value) === Number(editStrength))?.label ||
                    'Select...'
                  }}
                </span>
                <span
                  class="material-symbols-outlined fs-6 transition-base"
                  :class="{ 'rotate-180': activeDropdown === 'edit-strength' }"
                  >expand_more</span
                >
              </div>
              <transition name="fade">
                <div
                  class="dropdown-menu-custom"
                  v-if="activeDropdown === 'edit-strength'"
                  style="z-index: 9999; position: absolute"
                >
                  <div
                    v-for="opt in strengthOptions"
                    :key="opt.value"
                    class="dropdown-item-custom py-1"
                    :class="{ active: Number(editStrength) === Number(opt.value) }"
                    @click.stop="((editStrength = Number(opt.value)), (activeDropdown = null))"
                  >
                    <span class="text-xs">{{ opt.label }}</span>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <div class="col-6 col-md-4" style="position: relative; z-index: 140">
            <label class="form-label font-roboto fw-bold text-xs text-uppercase mb-1 opacity-75"
              >Thorns</label
            >
            <div class="custom-select-wrapper">
              <div
                class="select-display-custom form-control-sm rounded-pill border-2"
                @click.stop="toggleDropdown('edit-thorn')"
              >
                <span class="text-xs">{{
                  thornOptions.find((o) => o.value === editThornLevel)?.label || 'Select...'
                }}</span>
                <span
                  class="material-symbols-outlined fs-6 transition-base"
                  :class="{ 'rotate-180': activeDropdown === 'edit-thorn' }"
                  >expand_more</span
                >
              </div>
              <transition name="fade">
                <div
                  class="dropdown-menu-custom"
                  v-if="activeDropdown === 'edit-thorn'"
                  style="z-index: 9999; position: absolute"
                >
                  <div
                    v-for="opt in thornOptions"
                    :key="opt.value"
                    class="dropdown-item-custom py-1"
                    :class="{ active: editThornLevel === opt.value }"
                    @click.stop="((editThornLevel = opt.value), (activeDropdown = null))"
                  >
                    <span class="text-xs">{{ opt.label }}</span>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <div class="col-6 col-md-4" style="position: relative; z-index: 130">
            <label class="form-label font-roboto fw-bold text-xs text-uppercase mb-1 opacity-75"
              >Ideal For</label
            >
            <div class="custom-select-wrapper">
              <div
                class="select-display-custom form-control-sm rounded-pill border-2"
                @click.stop="toggleDropdown('edit-ideal')"
              >
                <span class="text-xs">{{
                  idealOptions.find((o) => o.value === editIdealFor)?.label || 'Select...'
                }}</span>
                <span
                  class="material-symbols-outlined fs-6 transition-base"
                  :class="{ 'rotate-180': activeDropdown === 'edit-ideal' }"
                  >expand_more</span
                >
              </div>
              <transition name="fade">
                <div
                  class="dropdown-menu-custom"
                  v-if="activeDropdown === 'edit-ideal'"
                  style="z-index: 9999; position: absolute"
                >
                  <div
                    v-for="opt in idealOptions"
                    :key="opt.value"
                    class="dropdown-item-custom py-1"
                    :class="{ active: editIdealFor === opt.value }"
                    @click.stop="((editIdealFor = opt.value), (activeDropdown = null))"
                  >
                    <span class="text-xs">{{ opt.label }}</span>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-2">
        <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="cancelEdit">
          Cancel
        </button>
        <button
          class="btn btn-sm btn-primary rounded-pill px-4 fw-bold shadow-sm"
          @click="saveEdit"
        >
          Save Changes
        </button>
      </div>
    </div>

    <!-- ── Layout rendering ── -->
    <div class="card-content-area" v-else>
      <!-- Layout B -->
      <div
        v-if="item.layoutType === 'B' && hasImage"
        class="layout-b rounded-4 overflow-hidden position-relative card-hover shadow-sm mb-2"
      >
        <div class="img-wrapper ratio ratio-1x1 cursor-pointer" @click="showLightbox(0)">
          <img
            v-lazy-load="item.images?.[0] || item.image"
            class="object-fit-cover w-100 h-100"
            :alt="item.title"
          />
        </div>

        <!-- A1: Redesigned photo count badge — top-right, high contrast -->
        <button
          v-if="extraPhotoCount > 0"
          class="photo-count-badge position-absolute d-flex align-items-center gap-1"
          @click.stop="showLightbox(1)"
          :aria-label="`View ${extraPhotoCount} more photo${extraPhotoCount > 1 ? 's' : ''}`"
        >
          <span class="material-symbols-outlined" style="font-size: 14px">photo_library</span>
          +{{ extraPhotoCount }}
        </button>

        <!-- A6: Gradient only on bottom third, not covering entire image -->
        <div class="layout-b__overlay position-absolute bottom-0 start-0 w-100 p-3 p-md-4">
          <h2
            :id="'post-title-' + item.id"
            class="fs-4 fw-bold fst-italic font-zilla mb-1 text-white text-shadow"
          >
            {{ item.title }}
          </h2>
          <div
            class="content-teaser text-gray-200 fw-normal font-roboto text-sm mb-1"
            :class="{ 'is-expanded': isExpanded }"
            v-html="contentText"
          ></div>
          <button
            v-if="isLongContent"
            class="read-more-link text-white"
            @click="isExpanded = !isExpanded"
          >
            {{ isExpanded ? 'Read less' : 'Read more' }}
          </button>
        </div>
      </div>

      <!-- Layout C -->
      <div v-else-if="item.layoutType === 'C'" class="layout-c d-flex flex-column gap-2">
        <div class="d-flex gap-3">
          <div
            v-if="hasImage"
            class="thumb-box flex-shrink-0 cursor-pointer position-relative shadow-sm"
            style="width: 80px; height: 80px"
            @click="showLightbox(0)"
          >
            <img
              v-lazy-load="item.images?.[0] || item.image"
              class="rounded-3 object-fit-cover w-100 h-100"
              :alt="item.title"
            />
            <button
              v-if="extraPhotoCount > 0"
              class="photo-count-badge position-absolute d-flex align-items-center gap-1 scale-down"
              @click.stop="showLightbox(1)"
              :aria-label="`${extraPhotoCount} more photos`"
            >
              +{{ extraPhotoCount }}
            </button>
          </div>
          <div class="flex-grow-1 overflow-hidden d-flex flex-column justify-content-center">
            <h2
              :id="'post-title-' + item.id"
              class="fs-5 fw-bold fst-italic font-zilla mb-0 text-dark"
            >
              {{ item.title }}
            </h2>
            <div class="text-muted text-xs font-roboto opacity-75">
              {{ formattedDate }} • {{ item.type || item.category }}
            </div>
          </div>
        </div>
        <!-- Content for C (now using same logic as A) -->
        <div
          class="content-teaser font-roboto text-muted text-sm mb-2"
          :class="{ 'is-expanded': isExpanded, 'has-mask': isLongContent && !isExpanded }"
          v-html="contentText"
        ></div>
        <button v-if="isLongContent" class="read-more-link" @click="isExpanded = !isExpanded">
          {{ isExpanded ? 'Read less' : 'Read more' }}
        </button>
      </div>

      <!-- Layout A (default) -->
      <div v-else class="layout-a">
        <div v-if="hasImage" class="position-relative mb-3 rounded-4 overflow-hidden">
          <img
            v-lazy-load="item.images?.[0] || item.image"
            class="w-100 rounded-4 object-fit-cover cursor-pointer layout-a__img"
            :alt="item.title"
            @click="showLightbox(0)"
          />
          <button
            v-if="extraPhotoCount > 0"
            class="photo-count-badge position-absolute d-flex align-items-center gap-1"
            @click.stop="showLightbox(1)"
            :aria-label="`${extraPhotoCount} more photos`"
          >
            <span class="material-symbols-outlined" style="font-size: 14px">photo_library</span>
            +{{ extraPhotoCount }}
          </button>
        </div>
        <h2 :id="'post-title-' + item.id" class="fs-4 fw-bold fst-italic font-zilla mb-2 text-dark">
          {{ item.title }}
        </h2>
        <div
          class="content-teaser font-roboto text-muted text-md mb-2"
          :class="{ 'is-expanded': isExpanded, 'has-mask': isLongContent && !isExpanded }"
          v-html="contentText"
        ></div>
        <button v-if="isLongContent" class="read-more-link" @click="isExpanded = !isExpanded">
          {{ isExpanded ? 'Read less' : 'Read more' }}
        </button>
      </div>
    </div>

    <!-- ── A5: Social row with Facebook-style reaction picker ── -->
    <div
      class="social-row d-flex align-items-center gap-3 pt-2 border-top border-light mt-auto position-relative"
    >
      <!-- Reaction picker popup -->
      <transition name="reaction-pop">
        <div
          v-if="showReactionPicker && isAuthed"
          class="reaction-picker d-flex align-items-center gap-1 position-absolute"
          @mouseenter="onReactionPickerEnter"
          @mouseleave="onReactionPickerLeave"
          role="toolbar"
          aria-label="React to post"
        >
          <button
            v-for="r in reactions"
            :key="r.key"
            class="reaction-emoji-btn"
            :class="{ 'is-selected': userReaction && userReaction.key === r.key }"
            @click="selectReaction(r)"
          >
            {{ r.emoji }}
          </button>
        </div>
      </transition>

      <!-- Reaction button -->
      <button
        class="interaction-btn d-flex align-items-center gap-1 px-2 py-1 rounded-pill transition-base border-0 bg-transparent"
        :class="{ active: !!userReaction }"
        @mouseenter="onReactionButtonEnter"
        @mouseleave="onReactionButtonLeave"
        @click="handleReactClick"
        aria-label="React to post"
        :aria-pressed="!!userReaction"
      >
        <span class="reaction-current">{{ reactionEmoji }}</span>
        <span class="fw-bold text-xs">{{ totalReactions }}</span>
      </button>

      <!-- Comments toggle -->
      <button
        class="interaction-btn d-flex align-items-center gap-2 px-2 py-1 rounded-pill transition-base border-0 bg-transparent"
        @click="showComments = !showComments"
        :aria-expanded="showComments"
        aria-label="Toggle comments"
      >
        <span class="material-symbols-outlined fs-5">chat_bubble</span>
        <span class="fw-bold text-xs">{{ (item.comments || []).length }}</span>
      </button>

      <!-- Share button -->
      <button
        class="interaction-btn d-flex align-items-center gap-2 px-2 py-1 rounded-pill transition-base ms-auto border-0 bg-transparent"
        @click="openShareModal"
        aria-label="Share this post"
      >
        <span class="material-symbols-outlined fs-5">share</span>
        <span class="fw-bold text-xs">{{ item.shares || 0 }}</span>
      </button>
    </div>

    <!-- ── Comments ── -->
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
        <div v-if="isAuthed" class="d-flex gap-2 align-items-center">
          <textarea
            class="form-control rounded-3 text-sm"
            rows="2"
            placeholder="Write a comment..."
            v-model="commentText"
            :aria-label="'Comment on ' + item.title"
          ></textarea>
          <button
            class="btn btn-primary rounded-pill btn-sm d-flex align-items-center"
            @click="submitComment"
            :disabled="!commentText.trim()"
            aria-label="Post comment"
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

    <!-- Lightbox -->
    <ImageLightbox
      :is-open="lightboxVisible"
      :images="lightboxImages"
      :initial-index="lightboxIndex"
      @close="hideLightbox"
    />
  </article>

  <!-- ── A4: Share Modal — centered on screen ── -->
  <teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="showShareModal"
        class="share-modal-overlay d-flex align-items-center justify-content-center"
        role="dialog"
        aria-modal="true"
        aria-label="Share post"
        @click.self="closeShareModal"
      >
        <div
          class="share-modal-box frosted-glass rounded-4 shadow-lg p-4 animate-fade-up glass-off"
        >
          <!-- Header -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="fw-bold font-zilla fst-italic fs-5 mb-0 text-dark">Share Post</h3>
            <button
              class="btn-close"
              @click="closeShareModal"
              aria-label="Close share modal"
            ></button>
          </div>

          <!-- Post preview -->
          <div
            class="share-modal__preview d-flex align-items-center gap-3 rounded-3 bg-light p-3 mb-4"
          >
            <img
              v-if="item.images?.[0] || item.image"
              :src="item.images?.[0] || item.image"
              class="rounded-3 object-fit-cover flex-shrink-0"
              style="width: 56px; height: 56px"
              :alt="item.title"
            />
            <div>
              <p class="fw-bold text-sm font-zilla mb-0 text-dark">{{ item.title }}</p>
              <p class="text-xs text-muted mb-0 font-roboto">The Rose Blog</p>
            </div>
          </div>

          <!-- Share options -->
          <div class="row g-2 mb-3">
            <div class="col-12">
              <button
                class="share-option-btn w-100 d-flex align-items-center gap-2 rounded-3 p-3 border-0 btn btn-outline-primary shadow-sm fw-bold text-sm font-roboto"
                @click="handleShare('twitter')"
              >
                <i class="bi bi-twitter-x fs-5"></i> Twitter / X
              </button>
            </div>
            <div class="col-12">
              <button
                class="share-option-btn w-100 d-flex align-items-center gap-2 rounded-3 p-3 border-0 btn btn-outline-primary shadow-sm fw-bold text-sm font-roboto"
                @click="handleShare('whatsapp')"
              >
                <i class="bi bi-whatsapp fs-5"></i> WhatsApp
              </button>
            </div>
          </div>

          <!-- URL display -->
          <div class="share-modal__url d-flex align-items-center gap-2 rounded-3 bg-light p-2 px-3">
            <span class="text-xs text-muted font-roboto flex-grow-1 text-truncate">{{
              getShareUrl()
            }}</span>
            <button
              class="btn btn-sm btn-secondary rounded-pill border-2 px-3 fw-medium text-sm"
              @click="handleShare('copy')"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';
@import '@/assets/base.scss';

// ── Sizing ──────────────────────────────────────────
.avatar-sm {
  width: 40px;
  height: 40px;
}
.cursor-pointer {
  cursor: pointer;
}

// ── A2: Category badges ──────────────────────────────
.category-badge {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  white-space: nowrap;

  &.badge-bush {
    background: rgba($pink, 0.35);
    color: darken($red, 10%);
    border: 1px solid rgba($red, 0.2);
  }
  &.badge-climbing {
    background: rgba(#c8f7c5, 0.6);
    color: #1a6b17;
    border: 1px solid rgba(#1a6b17, 0.2);
  }
  &.badge-guide {
    background: rgba(#fef3c7, 0.8);
    color: #92400e;
    border: 1px solid rgba(#92400e, 0.2);
  }
  &.badge-tips {
    background: rgba(#dbeafe, 0.8);
    color: #1e40af;
    border: 1px solid rgba(#1e40af, 0.2);
  }
}

// ── A1: Photo count badge ────────────────────────────
.photo-count-badge {
  top: 0.6rem;
  right: 0.6rem;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  cursor: pointer;
  backdrop-filter: blur(6px);
  font-family: 'Roboto Condensed', sans-serif;
  letter-spacing: 0.3px;
  transition:
    background 0.2s ease,
    transform 0.15s ease;
  line-height: 1;
  z-index: 5;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }
}

// ── A3: Ellipsis menu ───────────────────────────────
.news-card__ellipsis-menu {
  min-width: 150px;
  background: white;

  .menu-item {
    border-radius: 8px;
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }
}

// ── A5: Reaction picker ─────────────────────────────
.reaction-picker {
  bottom: calc(100% + 8px);
  left: 0;
  background: white;
  border-radius: 999px;
  padding: 0.4rem 0.6rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 500;
  gap: 0.15rem;
}

.reaction-emoji-btn {
  font-size: 1.4rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 50%;
  line-height: 1;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom center;

  &:hover,
  &.is-selected {
    transform: scale(1.5) translateY(-4px);
  }

  &.is-selected {
    background: rgba($red, 0.1);
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }
}

.reaction-current {
  font-size: 1rem;
  line-height: 1;
}
.reaction-label {
  font-family: 'Roboto Condensed', sans-serif;
}

.interaction-btn {
  color: $gray-600;
  cursor: pointer;
  font-size: 0.82rem;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  &.active {
    color: $primary;
    background: rgba($red, 0.08);
  }
}

// ── A6: Layout B — gradient on bottom third only ────
.layout-b {
  .img-wrapper img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .layout-b__overlay {
    // Gradient starts transparent and only darkens at the very bottom
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.82) 0%,
      rgba(0, 0, 0, 0.45) 40%,
      rgba(0, 0, 0, 0) 75%
    );
    padding-top: 3rem;
  }
}

// ── Layout A image height ────────────────────────────
.layout-a__img {
  max-height: 220px;
  width: 100%;
  object-fit: cover;
}

// ── Layout C thumb ───────────────────────────────────
.layout-c .thumb-box {
  width: 70px;
  height: 70px;
}

// ── Read more ────────────────────────────────────────
.read-more-link {
  background: none;
  border: none;
  padding: 0;
  color: $primary;
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.7;
  }
}

.content-teaser {
  max-height: 4.8rem;
  overflow: hidden;
  transition: max-height 0.4s ease;

  &.is-expanded {
    max-height: 200rem;
  }

  &.has-mask {
    -webkit-mask-image: linear-gradient(180deg, black 60%, transparent 100%);
    mask-image: linear-gradient(180deg, black 60%, transparent 100%);
  }
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
}

// ── A4: Share modal ──────────────────────────────────
.share-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 3500;
  padding: 1rem;
}

.share-modal-box {
  width: 100%;
  max-width: 400px;
  background: white;
}

.share-option-btn {
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  text-align: left;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
  }
}

// ── Toast ────────────────────────────────────────────
.news-card__toast {
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 999px;
  padding: 0.6rem 1.2rem;
  font-size: 0.85rem;
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

// ── Transitions ──────────────────────────────────────
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.reaction-pop-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.reaction-pop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.reaction-pop-enter-from,
.reaction-pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.9);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// ── Rotate chevron ───────────────────────────────────
.rotate-180 {
  transform: rotate(180deg);
}

// ── z-index-top ─────────────────────────────────────
.z-index-top {
  z-index: 100 !important;
}
.card-editing {
  z-index: 500 !important;
}
.overflow-visible {
  overflow: visible !important;
}
.glass-off {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background-color: white !important;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.12) !important;
}

// ── Edit form botanical container ────────────────────
.edit-form {
  overflow: visible !important;
  position: relative;
}
</style>
