import { computed, ref } from 'vue'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import {
  mapPatientCard,
  mapPatientInsert,
  mapPatientListItem,
  mapVisitInsert,
} from './mappers/patientMappers.js'

const patients = ref([])
const patientCache = ref({})
const loading = ref(false)
const error = ref(null)

function setError(message) {
  error.value = message
}

function clearError() {
  error.value = null
}

function groupLatestVisits(visits) {
  const map = new Map()

  for (const visit of visits) {
    if (!map.has(visit.patient_id)) {
      map.set(visit.patient_id, visit)
    }
  }

  return map
}

export function usePatientStore() {
  const allPatients = computed(() => patients.value)

  async function loadPatients() {
    if (!isSupabaseConfigured) {
      setError('Supabase не настроен. Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env')
      patients.value = []
      return
    }

    loading.value = true
    clearError()

    const { data: patientRows, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })

    if (patientsError) {
      setError(patientsError.message)
      loading.value = false
      return
    }

    const { data: visitRows, error: visitsError } = await supabase
      .from('visits')
      .select('*')
      .order('visit_date', { ascending: false })

    if (visitsError) {
      setError(visitsError.message)
      loading.value = false
      return
    }

    const latestVisits = groupLatestVisits(visitRows || [])
    patients.value = (patientRows || []).map((patient) =>
      mapPatientListItem(patient, latestVisits.get(patient.id)),
    )
    loading.value = false
  }

  async function loadPatientById(id) {
    if (!isSupabaseConfigured) {
      setError('Supabase не настроен')
      return null
    }

    if (patientCache.value[id]) {
      return patientCache.value[id]
    }

    loading.value = true
    clearError()

    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (patientError) {
      setError(patientError.message)
      loading.value = false
      return null
    }

    if (!patient) {
      loading.value = false
      return null
    }

    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .select('*')
      .eq('patient_id', id)
      .order('visit_date', { ascending: false })

    if (visitsError) {
      setError(visitsError.message)
      loading.value = false
      return null
    }

    const mapped = mapPatientCard(patient, visits || [])
    patientCache.value[id] = mapped
    loading.value = false
    return mapped
  }

  function getPatientById(id) {
    return patientCache.value[id] || null
  }

  function invalidatePatient(id) {
    delete patientCache.value[id]
  }

  async function isIinTaken(iin, excludeId = null) {
    if (!isSupabaseConfigured) return false

    let query = supabase.from('patients').select('id').eq('iin', iin).limit(1)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error: lookupError } = await query

    if (lookupError) {
      setError(lookupError.message)
      return false
    }

    return (data?.length ?? 0) > 0
  }

  async function addPatient(form, staff) {
    if (!isSupabaseConfigured) {
      setError('Supabase не настроен')
      return null
    }

    clearError()

    const { data, error: insertError } = await supabase
      .from('patients')
      .insert(mapPatientInsert(form, staff))
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
      return null
    }

    await loadPatients()
    return data.id
  }

  async function addVisit(patientId, form, staff) {
    if (!isSupabaseConfigured) {
      setError('Supabase не настроен')
      return false
    }

    clearError()

    const { error: insertError } = await supabase
      .from('visits')
      .insert(mapVisitInsert(patientId, form, staff))

    if (insertError) {
      setError(insertError.message)
      return false
    }

    invalidatePatient(patientId)
    await loadPatients()
    return true
  }

  return {
    allPatients,
    loading,
    error,
    isSupabaseConfigured,
    loadPatients,
    loadPatientById,
    getPatientById,
    invalidatePatient,
    isIinTaken,
    addPatient,
    addVisit,
  }
}
