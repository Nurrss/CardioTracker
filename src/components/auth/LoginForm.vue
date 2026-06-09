<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../../auth/localAuth.js'

const router = useRouter()
const { login: authLogin } = useAuth()

const roles = [
  { id: 'doctor', label: 'Врач', icon: 'lucide:stethoscope' },
  { id: 'nurse', label: 'Медсестра', icon: 'lucide:heart-pulse' },
]

const activeRole = ref('doctor')
const login = ref('')
const password = ref('')
const rememberMe = ref(true)
const showPassword = ref(false)
const touched = ref(false)
const authError = ref('')
const isSubmitting = ref(false)

const iinError = computed(() => {
  if (!touched.value && login.value === '') return ''
  if (!/^\d{12}$/.test(login.value)) {
    return 'ИИН должен содержать ровно 12 цифр'
  }
  return ''
})

const hasIinError = computed(() => Boolean(iinError.value))

function onLoginInput(event) {
  login.value = event.target.value.replace(/\D/g, '').slice(0, 12)
  authError.value = ''
}

function onSubmit() {
  touched.value = true
  authError.value = ''

  if (hasIinError.value || !password.value) return

  isSubmitting.value = true
  const result = authLogin(
    login.value,
    password.value,
    activeRole.value,
    rememberMe.value,
  )
  isSubmitting.value = false

  if (!result.success) {
    authError.value = result.error
    return
  }

  router.push({ name: 'patients' })
}
</script>

<template>
  <div class="right-panel">
    <form class="form-container" @submit.prevent="onSubmit">
      <div class="header-section">
        <h2 class="header-section__title">С возвращением</h2>
        <p class="header-section__subtitle">
          Пожалуйста, авторизуйтесь для продолжения работы
        </p>
      </div>

      <div class="role-tabs">
        <button
          v-for="role in roles"
          :key="role.id"
          type="button"
          class="role-tab"
          :class="{ active: activeRole === role.id }"
          @click="activeRole = role.id"
        >
          <Icon :icon="role.icon" width="18" style="margin-right: 8px" />
          {{ role.label }}
        </button>
      </div>

      <div class="form-fields">
        <div class="input-group">
          <label class="input-label" for="login">
            ИИН или Логин
            <span class="input-label__required">*</span>
          </label>
          <div class="input-field" :class="{ error: hasIinError }">
            <input
              id="login"
              type="text"
              inputmode="numeric"
              autocomplete="username"
              placeholder="123456789012"
              :value="login"
              @input="onLoginInput"
              @blur="touched = true"
            />
            <Icon
              v-if="hasIinError"
              icon="lucide:alert-circle"
              width="18"
              class="input-field__icon--error"
            />
          </div>
          <div v-if="hasIinError" class="error-message">
            <Icon icon="lucide:info" width="14" />
            {{ iinError }}
          </div>
        </div>

        <div class="input-group">
          <label class="input-label" for="password">
            Пароль
            <span class="input-label__required">*</span>
          </label>
          <div class="input-field">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              v-model="password"
            />
            <button
              type="button"
              class="input-field__toggle"
              :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
              @click="showPassword = !showPassword"
            >
              <Icon
                :icon="showPassword ? 'lucide:eye' : 'lucide:eye-off'"
                width="18"
              />
            </button>
          </div>
        </div>

        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="visually-hidden"
            />
            <div class="checkbox-box" :class="{ unchecked: !rememberMe }">
              <Icon
                v-if="rememberMe"
                icon="lucide:check"
                width="14"
                style="color: var(--primary-foreground)"
              />
            </div>
            Запомнить меня
          </label>
          <button type="button" class="link">Забыли пароль?</button>
        </div>

        <div v-if="authError" class="error-message">
          <Icon icon="lucide:info" width="14" />
          {{ authError }}
        </div>

        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          Войти в систему
          <Icon icon="lucide:arrow-right" width="18" />
        </button>
      </div>

      <div class="form-footer">
        <p class="form-footer__text">
          Возникли проблемы с доступом? <br />
          <button type="button" class="link form-footer__link">
            Обратитесь в службу поддержки
          </button>
        </p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
