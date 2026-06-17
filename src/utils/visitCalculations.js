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

  if (value > 10000) {
    return {
      label: 'Декомп./Шок',
      interpretation: 'Часто наблюдается при тяжёлой декомпенсации, кардиогенном шоке',
      variant: 'destructive',
      icon: 'lucide:alert-circle',
      alert: {
        type: 'destructive',
        title: 'Кардиогенный шок / Тяжёлая декомпенсация',
        text: 'NT-proBNP >10000 пг/мл. Необходима экстренная госпитализация.',
      },
    }
  }
  if (value > 5000) {
    return {
      label: 'Очень высокий риск',
      interpretation: 'Очень высокий риск декомпенсации и смерти',
      variant: 'destructive',
      icon: 'lucide:alert-circle',
      alert: {
        type: 'destructive',
        title: 'Критический уровень NT-proBNP',
        text: 'Очень высокий риск декомпенсации и смерти. Срочная коррекция терапии.',
      },
    }
  }
  if (value > 2000) {
    return {
      label: 'Тяжёлая СН',
      interpretation: 'Тяжёлая СН, высокий риск госпитализации',
      variant: 'destructive',
      icon: 'lucide:alert-circle',
      alert: {
        type: 'destructive',
        title: 'Тяжёлая сердечная недостаточность',
        text: 'NT-proBNP 2000–5000 пг/мл. Высокий риск госпитализации.',
      },
    }
  }
  if (value > 1000) {
    return {
      label: 'Умеренная СН',
      interpretation: 'Умеренно выраженная сердечная недостаточность',
      variant: 'warning',
      icon: 'lucide:alert-triangle',
      alert: null,
    }
  }
  if (value > 300) {
    return {
      label: 'Вероятна ХСН',
      interpretation: 'Вероятна хроническая сердечная недостаточность',
      variant: 'warning',
      icon: 'lucide:alert-triangle',
      alert: null,
    }
  }
  if (value >= 125) {
    return {
      label: 'Доп. обследование',
      interpretation: 'Требуется дополнительное обследование',
      variant: 'warning',
      icon: 'lucide:alert-triangle',
      alert: null,
    }
  }
  return {
    label: 'СН маловероятна',
    interpretation: 'Сердечная недостаточность маловероятна',
    variant: 'success',
    icon: 'lucide:check-circle-2',
    alert: null,
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

export function getUreaStatus(urea) {
  const value = Number(urea)
  if (Number.isNaN(value) || urea === '' || urea == null) return null

  if (value < 2.5) {
    return {
      label: 'Снижен',
      interpretation: 'Ниже нормы (<2.5 ммоль/л)',
      variant: 'warning',
      hasError: false,
    }
  }
  if (value <= 8.3) {
    return {
      label: 'Норма',
      interpretation: 'Норма (2.5–8.3 ммоль/л)',
      variant: 'success',
      hasError: false,
    }
  }
  if (value <= 15) {
    return {
      label: 'Повышен',
      interpretation: 'Умеренное повышение (8.3–15 ммоль/л) — возможна ХПН, дегидратация',
      variant: 'warning',
      hasError: true,
    }
  }
  return {
    label: 'Значительно повышен',
    interpretation: 'Значительное повышение (>15 ммоль/л) — нарушение функции почек',
    variant: 'destructive',
    hasError: true,
  }
}

export function getCreatinineStatus(creatinine, previousCreatinine) {
  const value = Number(creatinine)
  if (Number.isNaN(value) || creatinine === '' || creatinine == null) return null

  if (previousCreatinine) {
    const prev = Number(previousCreatinine)
    if (prev && (value - prev) / prev > 0.3) {
      return {
        label: 'Рост >30%',
        interpretation: `Рост >30% от прошлого визита (${prev} → ${value} мкмоль/л). Возможна ОПП.`,
        variant: 'destructive',
        hasError: true,
      }
    }
  }

  if (value < 60) {
    return {
      label: 'Снижен',
      interpretation: 'Снижен (<60 мкмоль/л) — возможна мышечная атрофия, кахексия',
      variant: 'warning',
      hasError: false,
    }
  }
  if (value <= 120) {
    return {
      label: 'Норма',
      interpretation: 'Норма (60–120 мкмоль/л)',
      variant: 'success',
      hasError: false,
    }
  }
  if (value <= 180) {
    return {
      label: 'Умеренно повышен',
      interpretation: 'Умеренное повышение (120–180 мкмоль/л) — ХБП 2–3 ст.',
      variant: 'warning',
      hasError: true,
    }
  }
  if (value <= 350) {
    return {
      label: 'Значительно повышен',
      interpretation: 'Значительное повышение (180–350 мкмоль/л) — ХБП 3–4 ст.',
      variant: 'destructive',
      hasError: true,
    }
  }
  return {
    label: 'Тяжёлая ХПН',
    interpretation: 'Тяжёлое повышение (>350 мкмоль/л) — ХБП 4–5 ст., рассмотреть ЗПТ',
    variant: 'destructive',
    hasError: true,
  }
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

export function getAltAstInterpretation(alt, ast) {
  const altVal = Number(alt)
  const astVal = Number(ast)
  if (!altVal && !astVal) return null

  const ALT_NORM = 40
  const AST_NORM = 40
  const altNorm = altVal / ALT_NORM
  const astNorm = astVal / AST_NORM
  const lines = []

  if (altVal && altVal > ALT_NORM && altVal <= 60) {
    lines.push({ text: 'АЛТ 40–60 Ед/л: незначимое или реактивное повышение', variant: 'warning' })
  }
  if ((altNorm > 1 && altNorm <= 3) || (astNorm > 1 && astNorm <= 3)) {
    if (!(altVal && altVal <= 60)) {
      lines.push({ text: 'АЛТ/АСТ 1–3 нормы: часто застойная гепатопатия при ХСН', variant: 'warning' })
    }
  }
  if (altNorm > 5 || astNorm > 5) {
    lines.push({ text: 'АЛТ/АСТ >5 норм: исключить ишемию печени, лекарственное поражение', variant: 'destructive' })
  }
  if (astVal && altVal && astVal > altVal) {
    lines.push({ text: 'АСТ > АЛТ: возможна ишемическая гипоксия печени или повреждение миокарда', variant: 'warning' })
  }

  return lines.length > 0 ? lines : null
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
