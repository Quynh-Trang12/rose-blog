/**
 * ==========================================
 * FILE: directives/lazyLoad.js
 * ==========================================
 * Description:
 * A custom Vue 3 directive (v-lazy-load) that implements
 * IntersectionObserver-based lazy loading for images. When an <img>
 * element enters the viewport, the directive swaps the placeholder
 * SVG with the real source URL and applies a fade-in animation.
 *
 * Usage:
 *   <img v-lazy-load="imageUrl" alt="..." />
 *
 * Behaviour:
 *  1. Sets a lightweight placeholder SVG as src immediately.
 *  2. Stores the real URL in data-src.
 *  3. Uses IntersectionObserver to swap src → data-src when visible.
 *  4. Adds a fade-in animation on load.
 *  5. Falls back to eager loading if IntersectionObserver is unsupported.
 */

// Explanation: A minimal 4:3 grey rectangle SVG encoded as a data URI.
// This displays instantly and prevents layout shift while the real image loads.
const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3Crect width='4' height='3' fill='%23f0f0f0'/%3E%3C/svg%3E"

/**
 * Initiates the actual image loading process for an element.
 * Explanation: Creates a hidden Image() to preload the target URL.
 * Once loaded, swaps the src and fades the element in. On error,
 * reduces opacity to indicate the failure state.
 * @param {HTMLImageElement} el - The target <img> element
 */
const loadImage = (el) => {
  const src = el.dataset.src
  if (!src) return

  // Explanation: Start with opacity 0 for the fade-in effect.
  el.style.transition = 'opacity 0.4s ease'
  el.style.opacity = '0'

  const img = new Image()
  img.src = src
  img.onload = () => {
    // Explanation: Replace placeholder with the real image.
    el.src = src
    el.style.opacity = '1'
    el.removeAttribute('data-src')
  }
  img.onerror = () => {
    // Explanation: Keep placeholder on error; reduce opacity to signal failure.
    el.style.opacity = '0.4'
  }
}

// Explanation: WeakMap to track which elements have active observers,
// allowing proper cleanup on unmount or re-observe.
const observerMap = new WeakMap()

/**
 * Creates and attaches an IntersectionObserver to the target element.
 * Explanation: The observer watches for the element entering the viewport
 * (with a 100px root margin for preloading) and triggers image loading.
 * After loading, the observer is disconnected for that element.
 * @param {HTMLImageElement} el - The target <img> element
 */
const createObserver = (el) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage(entry.target)
          observer.unobserve(entry.target)
          observerMap.delete(entry.target)
        }
      })
    },
    {
      // Explanation: Start loading 100px before the element enters the viewport.
      rootMargin: '100px 0px',
      threshold: 0.01,
    },
  )
  observer.observe(el)
  observerMap.set(el, observer)
}

/**
 * The exported directive object conforming to Vue 3's directive lifecycle hooks.
 * Explanation: Implements mounted, updated, and unmounted hooks.
 */
export const lazyLoad = {
  /**
   * Called when the directive is first bound to the element and inserted into the DOM.
   * Explanation: Sets the placeholder, stores the real URL, and attaches the observer.
   * @param {HTMLImageElement} el - The target element
   * @param {Object} binding - Vue directive binding (binding.value = image URL)
   */
  mounted(el, binding) {
    const src = binding.value
    if (!src) return

    el.dataset.src = src
    el.src = PLACEHOLDER

    if ('IntersectionObserver' in window) {
      createObserver(el)
    } else {
      // Explanation: Fallback for browsers without IntersectionObserver support.
      loadImage(el)
    }
  },

  /**
   * Called when the bound value changes (e.g., dynamic :src via v-lazy-load).
   * Explanation: If the URL has changed, updates data-src. If the image was
   * already loaded (no data-src), triggers a reload with the new URL.
   * @param {HTMLImageElement} el - The target element
   * @param {Object} binding - Vue directive binding
   */
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      el.dataset.src = binding.value

      if (!el.dataset.src) {
        // Explanation: Already loaded once — reload with new src.
        loadImage(el)
      }
      // Explanation: If not yet loaded, the observer will pick up the new URL.
    }
  },

  /**
   * Called when the directive is unbound from the element.
   * Explanation: Cleans up the IntersectionObserver to prevent memory leaks.
   * @param {HTMLImageElement} el - The target element
   */
  unmounted(el) {
    if (observerMap.has(el)) {
      observerMap.get(el).unobserve(el)
      observerMap.delete(el)
    }
  },
}
