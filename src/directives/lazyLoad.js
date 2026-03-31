/**
 * v-lazy-load directive
 *
 * Usage on <img>:
 *   <img v-lazy-load="imageUrl" alt="..." />
 *
 * The directive:
 *  1. Sets a lightweight placeholder SVG as src immediately.
 *  2. Stores the real URL in data-src.
 *  3. Uses IntersectionObserver to swap src → data-src when visible.
 *  4. Adds a fade-in animation on load.
 *  5. Falls back to eager loading if IntersectionObserver is unsupported.
 */

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3Crect width='4' height='3' fill='%23f0f0f0'/%3E%3C/svg%3E"

function loadImage(el) {
  const src = el.dataset.src
  if (!src) return

  el.style.transition = 'opacity 0.4s ease'
  el.style.opacity = '0'

  const img = new Image()
  img.src = src
  img.onload = () => {
    el.src = src
    el.style.opacity = '1'
    el.removeAttribute('data-src')
  }
  img.onerror = () => {
    // Keep placeholder on error; you could swap to an error SVG here
    el.style.opacity = '0.4'
  }
}

const observerMap = new WeakMap()

function createObserver(el) {
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
      rootMargin: '100px 0px',   // start loading 100px before entering viewport
      threshold: 0.01,
    },
  )
  observer.observe(el)
  observerMap.set(el, observer)
}

export const lazyLoad = {
  // Use inserted instead of beforeMount or mounted. Vue 3 directives have different hooks. Wait, the prompt provided:
  beforeMount(el, binding) {
    const src = binding.value
    if (!src) return

    el.dataset.src = src
    el.src = PLACEHOLDER

    if ('IntersectionObserver' in window) {
      createObserver(el)
    } else {
      // Fallback: load immediately
      loadImage(el)
    }
  },

  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      el.dataset.src = binding.value

      // If not yet loaded (data-src still present), update quietly
      if (el.dataset.src) {
        // No action needed — observer will pick up new src when visible
      } else {
        // Already loaded once; reload with new src
        loadImage(el)
      }
    }
  },

  unmounted(el) {
    if (observerMap.has(el)) {
      observerMap.get(el).unobserve(el)
      observerMap.delete(el)
    }
  },
}
