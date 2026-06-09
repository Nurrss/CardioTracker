const ivanovIndicators = [
  {
    label: 'ФВ/ЛЖ (ЭхоКГ)',
    icon: 'lucide:activity',
    value: '32%',
    badge: 'Улучшение',
    badgeVariant: 'success',
    badgeIcon: 'lucide:arrow-up-right',
    previous: 'Прошлый визит: 28%',
  },
  {
    label: 'Тест 6 мин ходьбы',
    icon: 'lucide:footprints',
    value: '380',
    unit: 'м',
    badge: 'Улучшение',
    badgeVariant: 'success',
    badgeIcon: 'lucide:arrow-up-right',
    previous: 'Прошлый визит: 320 м',
  },
  {
    label: 'NT-proBNP',
    icon: 'lucide:droplet',
    iconColor: '#dc2626',
    value: '2100',
    unit: 'пг/мл',
    badge: 'Ухудшение',
    badgeVariant: 'destructive',
    badgeIcon: 'lucide:arrow-up-right',
    previous: 'Прошлый визит: 1850 пг/мл',
    critical: true,
  },
  {
    label: 'ЭКГ',
    icon: 'lucide:heart-pulse',
    value: 'ФП, ЧСС 75',
    valueSmall: true,
    badge: 'Улучшение',
    badgeVariant: 'success',
    badgeIcon: 'lucide:check',
    previous: 'Прошлый визит: ФП, ST депрессия',
  },
  {
    label: 'ИМТ',
    icon: 'lucide:scale',
    value: '28.1',
    badge: 'Улучшение',
    badgeVariant: 'success',
    badgeIcon: 'lucide:arrow-down-right',
    previous: 'Прошлый визит: 29.4',
  },
  {
    label: 'Hb / Hct',
    icon: 'lucide:test-tube',
    value: '115',
    unit: 'г/л',
    badge: 'Улучшение',
    badgeVariant: 'success',
    badgeIcon: 'lucide:arrow-up-right',
    previous: 'Прошлый визит: 108 г/л',
  },
  {
    label: 'Креатинин',
    icon: 'lucide:flask-conical',
    value: '105',
    unit: 'мкмоль/л',
    badge: 'Улучшение',
    badgeVariant: 'success',
    badgeIcon: 'lucide:arrow-down-right',
    previous: 'Прошлый визит: 145 мкмоль/л',
  },
  {
    label: 'АЛТ / АСТ',
    icon: 'lucide:activity',
    value: '1.5',
    unit: '(ratio)',
    badge: 'Улучшение',
    badgeVariant: 'success',
    badgeIcon: 'lucide:arrow-down-right',
    previous: 'Прошлый визит: 2.1',
  },
]

