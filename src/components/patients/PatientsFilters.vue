<script setup>
import { Icon } from '@iconify/vue'
import { filters } from '../../data/patients.js'

const activeFilter = defineModel({ type: String, default: 'all' })
</script>

<template>
  <div class="filters-bar">
    <button
      v-for="filter in filters"
      :key="filter.id"
      type="button"
      class="filter-chip"
      :class="{ active: activeFilter === filter.id }"
      @click="activeFilter = filter.id"
    >
      <Icon
        v-if="filter.icon"
        :icon="filter.icon"
        width="14"
        :style="{ color: filter.iconColor }"
      />
      {{ filter.label }}
    </button>
  </div>
</template>
