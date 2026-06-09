<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import {
  calculateBmi,
  formatShortName,
  getAltAstRatio,
  getBnpStatus,
  getCreatinineStatus,
  getEfRisk,
  getHbStatus,
  getWalkTestClass,
} from '../../utils/visitCalculations.js'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  patient: {
    type: Object,
    default: null,
  },
  saveError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'save'])

const ecgOptions = [
  'Синусовая тахикардия, признаки гипертрофии ЛЖ.',
  'ФП, ЧСС в пределах нормы.',
  'Ритм синусовый, без острых изменений.',
  'ST депрессия, признаки ишемии.',
]

const form = reactive({
  ef: '',
  walkTest: '',
  bnp: '',
  ecgConclusion: ecgOptions[0],
  ecgTags: {
    fp: false,
    tachycardia: true,
    blocks: false,
    stChanges: false,
  },
  height: '',
  weight: '',
  hb: '',
  hct: '',
  urea: '',
  creatinine: '',
  alt: '',
  ast: '',
  nextVisitDate: '',
  conclusion: '',
})

const touched = ref(false)

const previousCreatinine = computed(() => {
  const latestVisit = props.patient?.visits?.find((visit) => visit.isLatest)
    || props.patient?.visits?.[0]
  const indicator = latestVisit?.indicators?.find((item) => item.label === 'Креатинин')
  if (!indicator) return null
  const match = indicator.value?.match(/\d+/)
  return match ? Number(match[0]) : null
})

const efRisk = computed(() => getEfRisk(form.ef))
const walkClass = computed(() => getWalkTestClass(form.walkTest))
const bnpStatus = computed(() => getBnpStatus(form.bnp))
const bmiResult = computed(() => calculateBmi(form.height, form.weight))
const hbStatus = computed(() => getHbStatus(form.hb))
const creatinineStatus = computed(() =>
  getCreatinineStatus(form.creatinine, previousCreatinine.value),
)
const altAstRatio = computed(() => getAltAstRatio(form.alt, form.ast))

const efError = computed(() => {
  if (!touched.value && !form.ef) return ''
  if (form.ef === '' || Number.isNaN(Number(form.ef))) {
    return 'Укажите ФВ/ЛЖ'
  }
  return ''
})

const bnpError = computed(() => {
  if (!touched.value && !form.bnp) return ''
  if (form.bnp === '' || Number.isNaN(Number(form.bnp))) {
    return 'Укажите NT-proBNP'
  }
  return ''
})

const nextVisitError = computed(() => {
  if (!touched.value && !form.nextVisitDate) return ''
  if (!form.nextVisitDate) return 'Укажите дату следующего визита'
  return ''
})

const hasErrors = computed(
  () => Boolean(efError.value || bnpError.value || nextVisitError.value),
)

const patientShortName = computed(() =>
  props.patient ? formatShortName(props.patient.name) : '',
)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return

    Object.assign(form, {
      ef: '',
      walkTest: '',
      bnp: '',
      ecgConclusion: ecgOptions[0],
      ecgTags: {
        fp: false,
        tachycardia: false,
        blocks: false,
        stChanges: false,
      },
      height: '',
      weight: '',
      hb: '',
      hct: '',
      urea: '',
      creatinine: '',
      alt: '',
      ast: '',
      nextVisitDate: '',
      conclusion: '',
    })
    touched.value = false
  },
)

