<script setup>
import { computed, onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import AppLayout from '../layouts/AppLayout.vue';
import PatientsFilters from '../components/patients/PatientsFilters.vue';
import PatientsTable from '../components/patients/PatientsTable.vue';
import { usePatientStore } from '../services/patientStore.js';

const { allPatients, loadPatients, loading, error, isSupabaseConfigured } =
  usePatientStore();

const searchQuery = ref('');
const activeFilter = ref('all');

const filteredPatients = computed(() => {
  let result = allPatients.value;

  const query = searchQuery.value.trim().toLowerCase();
  if (query) {
    result = result.filter(
      (p) => p.name.toLowerCase().includes(query) || p.iin.includes(query)
    );
  }

  switch (activeFilter.value) {
    case 'riskCD':
      return result.filter((p) => p.riskStage === 'C' || p.riskStage === 'D');
    case 'alerts':
      return result.filter((p) => p.hasAlert);
    case 'visit7days':
      return result.filter((p) => p.nextVisitHighlight);
    default:
      return result;
  }
});

onMounted(() => {
  loadPatients();
});
</script>

<template>
  <AppLayout v-model:search="searchQuery">
    <div class="page-header">
      <h1 class="page-title">Список пациентов</h1>
      <RouterLink
        :to="{ name: 'patients-new' }"
        class="btn btn-primary btn-new-patient"
      >
        <Icon icon="lucide:plus" width="18" />
        Новый пациент
      </RouterLink>
    </div>

    <p v-if="!isSupabaseConfigured" class="tab-panel-placeholder">
      Supabase не подключён. Создайте файл <code>.env</code> по образцу
      <code>.env.example</code> и выполните SQL из
      <code>supabase/migrations/001_initial_schema.sql</code>
    </p>

    <p v-else-if="error" class="form-error" style="margin-bottom: 16px">
      {{ error }}
    </p>

    <p v-else-if="loading && !allPatients.length" class="tab-panel-placeholder">
      Загрузка пациентов...
    </p>

    <template v-else>
      <PatientsFilters v-model="activeFilter" />
      <PatientsTable :patients="filteredPatients" />
    </template>
  </AppLayout>
</template>
