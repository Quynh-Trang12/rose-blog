<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center py-5">
    <div class="text-center animate-fade-up px-4" style="max-width:480px">
      <span class="material-symbols-outlined text-primary mb-3 d-block" style="font-size:4rem">lock</span>
      <h1 class="display-6 fw-bold fst-italic mb-2" style="font-family:'Zilla Slab';color:#333">
        Members Only
      </h1>
      <p class="text-muted mb-4" style="font-family:'Roboto Condensed'">
        You need to be logged in to access this section of The Rose Blog. Please sign in to continue.
      </p>
      <div class="d-flex gap-3 justify-content-center flex-wrap">
        <button class="btn btn-primary rounded-pill px-4 fw-bold" @click="router.push('/')">
          Go Home
        </button>
        <button class="btn btn-outline-primary rounded-pill px-4 fw-bold" @click="router.go(-1)">
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>
