<script setup>
import { computed, reactive, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuth } from '../../auth/localAuth.js'
import { usePatientStore } from '../../services/patientStore.js'

const emit = defineEmits(['cancel', 'saved'])

const { currentUser } = useAuth()
const { isIinTaken, addPatient, error: storeError } = usePatientStore()

const bloodTypes = [
  '',
  'O(I) Rh+',
  'O(I) Rh-',
  'A(II) Rh+',
  'A(II) Rh-',
  'B(III) Rh+',
  'B(III) Rh-',
  'AB(IV) Rh+',
  'AB(IV) Rh-',
]

const form = reactive({
  name: '',
  iin: '',
  gender: 'male',
  birthDate: '',
  phone: '',
  bloodType: '',
  address: '',
})

const touched = ref(false)
const submitError = ref('')
const iinDuplicate = ref(false)
const isSubmitting = ref(false)

const iinFormatError = computed(() => {
  if (!touched.value && !form.iin) return ''
  if (!/^\d{12}$/.test(form.iin)) {
    return 'ИИН должен состоять из 12 цифр'
  }
  return ''
})

const iinError = computed(() => {
  if (iinFormatError.value) return iinFormatError.value
  if (iinDuplicate.value) return 'Пациент с таким ИИН уже существует'
  return ''
})

const nameError = computed(() => {
  if (!touched.value && !form.name) return ''
  if (!form.name.trim()) return 'Укажите ФИО пациента'
  return ''
})

const birthDateError = computed(() => {
  if (!touched.value && !form.birthDate) return ''
  if (!form.birthDate) return 'Укажите дату рождения'
  return ''
})

const hasErrors = computed(
  () => Boolean(nameError.value || iinError.value || birthDateError.value),
)

function onIinInput(event) {
  form.iin = event.target.value.replace(/\D/g, '').slice(0, 12)
  submitError.value = ''
  iinDuplicate.value = false
}

async function checkIinDuplicate() {
  if (!/^\d{12}$/.test(form.iin)) {
    iinDuplicate.value = false
    return
  }

  iinDuplicate.value = await isIinTaken(form.iin)
}

async function save(addVisit = false) {
  touched.value = true
  submitError.value = ''
  await checkIinDuplicate()

  if (hasErrors.value) return

  isSubmitting.value = true
  const id = await addPatient({ ...form }, currentUser.value)
  isSubmitting.value = false

  if (!id) {
    submitError.value = storeError.value || 'Не удалось сохранить пациента'
    return
  }

  emit('saved', { id, addVisit })
}
</script>

<template>
  <div class="form-card">
    <div class="form-grid">
      <div class="form-group full-width">
        <label class="form-label" for="patient-name">
          ФИО <span class="required">*</span>
        </label>
        <input
          id="patient-name"
          v-model="form.name"
          type="text"
          class="form-control"
          :class="{ error: nameError }"
          placeholder="Введите фамилию, имя и отчество"
          @blur="touched = true"
        />
        <span v-if="nameError" class="form-error">{{ nameError }}</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="patient-iin">
          ИИН <span class="required">*</span>
        </label>
        <input
          id="patient-iin"
          type="text"
          inputmode="numeric"
          class="form-control"
          :class="{ error: iinError }"
          placeholder="123456789012"
          :value="form.iin"
          @input="onIinInput"
          @blur="touched = true; checkIinDuplicate()"
        />
        <span v-if="iinError" class="form-error">{{ iinError }}</span>
      </div>

      <div class="form-group">
        <span class="form-label">Пол <span class="required">*</span></span>
        <div class="radio-group">
          <label class="radio-label">
            <input v-model="form.gender" type="radio" value="male" />
            <span class="radio-custom" />
            Мужской
          </label>
          <label class="radio-label">
            <input v-model="form.gender" type="radio" value="female" />
            <span class="radio-custom" />
            Женский
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="patient-birth-date">
          Дата рождения <span class="required">*</span>
        </label>
        <div class="form-control-wrap">
          <input
            id="patient-birth-date"
            v-model="form.birthDate"
            type="date"
            class="form-control"
            :class="{ error: birthDateError }"
            @blur="touched = true"
          />
          <span class="form-control-wrap__icon">
            <Icon icon="lucide:calendar" width="16" />
          </span>
        </div>
        <span v-if="birthDateError" class="form-error">{{ birthDateError }}</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="patient-phone">Телефон</label>
        <input
          id="patient-phone"
          v-model="form.phone"
          type="tel"
          class="form-control"
          placeholder="+7 (___) ___-__-__"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="patient-blood-type">Группа крови</label>
        <select
          id="patient-blood-type"
          v-model="form.bloodType"
          class="form-control form-control--select"
        >
          <option value="">Выберите группу крови</option>
          <option v-for="type in bloodTypes.slice(1)" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <div class="form-group full-width">
        <label class="form-label" for="patient-address">Адрес проживания</label>
        <textarea
          id="patient-address"
          v-model="form.address"
          class="form-control form-control--textarea"
          placeholder="Город, улица, дом, квартира"
          rows="3"
        />
      </div>
    </div>

    <p v-if="submitError" class="form-error" style="margin-top: 16px">
      {{ submitError }}
    </p>

    <div class="form-actions">
      <button type="button" class="btn btn-outline" @click="emit('cancel')">
        Отмена
      </button>
      <button
        type="button"
        class="btn btn-outline"
        :disabled="isSubmitting"
        @click="save(false)"
      >
        Сохранить
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="isSubmitting"
        @click="save(true)"
      >
        <Icon icon="lucide:save" width="16" />
        Сохранить и добавить визит
      </button>
    </div>
  </div>
</template>
