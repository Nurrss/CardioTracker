import {
  formatDateRuFromIso,
  getAltAstRatio,
  getBnpStatus,
  getCreatinineStatus,
  getEfRisk,
  getUreaStatus,
  getWalkTestClass,
} from '../../utils/visitCalculations.js'

const MED_LABELS = {
  arni: 'ARNI',
  acei: 'ИАПФ (ACEI)',
  bb: 'Б-блокатор (BB)',
  mra: 'АМК (MRA)',
  sglt2i: 'SGLT2i',
  diuretic: 'Диуретик',
  oac: 'Антикоагулянт (OAC)',
  antiplatelet: 'Антиагрегант',
}

function buildPrescribedMeds(medications) {
  if (!medications) return null
  const list = Object.entries(medications)
    .filter(([, val]) => val?.prescribed)
    .map(([key, val]) => ({ label: MED_LABELS[key] || key, dose: val.dose || '—' }))
  return list.length > 0 ? list : null
}

function formatDateRu(dateValue) {
  if (!dateValue) return '—'
  const iso = String(dateValue).slice(0, 10)
  return formatDateRuFromIso(iso)
}

function getAgeLabel(birthDate) {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }

  const lastDigit = age % 10
  const lastTwo = age % 100

  if (lastTwo >= 11 && lastTwo <= 14) return `${age} лет`
  if (lastDigit === 1) return `${age} год`
  if (lastDigit >= 2 && lastDigit <= 4) return `${age} года`
  return `${age} лет`
}

