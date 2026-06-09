<script setup>
import { useRouter } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import PatientForm from '../components/patients/PatientForm.vue'

const router = useRouter()

function onCancel() {
  router.push({ name: 'patients' })
}

function onSaved({ id, addVisit }) {
  if (addVisit) {
    router.push({ name: 'patient-visit-new', params: { id } })
    return
  }

  router.push({ name: 'patients' })
}
</script>

<template>
  <AppLayout>
    <div class="page-header">
      <h1 class="page-title">Добавление пациента</h1>
    </div>

    <PatientForm @cancel="onCancel" @saved="onSaved" />
  </AppLayout>
</template>
