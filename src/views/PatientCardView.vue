<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../layouts/AppLayout.vue'
import PatientProfileCard from '../components/patient-card/PatientProfileCard.vue'
import PatientAlertsCard from '../components/patient-card/PatientAlertsCard.vue'
import VisitCard from '../components/patient-card/VisitCard.vue'
import NewVisitDrawer from '../components/visits/NewVisitDrawer.vue'
import { useAuth } from '../auth/localAuth.js'
import { usePatientStore } from '../services/patientStore.js'

const route = useRoute()
const router = useRouter()
const { currentUser } = useAuth()
const {
  loadPatientById,
  addVisit,
  invalidatePatient,
  loading,
  error,
} = usePatientStore()

const tabs = [
  { id: 'visits', label: 'История визитов' },
  { id: 'charts', label: 'Динамика показателей (графики)' },
  { id: 'prescriptions', label: 'Назначения врача' },
]

const activeTab = ref('visits')
const expandedVisitId = ref(null)
const visitDrawerOpen = ref(false)
const patient = ref(null)
const saveError = ref('')

async function fetchPatient() {
  saveError.value = ''
  patient.value = await loadPatientById(route.params.id)

  if (!patient.value) {
    router.replace({ name: 'patients' })
    return
  }

  const latestVisit = patient.value.visits.find((visit) => visit.isLatest)
  expandedVisitId.value = latestVisit?.id ?? patient.value.visits[0]?.id ?? null
}

watch(
  () => route.params.id,
  () => {
    invalidatePatient(route.params.id)
    fetchPatient()
  },
  { immediate: true },
)

watch(
  () => route.name,
  (name) => {
    visitDrawerOpen.value = name === 'patient-visit-new'
  },
  { immediate: true },
)

function openVisitDrawer() {
  router.push({
    name: 'patient-visit-new',
    params: { id: route.params.id },
  })
}

function closeVisitDrawer() {
  router.push({
    name: 'patient-card',
    params: { id: route.params.id },
  })
}

function toggleVisit(visitId) {
  expandedVisitId.value = expandedVisitId.value === visitId ? null : visitId
}

async function onSaveVisit(form) {
  saveError.value = ''
  const ok = await addVisit(route.params.id, form, currentUser.value)

  if (!ok) {
    saveError.value = error.value || 'Не удалось сохранить визит'
    return
  }

  invalidatePatient(route.params.id)
  await fetchPatient()
  closeVisitDrawer()
  activeTab.value = 'visits'
}
</script>

<template>
  <AppLayout v-if="patient" class="patient-card-page">
    <RouterLink :to="{ name: 'patients' }" class="back-link">
      <Icon icon="lucide:arrow-left" width="16" />
      Назад к списку пациентов
    </RouterLink>

    <div class="page-header">
      <h1 class="page-title">{{ patient.name }}</h1>
      <div class="page-header__actions">
        <button type="button" class="btn btn-outline">
          <Icon icon="lucide:printer" width="16" />
          Печать карты
        </button>
        <button type="button" class="btn btn-primary" @click="openVisitDrawer">
          <Icon icon="lucide:plus" width="18" />
          Новый визит
        </button>
      </div>
    </div>

    <p v-if="error" class="form-error" style="margin-bottom: 16px">{{ error }}</p>

    <div class="info-alert-grid">
      <PatientProfileCard :patient="patient" />
      <PatientAlertsCard :alerts="patient.alerts" />
    </div>

    <div class="tabs-container">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="activeTab === 'visits'" class="visit-list">
      <VisitCard
        v-for="visit in patient.visits"
        :key="visit.id"
        :visit="visit"
        :expanded="expandedVisitId === visit.id"
        @toggle="toggleVisit(visit.id)"
      />

      <div v-if="!patient.visits.length" class="tab-panel-placeholder">
        Визитов пока нет. Нажмите «Новый визит», чтобы добавить первый.
      </div>

      <div v-else class="visit-list__load-more">
        <button type="button" class="btn btn-outline">
          Загрузить более ранние визиты
        </button>
      </div>
    </div>

    <div v-else class="tab-panel-placeholder">
      Раздел «{{ tabs.find((tab) => tab.id === activeTab)?.label }}» в разработке
    </div>

    <NewVisitDrawer
      :open="visitDrawerOpen"
      :patient="patient"
      :save-error="saveError"
      @close="closeVisitDrawer"
      @save="onSaveVisit"
    />
  </AppLayout>

  <AppLayout v-else-if="loading">
    <p class="tab-panel-placeholder">Загрузка карты пациента...</p>
  </AppLayout>
</template>
