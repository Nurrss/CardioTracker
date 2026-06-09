<script setup>
import AppSidebar from '../components/layout/AppSidebar.vue'
import AppTopbar from '../components/layout/AppTopbar.vue'

const search = defineModel('search', { type: String, default: '' })
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-wrapper">
      <AppTopbar v-model:search="search" />
      <main class="content-area">
        <slot />
      </main>
    </div>
  </div>
</template>
