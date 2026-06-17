<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import {
  calculateBmi,
  formatShortName,
  getAltAstInterpretation,
  getAltAstRatio,
  getBnpStatus,
  getCreatinineStatus,
  getEfRisk,
  getHbStatus,
  getUreaStatus,
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

const medicationList = [
  { key: 'arni', label: 'ARNI', hint: '24/26 → 97/103 мг ×2' },
  { key: 'acei', label: 'ИАПФ (ACEI)', hint: 'Эналаприл 2.5 → 10–20 мг ×2' },
  { key: 'bb', label: 'Б-блокатор (BB)', hint: 'Бисопролол 1.25 → 10 мг' },
  { key: 'mra', label: 'АМК (MRA)', hint: 'Спиронолактон 25 → 50 мг' },
  { key: 'sglt2i', label: 'SGLT2i', hint: 'Дапаглифлозин 10 мг' },
  { key: 'diuretic', label: 'Диуретик', hint: 'Торасемид 5–40 мг' },
  { key: 'oac', label: 'Антикоагулянт (ОАК)', hint: 'Апиксабан 5 мг ×2' },
  { key: 'antiplatelet', label: 'Антиагрегант', hint: 'Аспирин 75–100 мг' },
]

function initialMedications() {
  return Object.fromEntries(medicationList.map((m) => [m.key, { prescribed: false, dose: '' }]))
}

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
  medications: initialMedications(),
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
const ureaStatus = computed(() => getUreaStatus(form.urea))
const creatinineStatus = computed(() =>
  getCreatinineStatus(form.creatinine, previousCreatinine.value),
)
const altAstRatio = computed(() => getAltAstRatio(form.alt, form.ast))
const altAstInterpretation = computed(() => getAltAstInterpretation(form.alt, form.ast))

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
      medications: initialMedications(),
    })
    touched.value = false
  },
)

function onSave() {
  touched.value = true
  if (hasErrors.value) return
  emit('save', { ...form, ecgTags: { ...form.ecgTags }, medications: JSON.parse(JSON.stringify(form.medications)) })
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
            <!-- 1. ФВ/ЛЖ -->
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

            <!-- 2. Тест 6 минут -->
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

            <!-- 3. NT-proBNP -->
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
                v-if="bnpStatus && !bnpError"
                class="visit-interp-line"
                :class="`visit-interp-line--${bnpStatus.variant}`"
              >
                <Icon :icon="bnpStatus.icon" width="13" />
                <span><strong>{{ bnpStatus.label }}:</strong> {{ bnpStatus.interpretation }}</span>
              </div>
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

            <!-- 4. ЭКГ -->
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

            <!-- 5. Рост / Вес -->
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

            <!-- 6. Hb / Hct -->
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

            <!-- 7. Мочевина / Креатинин -->
            <div class="visit-form-row">
              <div class="visit-form-group">
                <label class="visit-form-label">7. Мочевина (ммоль/л)</label>
                <input
                  v-model="form.urea"
                  type="number"
                  step="0.1"
                  min="0"
                  class="visit-form-control"
                  :class="{ 'has-error': ureaStatus?.hasError }"
                  placeholder="7.2"
                />
                <div
                  v-if="ureaStatus"
                  class="visit-interp-line"
                  :class="`visit-interp-line--${ureaStatus.variant}`"
                >
                  <Icon
                    :icon="ureaStatus.hasError ? 'lucide:alert-triangle' : 'lucide:check-circle-2'"
                    width="12"
                  />
                  {{ ureaStatus.interpretation }}
                </div>
              </div>
              <div class="visit-form-group">
                <label class="visit-form-label">Креатинин (мкмоль/л)</label>
                <input
                  v-model="form.creatinine"
                  type="number"
                  min="0"
                  class="visit-form-control"
                  :class="{ 'has-error': creatinineStatus?.hasError }"
                  placeholder="145"
                />
                <div
                  v-if="creatinineStatus"
                  class="visit-interp-line"
                  :class="`visit-interp-line--${creatinineStatus.variant}`"
                >
                  <Icon
                    :icon="creatinineStatus.hasError ? 'lucide:alert-triangle' : 'lucide:check-circle-2'"
                    width="12"
                  />
                  {{ creatinineStatus.interpretation }}
                </div>
              </div>
            </div>

            <!-- 8. АЛТ / АСТ -->
            <div class="visit-form-row">
              <div class="visit-form-group">
                <label class="visit-form-label">8. АЛТ (Ед/л)</label>
                <input
                  v-model="form.alt"
                  type="number"
                  min="0"
                  class="visit-form-control"
                  placeholder="42"
                />
              </div>
              <div class="visit-form-group">
                <label class="visit-form-label">АСТ (Ед/л)</label>
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
            <div v-if="altAstInterpretation" class="visit-interp-block">
              <div
                v-for="(line, i) in altAstInterpretation"
                :key="i"
                class="visit-interp-line"
                :class="`visit-interp-line--${line.variant}`"
              >
                <Icon
                  :icon="line.variant === 'destructive' ? 'lucide:alert-circle' : 'lucide:alert-triangle'"
                  width="12"
                />
                {{ line.text }}
              </div>
            </div>

            <!-- 9. Назначения врача (базовые препараты) -->
            <div class="visit-form-group">
              <label class="visit-form-label">9. Назначения врача (базовые препараты)</label>
              <div class="meds-list">
                <div
                  v-for="med in medicationList"
                  :key="med.key"
                  class="med-row"
                >
                  <label class="visit-checkbox-item med-checkbox">
                    <input v-model="form.medications[med.key].prescribed" type="checkbox" />
                    <span class="visit-custom-checkbox">
                      <Icon v-if="form.medications[med.key].prescribed" icon="lucide:check" width="12" />
                    </span>
                    <span class="med-label">{{ med.label }}</span>
                  </label>
                  <input
                    v-if="form.medications[med.key].prescribed"
                    v-model="form.medications[med.key].dose"
                    type="text"
                    class="visit-form-control med-dose-input"
                    :placeholder="med.hint"
                  />
                </div>
              </div>
            </div>

            <!-- Дата следующего визита -->
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
