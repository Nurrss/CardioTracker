<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  patient: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="patient-profile-card">
    <div class="profile-avatar profile-avatar--placeholder" aria-hidden="true">
      <Icon icon="lucide:user" width="36" />
      <span class="profile-avatar__label">Нет фото</span>
    </div>
    <div class="profile-details">
      <div class="detail-col">
        <div class="detail-group">
          <span class="detail-label">ИИН</span>
          <span class="detail-value">{{ patient.iin }}</span>
        </div>
        <div class="detail-group">
          <span class="detail-label">Дата рождения</span>
          <span class="detail-value">{{ patient.birthDate }}</span>
        </div>
        <div class="detail-group">
          <span class="detail-label">Пол</span>
          <span class="detail-value">{{ patient.gender }}</span>
        </div>
      </div>
      <div class="detail-col">
        <div class="detail-group">
          <span class="detail-label">Телефон</span>
          <span class="detail-value">{{ patient.phone }}</span>
        </div>
        <div class="detail-group">
          <span class="detail-label">Адрес</span>
          <span class="detail-value">{{ patient.address }}</span>
        </div>
        <div class="detail-group">
          <span class="detail-label">Группа крови</span>
          <span class="detail-value">{{ patient.bloodType }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
