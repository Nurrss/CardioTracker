export function getEfRisk(ef) {
  const value = Number(ef)
  if (Number.isNaN(value)) return null

  if (value >= 50) {
    return { label: 'Риск A (Норма)', variant: 'success', stage: 'A' }
  }
  if (value >= 40) {
    return { label: 'Риск B (Стабилен)', variant: 'success', stage: 'B' }
  }
  if (value >= 30) {
    return { label: 'Риск C (Переходная)', variant: 'warning', stage: 'C' }
  }
  return { label: 'Риск D (Критичный)', variant: 'destructive', stage: 'D' }
}

export function getWalkTestClass(meters) {
  const value = Number(meters)
  if (!value || Number.isNaN(value)) return ''

  if (value >= 450) return 'ФК I'
  if (value >= 300) return 'ФК II'
  if (value >= 150) return 'ФК III'
  return 'ФК IV'
}

export function getBnpStatus(bnp) {
  const value = Number(bnp)
  if (Number.isNaN(value) || bnp === '') return null

  if (value < 300) {
    return {
      label: 'Норма',
      variant: 'success',
      icon: 'lucide:check-circle-2',
      alert: null,
    }
  }
  if (value <= 1000) {
    return {
      label: 'Наблюдение',
      variant: 'warning',
      icon: 'lucide:alert-triangle',
      alert: null,
    }
  }
  return {
    label: 'Критично',
    variant: 'destructive',
    icon: 'lucide:alert-circle',
    alert: {
      type: 'destructive',
      title: 'Высокий риск',
      text: 'Показатель не снижается при улучшении остальных метрик.',
    },
  }
}

export function calculateBmi(heightCm, weightKg) {
  const height = Number(heightCm)
  const weight = Number(weightKg)
  if (!height || !weight) return null

  const bmi = weight / (height / 100) ** 2
  let category = 'Норма'

  if (bmi < 18.5) category = 'Недостаточный вес'
  else if (bmi < 25) category = 'Норма'
  else if (bmi < 30) category = 'Избыточный вес'
  else category = 'Ожирение'

  return { value: bmi.toFixed(1), category }
}

export function getHbStatus(hb) {
  const value = Number(hb)
  if (Number.isNaN(hb) || hb === '') return null

  if (value < 110) {
    return { error: 'Hb < 110 (Критично)', hasError: true }
  }
  return { error: null, hasError: false }
}

export function getCreatinineStatus(creatinine, previousCreatinine) {
  const value = Number(creatinine)
  if (Number.isNaN(value) || creatinine === '') return null

  if (previousCreatinine) {
    const prev = Number(previousCreatinine)
    if (prev && (value - prev) / prev > 0.3) {
      return { error: 'Рост >30% vs прошлый', hasError: true }
    }
  }

  if (value > 120) {
    return { error: 'Повышенный уровень', hasError: true }
  }

  return { error: null, hasError: false }
}

export function getAltAstRatio(alt, ast) {
  const altValue = Number(alt)
  const astValue = Number(ast)
  if (!altValue || !astValue) return null

  const ratio = astValue / altValue
  let status = 'Норма'
  if (ratio > 2) status = 'Повышен'
  if (ratio < 0.8) status = 'Снижен'

  return { value: ratio.toFixed(2), status }
}

export function formatShortName(fullName) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length < 2) return fullName

  const lastName = parts[0]
  const initials = parts
    .slice(1)
    .map((part) => `${part.charAt(0)}.`)
    .join('')

  return `${lastName} ${initials}`
}

export function formatDateRuFromIso(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${day}.${month}.${year}`
}

export function formatTodayRu() {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = today.getFullYear()
  return `${day}.${month}.${year}`
}
