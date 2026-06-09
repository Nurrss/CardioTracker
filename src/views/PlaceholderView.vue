<script setup>
import AppLayout from '../layouts/AppLayout.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <AppLayout>
    <h1 class="page-title">{{ title }}</h1>
    <p style="color: var(--muted-foreground)">Раздел в разработке</p>
  </AppLayout>
</template>