function onSave() {
  touched.value = true
  if (hasErrors.value) return
  emit('save', { ...form, ecgTags: { ...form.ecgTags } })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="visit-drawer">
      <div
        v-if="open && patient"
        class="visit-drawer-backdrop"
        @click.self="emit('close')"
      >
        <aside class="visit-drawer" role="dialog" aria-modal="true">
          <div class="visit-drawer-header">
            <h2 class="visit-drawer-title">
              Новый визит: {{ patientShortName }}
            </h2>
            <button
              type="button"
              class="visit-drawer-close"
              aria-label="Закрыть"
              @click="emit('close')"
            >
              <Icon icon="lucide:x" width="20" />
            </button>
          </div>

          <div class="visit-drawer-body">
            <div class="visit-form-group">
              <label class="visit-form-label">
                1. ФВ/ЛЖ (ЭхоКГ), % <span class="required">*</span>
              </label>
              <div class="visit-form-inline">
                <input
                  v-model="form.ef"
                  type="number"
                  min="5"
                  max="80"
                  class="visit-form-control visit-form-control--narrow"
                  :class="{ 'has-error': efError }"
                  placeholder="35"
                />
                <span v-if="efRisk" class="badge" :class="`badge-${efRisk.variant}`">
                  {{ efRisk.label }}
                </span>
              </div>
              <span v-if="efError" class="visit-form-error">{{ efError }}</span>
            </div>

            <div class="visit-form-group">
              <label class="visit-form-label">
                2. Тест 6 минут ходьбы (метры)
              </label>
              <div class="visit-form-inline">
                <input
                  v-model="form.walkTest"
                  type="number"
                  min="0"
                  class="visit-form-control visit-form-control--narrow"
                  placeholder="250"
                />
                <span v-if="walkClass" class="visit-form-hint">
                  Авто-класс: {{ walkClass }}
                </span>
              </div>
            </div>

            <div class="visit-form-group">
              <label class="visit-form-label">
                3. Уровень NT-proBNP (пг/мл) <span class="required">*</span>
              </label>
              <input
                v-model="form.bnp"
                type="number"
                min="0"
                class="visit-form-control"
                :class="{ 'has-error': bnpError }"
                placeholder="1200"
              />
              <span v-if="bnpError" class="visit-form-error">{{ bnpError }}</span>
              <div
                v-if="bnpStatus?.alert"
                class="visit-inline-alert visit-inline-alert--destructive"
              >
                <Icon icon="lucide:alert-circle" width="16" />
                <div>
                  <strong>{{ bnpStatus.alert.title }}</strong><br />
                  {{ bnpStatus.alert.text }}
                </div>
              </div>
            </div>

            <div class="visit-form-group">
              <label class="visit-form-label">4. ЭКГ (Заключение)</label>
              <select v-model="form.ecgConclusion" class="visit-form-control visit-form-select">
                <option v-for="option in ecgOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <div class="visit-checkbox-group">
                <label class="visit-checkbox-item">
                  <input v-model="form.ecgTags.fp" type="checkbox" />
                  <span class="visit-custom-checkbox">
                    <Icon v-if="form.ecgTags.fp" icon="lucide:check" width="12" />
                  </span>
                  ФП
                </label>
                <label class="visit-checkbox-item">
                  <input v-model="form.ecgTags.tachycardia" type="checkbox" />
                  <span class="visit-custom-checkbox">
                    <Icon v-if="form.ecgTags.tachycardia" icon="lucide:check" width="12" />
                  </span>
                  Тахикардия
                </label>
                <label class="visit-checkbox-item">
                  <input v-model="form.ecgTags.blocks" type="checkbox" />
                  <span class="visit-custom-checkbox">
                    <Icon v-if="form.ecgTags.blocks" icon="lucide:check" width="12" />
                  </span>
                  Блокады
                </label>
                <label class="visit-checkbox-item">
                  <input v-model="form.ecgTags.stChanges" type="checkbox" />
                  <span class="visit-custom-checkbox">
                    <Icon v-if="form.ecgTags.stChanges" icon="lucide:check" width="12" />
                  </span>
                  ST изменения
                </label>
              </div>
            </div>

            <div class="visit-form-row">
              <div class="visit-form-group">
                <label class="visit-form-label">5. Рост (см)</label>
                <input
                  v-model="form.height"
                  type="number"
                  min="100"
                  max="250"
                  class="visit-form-control"
                  placeholder="175"
                />
              </div>
              <div class="visit-form-group">
                <label class="visit-form-label">Вес (кг)</label>
                <input
                  v-model="form.weight"
                  type="number"
                  min="30"
                  max="250"
                  class="visit-form-control"
                  placeholder="88"
                />
              </div>
            </div>
            <div v-if="bmiResult" class="visit-calc-result">
              ИМТ: <strong>{{ bmiResult.value }}</strong> ({{ bmiResult.category }})
            </div>

            <div class="visit-form-row">
              <div class="visit-form-group">
                <label class="visit-form-label">6. Гемоглобин (Hb)</label>
                <input
                  v-model="form.hb"
                  type="number"
                  min="0"
                  class="visit-form-control"
                  :class="{ 'has-error': hbStatus?.hasError }"
                  placeholder="98"
                />
                <span v-if="hbStatus?.error" class="visit-form-error">
                  <Icon icon="lucide:info" width="12" />
                  {{ hbStatus.error }}
                </span>
              </div>
              <div class="visit-form-group">
                <label class="visit-form-label">Гематокрит (Hct)</label>
                <input
                  v-model="form.hct"
                  type="number"
                  min="0"
                  class="visit-form-control"
                  placeholder="35"
                />
              </div>
            </div>

            <div class="visit-form-row">
              <div class="visit-form-group">
                <label class="visit-form-label">7. Мочевина</label>
                <input
                  v-model="form.urea"
                  type="number"
                  step="0.1"
                  min="0"
                  class="visit-form-control"
                  placeholder="7.2"
                />
              </div>
              <div class="visit-form-group">
                <label class="visit-form-label">Креатинин</label>
                <input
                  v-model="form.creatinine"
                  type="number"
                  min="0"
                  class="visit-form-control"
                  :class="{ 'has-error': creatinineStatus?.hasError }"
                  placeholder="145"
                />
                <span v-if="creatinineStatus?.error" class="visit-form-error">
                  <Icon icon="lucide:arrow-up" width="12" />
                  {{ creatinineStatus.error }}
                </span>
              </div>
            </div>

            <div class="visit-form-row">
              <div class="visit-form-group">
                <label class="visit-form-label">8. АЛТ</label>
                <input
                  v-model="form.alt"
                  type="number"
                  min="0"
                  class="visit-form-control"
                  placeholder="42"
                />
              </div>
              <div class="visit-form-group">
                <label class="visit-form-label">АСТ</label>
                <input
                  v-model="form.ast"
                  type="number"
                  min="0"
                  class="visit-form-control"
                  placeholder="48"
                />
              </div>
            </div>
            <div v-if="altAstRatio" class="visit-calc-result">
              AST/ALT ratio: <strong>{{ altAstRatio.value }}</strong> ({{ altAstRatio.status }})
            </div>

            <div class="visit-form-group" style="margin-top: 8px">
              <label class="visit-form-label">
                Дата следующего визита <span class="required">*</span>
              </label>
              <input
                v-model="form.nextVisitDate"
                type="date"
                class="visit-form-control"
                :class="{ 'has-error': nextVisitError }"
              />
              <span v-if="nextVisitError" class="visit-form-error">{{ nextVisitError }}</span>
            </div>
          </div>

          <p v-if="saveError" class="visit-form-error" style="padding: 0 24px">
            {{ saveError }}
          </p>

          <div class="visit-drawer-footer">
            <button type="button" class="btn btn-outline" @click="emit('close')">
              Отмена
            </button>
            <button type="button" class="btn btn-primary" @click="onSave">
              Сохранить визит
            </button>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