export const staticDetailsById = {
  1: {
    avatar:
      'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F65-80%2FEuropean%2F1',
    birthDate: '12.05.1954 (69 лет)',
    gender: 'Мужской',
    phone: '+7 (777) 123-45-67',
    address: 'г. Астана, ул. Сыганак 14, кв 45',
    bloodType: 'A(II) Rh+',
    alerts: [
      {
        icon: 'lucide:activity',
        title: 'Высокий риск (Стадия D):',
        text: 'Пациент нуждается в тщательном мониторинге и возможной госпитализации.',
      },
      {
        icon: 'lucide:trending-up',
        title: 'Парадокс показателей:',
        text: 'NT-proBNP не снижается при улучшении остальных метрик. Рекомендуется пересмотр терапии.',
      },
    ],
    visits: [
      {
        id: 'v1',
        date: '12.10.2023',
        doctor: 'Смирнова Е. (Кардиолог)',
        type: 'Плановый осмотр',
        isLatest: true,
        indicators: ivanovIndicators,
        conclusion:
          'Наблюдается положительная клиническая динамика: увеличение толерантности к физической нагрузке, улучшение ФВ/ЛЖ до 32%, снижение ИМТ и улучшение функции почек. Однако сохраняется высокий уровень NT-proBNP с тенденцией к росту, что требует пересмотра диуретической терапии и дополнительного контроля. Назначена повторная явка через 1 месяц.',
      },
      {
        id: 'v2',
        date: '10.09.2023',
        doctor: 'Смирнова Е. (Кардиолог)',
        type: 'Первичный осмотр',
        riskBadge: 'Стадия D',
      },
    ],
  },
  2: {
    avatar:
      'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F55-65%2FEuropean%2F4',
    birthDate: '15.08.1962 (61 год)',
    gender: 'Женский',
    phone: '+7 (701) 456-78-90',
    address: 'г. Алматы, пр. Абая 120, кв 18',
    bloodType: 'B(III) Rh+',
    alerts: [
      {
        icon: 'lucide:alert-triangle',
        title: 'Стадия C:',
        text: 'Требуется усиленный контроль NT-proBNP и коррекция терапии.',
      },
    ],
    visits: [
      {
        id: 'v1',
        date: '05.10.2023',
        doctor: 'Смирнова Е. (Кардиолог)',
        type: 'Плановый осмотр',
        isLatest: true,
        indicators: ivanovIndicators.slice(0, 4),
        conclusion:
          'Состояние стабильное, сохраняется необходимость наблюдения. Рекомендован контроль через 6 недель.',
      },
    ],
  },
  3: {
    avatar:
      'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F40-55%2FEuropean%2F3',
    birthDate: '28.02.1975 (48 лет)',
    gender: 'Мужской',
    phone: '+7 (702) 111-22-33',
    address: 'г. Шымкент, ул. Туран 45',
    bloodType: 'O(I) Rh+',
    alerts: [],
    visits: [
      {
        id: 'v1',
        date: '20.09.2023',
        doctor: 'Смирнова Е. (Кардиолог)',
        type: 'Плановый осмотр',
        isLatest: true,
        indicators: ivanovIndicators.slice(0, 4),
        conclusion: 'Показатели в пределах нормы. Продолжить текущую терапию.',
      },
    ],
  },
  4: {
    avatar:
      'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F55-65%2FEuropean%2F5',
    birthDate: '10.01.1958 (65 лет)',
    gender: 'Женский',
    phone: '+7 (705) 987-65-43',
    address: 'г. Астана, ул. Кенесары 22',
    bloodType: 'A(II) Rh-',
    alerts: [
      {
        icon: 'lucide:calendar-clock',
        title: 'Ближайший визит:',
        text: 'Повторный осмотр запланирован через 3 дня.',
      },
    ],
    visits: [
      {
        id: 'v1',
        date: '18.10.2023',
        doctor: 'Смирнова Е. (Кардиолог)',
        type: 'Плановый осмотр',
        isLatest: true,
        indicators: ivanovIndicators.slice(0, 4),
        conclusion: 'Отмечается улучшение по ряду показателей. Продолжить наблюдение.',
      },
    ],
  },
  5: {
    avatar:
      'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F65-80%2FEuropean%2F2',
    birthDate: '12.09.1945 (78 лет)',
    gender: 'Мужской',
    phone: '+7 (707) 333-44-55',
    address: 'г. Караганда, ул. Ерубаева 10',
    bloodType: 'AB(IV) Rh+',
    alerts: [
      {
        icon: 'lucide:activity',
        title: 'Высокий риск (Стадия D):',
        text: 'Пациент нуждается в тщательном мониторинге.',
      },
    ],
    visits: [
      {
        id: 'v1',
        date: '10.10.2023',
        doctor: 'Смирнова Е. (Кардиолог)',
        type: 'Плановый осмотр',
        isLatest: true,
        indicators: ivanovIndicators.slice(0, 4),
        conclusion: 'Динамика без существенных изменений. Требуется пересмотр схемы лечения.',
      },
    ],
  },
}