function getNextVisitLabel(nextVisitDate) {
  if (!nextVisitDate) return 'Не назначен'

  const next = new Date(nextVisitDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  next.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil((next - today) / (1000 * 60 * 60 * 24))
  const formatted = formatDateRu(nextVisitDate)

  if (diffDays === 1) return 'Завтра'
  if (diffDays > 1 && diffDays <= 7) return `Через ${diffDays} дн.`
  if (diffDays === 0) return 'Сегодня'
  if (diffDays < 0) return `Просрочен (${formatted})`

  return formatted
}

function buildIndicators(visit, previousVisit) {
  const efRisk = getEfRisk(visit.ef_lv)
  const bnpStatus = getBnpStatus(visit.nt_pro_bnp)
  const altAst = getAltAstRatio(visit.alt, visit.ast)
  const prevCreatinine = previousVisit?.creatinine
    ? Number(previousVisit.creatinine)
    : null
  const creatStatus = getCreatinineStatus(visit.creatinine, prevCreatinine)
  const ureaStatus = getUreaStatus(visit.urea)

  const ecgFlags = visit.ecg_flags || {}
  const ecgTags = []
  if (ecgFlags.fp) ecgTags.push('ФП')
  if (ecgFlags.tachycardia) ecgTags.push('Тахикардия')
  if (ecgFlags.blocks) ecgTags.push('Блокады')
  if (ecgFlags.st_changes) ecgTags.push('ST изменения')

  const ecgValue = visit.ecg_text || ecgTags.join(', ') || 'Без особенностей'

  return [
    {
      label: 'ФВ/ЛЖ (ЭхоКГ)',
      icon: 'lucide:activity',
      value: visit.ef_lv != null ? `${visit.ef_lv}%` : '—',
      badge: efRisk?.stage === 'A' || efRisk?.stage === 'B' ? 'Норма' : 'Наблюдение',
      badgeVariant: efRisk?.variant || 'success',
      badgeIcon: 'lucide:arrow-up-right',
      previous: previousVisit?.ef_lv != null
        ? `Прошлый визит: ${previousVisit.ef_lv}%`
        : 'Нет данных',
    },
    {
      label: 'Тест 6 мин ходьбы',
      icon: 'lucide:footprints',
      value: visit.six_min_test ?? '—',
      unit: visit.six_min_test != null ? 'м' : undefined,
      badge: visit.functional_class || 'Новые данные',
      badgeVariant: 'success',
      badgeIcon: 'lucide:minus',
      previous: previousVisit?.six_min_test != null
        ? `Прошлый визит: ${previousVisit.six_min_test} м`
        : 'Нет данных',
    },
    {
      label: 'NT-proBNP',
      icon: 'lucide:droplet',
      iconColor: bnpStatus?.variant === 'destructive' ? '#dc2626' : undefined,
      value: visit.nt_pro_bnp != null ? String(visit.nt_pro_bnp) : '—',
      unit: visit.nt_pro_bnp != null ? 'пг/мл' : undefined,
      badge: bnpStatus?.label || 'Нет данных',
      badgeVariant: bnpStatus?.variant || 'success',
      badgeIcon: bnpStatus?.icon || 'lucide:minus',
      previous: previousVisit?.nt_pro_bnp != null
        ? `Прошлый визит: ${previousVisit.nt_pro_bnp} пг/мл`
        : bnpStatus?.interpretation || 'Нет данных',
      critical: bnpStatus?.variant === 'destructive',
    },
    {
      label: 'ЭКГ',
      icon: 'lucide:heart-pulse',
      value: ecgValue,
      valueSmall: true,
      badge: 'Зафиксировано',
      badgeVariant: 'success',
      badgeIcon: 'lucide:check',
      previous: previousVisit?.ecg_text
        ? `Прошлый визит: ${previousVisit.ecg_text}`
        : 'Нет данных',
    },
    {
      label: 'ИМТ',
      icon: 'lucide:scale',
      value: visit.bmi != null ? String(visit.bmi) : '—',
      badge: 'Расчёт',
      badgeVariant: 'success',
      badgeIcon: 'lucide:minus',
      previous: previousVisit?.bmi != null
        ? `Прошлый визит: ${previousVisit.bmi}`
        : 'Нет данных',
    },
    {
      label: 'Hb / Hct',
      icon: 'lucide:test-tube',
      value: visit.hemoglobin != null ? String(visit.hemoglobin) : '—',
      unit: visit.hemoglobin != null ? 'г/л' : undefined,
      badge:
        visit.hemoglobin != null && Number(visit.hemoglobin) < 110
          ? 'Критично'
          : 'Норма',
      badgeVariant:
        visit.hemoglobin != null && Number(visit.hemoglobin) < 110
          ? 'destructive'
          : 'success',
      badgeIcon: 'lucide:alert-circle',
      previous: previousVisit?.hemoglobin != null
        ? `Прошлый визит: ${previousVisit.hemoglobin} г/л`
        : 'Нет данных',
    },
    {
      label: 'Мочевина',
      icon: 'lucide:beaker',
      value: visit.urea != null ? String(visit.urea) : '—',
      unit: visit.urea != null ? 'ммоль/л' : undefined,
      badge: ureaStatus?.label || 'Нет данных',
      badgeVariant: ureaStatus?.variant || 'success',
      badgeIcon: ureaStatus?.hasError ? 'lucide:alert-triangle' : 'lucide:minus',
      previous: previousVisit?.urea != null
        ? `Прошлый визит: ${previousVisit.urea} ммоль/л`
        : ureaStatus?.interpretation || 'Нет данных',
    },
    {
      label: 'Креатинин',
      icon: 'lucide:flask-conical',
      value: visit.creatinine != null ? String(visit.creatinine) : '—',
      unit: visit.creatinine != null ? 'мкмоль/л' : undefined,
      badge: creatStatus?.label || 'Нет данных',
      badgeVariant: creatStatus?.variant || 'success',
      badgeIcon: creatStatus?.hasError ? 'lucide:alert-triangle' : 'lucide:minus',
      previous: prevCreatinine
        ? `Прошлый визит: ${prevCreatinine} мкмоль/л`
        : creatStatus?.interpretation || 'Нет данных',
      critical: creatStatus?.variant === 'destructive',
    },
    {
      label: 'АЛТ / АСТ',
      icon: 'lucide:activity',
      value: altAst?.value || visit.ast_alt_ratio || '—',
      unit: altAst || visit.ast_alt_ratio ? '(ratio)' : undefined,
      badge: altAst?.status || 'Нет данных',
      badgeVariant: 'success',
      badgeIcon: 'lucide:minus',
      previous: previousVisit?.ast_alt_ratio
        ? `Прошлый визит: ${previousVisit.ast_alt_ratio}`
        : 'Нет данных',
    },
  ]
}

function buildAlerts(patient, latestVisit) {
  const alerts = []

  if (latestVisit?.risk_group === 'D') {
    alerts.push({
      icon: 'lucide:activity',
      title: 'Высокий риск (Стадия D):',
      text: 'Пациент нуждается в тщательном мониторинге и возможной госпитализации.',
    })
  } else if (latestVisit?.risk_group === 'C') {
    alerts.push({
      icon: 'lucide:alert-triangle',
      title: 'Стадия C:',
      text: 'Требуется усиленный контроль показателей и коррекция терапии.',
    })
  }

  const bnpStatus = latestVisit ? getBnpStatus(latestVisit.nt_pro_bnp) : null
  if (bnpStatus?.variant === 'destructive') {
    alerts.push({
      icon: 'lucide:trending-up',
      title: 'Парадокс показателей:',
      text: 'NT-proBNP в зоне высокого риска. Рекомендуется пересмотр терапии.',
    })
  }

  if (latestVisit?.next_visit_date) {
    const next = new Date(latestVisit.next_visit_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    next.setHours(0, 0, 0, 0)
    const diffDays = Math.ceil((next - today) / (1000 * 60 * 60 * 24))

    if (diffDays >= 0 && diffDays <= 7) {
      alerts.push({
        icon: 'lucide:calendar-clock',
        title: 'Ближайший визит:',
        text:
          diffDays === 0
            ? 'Повторный осмотр запланирован на сегодня.'
            : `Повторный осмотр запланирован через ${diffDays} дн.`,
      })
    }
  }

  return alerts
}

export function mapVisitToUi(visit, previousVisit, index) {
  const staffLabel =
    visit.created_by_role === 'nurse'
      ? 'Медсестра'
      : 'Смирнова Е. (Кардиолог)'

  return {
    id: visit.id,
    date: formatDateRu(visit.visit_date),
    doctor: staffLabel,
    type: visit.visit_type || 'Плановый осмотр',
    isLatest: index === 0,
    riskBadge: visit.risk_group === 'D' ? `Стадия ${visit.risk_group}` : undefined,
    indicators: buildIndicators(visit, previousVisit),
    conclusion:
      visit.conclusion ||
      'Визит зарегистрирован. Требуется контроль динамики показателей.',
    prescribedMeds: buildPrescribedMeds(visit.medications),
  }
}

export function mapPatientListItem(patient, latestVisit) {
  const efRisk = latestVisit ? getEfRisk(latestVisit.ef_lv) : null
  const bnpStatus = latestVisit ? getBnpStatus(latestVisit.nt_pro_bnp) : null
  const nextVisitDate = latestVisit?.next_visit_date
  const next = nextVisitDate ? new Date(nextVisitDate) : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (next) next.setHours(0, 0, 0, 0)
  const diffDays = next ? Math.ceil((next - today) / (1000 * 60 * 60 * 24)) : null

  return {
    id: patient.id,
    name: patient.full_name,
    iin: patient.iin,
    age: getAgeLabel(patient.birth_date),
    lastVisit: latestVisit ? formatDateRu(latestVisit.visit_date) : '—',
    riskStage: latestVisit?.risk_group || 'A',
    riskVariant: efRisk?.variant || 'success',
    bnpLabel: bnpStatus?.label || 'Нет данных',
    bnpVariant: bnpStatus?.variant || 'success',
    bnpIcon: bnpStatus?.icon || 'lucide:minus',
    nextVisit: getNextVisitLabel(nextVisitDate),
    nextVisitHighlight: diffDays != null && diffDays >= 0 && diffDays <= 7,
    hasAlert:
      bnpStatus?.variant === 'destructive' || latestVisit?.risk_group === 'D',
  }
}

export function mapPatientCard(patient, visits) {
  const sortedVisits = [...visits].sort(
    (a, b) => new Date(b.visit_date) - new Date(a.visit_date),
  )
  const latestVisit = sortedVisits[0]

  return {
    ...mapPatientListItem(patient, latestVisit),
    birthDate: `${formatDateRu(patient.birth_date)} (${getAgeLabel(patient.birth_date)})`,
    gender: patient.gender === 'female' ? 'Женский' : 'Мужской',
    phone: patient.phone || '—',
    address: patient.address || '—',
    bloodType: patient.blood_type || '—',
    alerts: buildAlerts(patient, latestVisit),
    visits: sortedVisits.map((visit, index) =>
      mapVisitToUi(visit, sortedVisits[index + 1], index),
    ),
  }
}

export function mapPatientInsert(form, staff) {
  return {
    iin: form.iin,
    full_name: form.name.trim(),
    gender: form.gender,
    birth_date: form.birthDate,
    phone: form.phone.trim() || null,
    blood_type: form.bloodType || null,
    address: form.address.trim() || null,
    nurse_id: staff?.id ? String(staff.id) : null,
  }
}

export function mapVisitInsert(patientId, form, staff) {
  const efRisk = getEfRisk(form.ef)
  const bnpStatus = getBnpStatus(form.bnp)
  const altAst = getAltAstRatio(form.alt, form.ast)
  const bmi =
    form.height && form.weight
      ? Number((Number(form.weight) / (Number(form.height) / 100) ** 2).toFixed(1))
      : null

  return {
    patient_id: patientId,
    visit_date: new Date().toISOString().slice(0, 10),
    next_visit_date: form.nextVisitDate || null,
    visit_type: 'Плановый осмотр',
    ef_lv: form.ef !== '' ? Number(form.ef) : null,
    six_min_test: form.walkTest !== '' ? Number(form.walkTest) : null,
    functional_class: getWalkTestClass(form.walkTest) || null,
    nt_pro_bnp: form.bnp !== '' ? Number(form.bnp) : null,
    ecg_text: form.ecgConclusion || null,
    ecg_flags: {
      fp: Boolean(form.ecgTags?.fp),
      tachycardia: Boolean(form.ecgTags?.tachycardia),
      blocks: Boolean(form.ecgTags?.blocks),
      st_changes: Boolean(form.ecgTags?.stChanges),
    },
    height: form.height !== '' ? Number(form.height) : null,
    weight: form.weight !== '' ? Number(form.weight) : null,
    bmi,
    hemoglobin: form.hb !== '' ? Number(form.hb) : null,
    hematocrit: form.hct !== '' ? Number(form.hct) : null,
    urea: form.urea !== '' ? Number(form.urea) : null,
    creatinine: form.creatinine !== '' ? Number(form.creatinine) : null,
    alt: form.alt !== '' ? Number(form.alt) : null,
    ast: form.ast !== '' ? Number(form.ast) : null,
    ast_alt_ratio: altAst ? Number(altAst.value) : null,
    medications: form.medications || null,
    risk_group: efRisk?.stage || 'A',
    conclusion:
      form.conclusion?.trim() ||
      'Визит зарегистрирован. Требуется контроль динамики показателей.',
    created_by: staff?.id ? String(staff.id) : null,
    created_by_role: staff?.role || null,
  }
}
