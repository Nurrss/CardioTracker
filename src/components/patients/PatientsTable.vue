<script setup>
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'

defineProps({
  patients: {
    type: Array,
    required: true,
  },
})

const riskLabel = (stage) => `Стадия ${stage}`
</script>

<template>
  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th>ФИО / ИИН</th>
          <th>Возраст</th>
          <th>Последний визит</th>
          <th>Статус риска</th>
          <th>NT-proBNP</th>
          <th>Следующий визит</th>
          <th class="action-cell" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="patient in patients" :key="patient.id">
          <td>
            <div class="patient-name-cell">
              <span class="patient-name">{{ patient.name }}</span>
              <span class="patient-iin">{{ patient.iin }}</span>
            </div>
          </td>
          <td>{{ patient.age }}</td>
          <td class="date-cell">{{ patient.lastVisit }}</td>
          <td>
            <span class="badge" :class="`badge-${patient.riskVariant}`">
              {{ riskLabel(patient.riskStage) }}
            </span>
          </td>
          <td>
            <span class="badge" :class="`badge-${patient.bnpVariant}`">
              <Icon :icon="patient.bnpIcon" width="14" />
              {{ patient.bnpLabel }}
            </span>
          </td>
          <td
            class="date-cell"
            :class="{ 'date-highlight': patient.nextVisitHighlight }"
          >
            {{ patient.nextVisit }}
          </td>
          <td class="action-cell">
            <RouterLink
              :to="{ name: 'patient-card', params: { id: patient.id } }"
              class="btn btn-outline"
            >
              Открыть карту
            </RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
