<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  alerts: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div
    class="patient-alerts-card"
    :class="{ 'patient-alerts-card--empty': alerts.length === 0 }"
  >
    <template v-if="alerts.length">
      <h3 class="patient-alerts-card__title">
        <Icon icon="lucide:alert-triangle" width="18" />
        Системные предупреждения
      </h3>

      <div v-for="(alert, index) in alerts" :key="index" class="alert-item">
        <div class="alert-item__icon">
          <Icon :icon="alert.icon" width="18" />
        </div>
        <div>
          <strong>{{ alert.title }}</strong>
          {{ alert.text }}
        </div>
      </div>
    </template>

    <p v-else class="patient-alerts-card__empty-text">
      Активных системных предупреждений нет
    </p>
  </div>
</template>
