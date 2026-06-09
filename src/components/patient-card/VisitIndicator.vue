<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  indicator: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div
    class="indicator-box"
    :class="{ 'indicator-box--critical': indicator.critical }"
  >
    <div class="indicator-box__head">
      <span class="ind-label">{{ indicator.label }}</span>
      <Icon
        :icon="indicator.icon"
        width="16"
        :style="{ color: indicator.iconColor || 'var(--muted-foreground)' }"
      />
    </div>

    <div class="indicator-box__value-row">
      <span
        class="ind-value"
        :class="{ 'ind-value--small': indicator.valueSmall }"
      >
        {{ indicator.value }}
        <span v-if="indicator.unit" class="ind-unit">{{ indicator.unit }}</span>
      </span>
      <span class="badge" :class="`badge-${indicator.badgeVariant}`">
        <Icon :icon="indicator.badgeIcon" width="14" />
        {{ indicator.badge }}
      </span>
    </div>

    <div
      class="indicator-box__previous"
      :class="{ 'indicator-box__previous--ellipsis': indicator.label === 'ЭКГ' }"
    >
      {{ indicator.previous }}
    </div>
  </div>
</template>
