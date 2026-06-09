<script setup>
import { Icon } from '@iconify/vue'
import VisitIndicator from './VisitIndicator.vue'

const props = defineProps({
  visit: {
    type: Object,
    required: true,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <div class="visit-card" :class="{ expanded }">
    <button type="button" class="visit-header" @click="emit('toggle')">
      <div class="visit-header__left">
        <div
          class="visit-header__icon"
          :class="
            visit.isLatest
              ? 'visit-header__icon--active'
              : 'visit-header__icon--inactive'
          "
        >
          <Icon
            :icon="visit.isLatest ? 'lucide:stethoscope' : 'lucide:calendar'"
            width="20"
          />
        </div>
        <div>
          <h3
            class="visit-header__title"
            :class="{ 'visit-header__title--inactive': !visit.isLatest }"
          >
            Визит от {{ visit.date }}
          </h3>
          <p class="visit-header__meta">
            Врач: {{ visit.doctor }} • {{ visit.type }}
          </p>
        </div>
      </div>

      <div class="visit-header__right">
        <button
          v-if="expanded && visit.indicators"
          type="button"
          class="btn btn-outline"
          style="background: var(--card)"
          @click.stop
        >
          <Icon icon="lucide:file-text" width="16" />
          Назначения
        </button>
        <span v-if="visit.riskBadge" class="badge badge-destructive">
          {{ visit.riskBadge }}
        </span>
        <span class="visit-header__chevron">
          <Icon
            :icon="expanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            width="24"
          />
        </span>
      </div>
    </button>

    <div v-if="expanded && visit.indicators" class="visit-body">
      <h4 class="visit-body__section-title">
        Ключевые показатели (динамика к прошлому визиту)
      </h4>

      <div class="indicators-grid">
        <VisitIndicator
          v-for="(indicator, index) in visit.indicators"
          :key="index"
          :indicator="indicator"
        />
      </div>

      <div v-if="visit.conclusion" class="visit-conclusion">
        <h4 class="visit-conclusion__title">Заключение врача</h4>
        <p class="visit-conclusion__text">{{ visit.conclusion }}</p>
      </div>
    </div>
  </div>
</template>
