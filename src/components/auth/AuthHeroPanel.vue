<script setup>
import { Icon } from '@iconify/vue'

const HERO_IMAGE =
  'https://storage.googleapis.com/banani-generated-images/generated-images/31bf9ac3-cb20-4df0-85b8-691255d084f6.jpg'
</script>

<template>
  <div class="left-panel">
    <img
      class="left-panel__image"
      :src="HERO_IMAGE"
      alt="Медицинские специалисты в современной клинике"
    />
    <div class="bg-overlay" />

    <div class="left-content">
      <div class="brand">
        <div class="brand__logo">
          <Icon icon="lucide:activity" width="24" style="color: var(--primary)" />
        </div>
        <span class="brand__name">Care Jurek</span>
      </div>

      <div class="hero">
        <div class="hero__dots">
          <div class="hero__dot hero__dot--active" />
          <div class="hero__dot hero__dot--inactive" />
          <div class="hero__dot hero__dot--inactive" />
        </div>

        <h1 class="hero__title">
          Мониторинг пациентов<br />в реальном времени
        </h1>
        <p class="hero__description">
          Интеллектуальная система контроля сердечной недостаточности.
          Отслеживайте динамику, получайте оповещения о рисках и принимайте
          решения быстрее.
        </p>

        <div class="hero__stats">
          <div class="hero__stat">
            <span class="hero__stat-value">98%</span>
            <span class="hero__stat-label">Точность алертов</span>
          </div>
          <div class="hero__stat-divider" />
          <div class="hero__stat">
            <span class="hero__stat-value">24/7</span>
            <span class="hero__stat-label">Контроль динамики</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
