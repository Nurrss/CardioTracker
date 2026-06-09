<script setup>
import { Icon } from '@iconify/vue'

const search = defineModel('search', { type: String, default: '' })
</script>

<template>
  <header class="topbar">
    <div class="global-search">
      <Icon icon="lucide:search" width="18" />
      <input
        v-model="search"
        type="text"
        placeholder="Быстрый поиск по ИИН или ФИО..."
      />
    </div>

    <div class="topbar-actions">
      <button type="button" class="icon-btn" aria-label="Справка">
        <Icon icon="lucide:help-circle" width="20" />
      </button>
      <button type="button" class="icon-btn" aria-label="Уведомления">
        <Icon icon="lucide:bell" width="20" />
        <span class="icon-btn__dot" />
      </button>
    </div>
  </header>
</template>
