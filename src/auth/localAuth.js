import { computed, ref } from 'vue'
import { localUsers } from '../data/users.js'

const STORAGE_KEY = 'cardiotracker_session'

function loadSession() {
  const raw =
    localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const { userId } = JSON.parse(raw)
    return localUsers.find((user) => user.id === userId) ?? null
  } catch {
    return null
  }
}

const currentUser = ref(loadSession())

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null)

  function login(iin, password, role, rememberMe) {
    const user = localUsers.find(
      (item) =>
        item.iin === iin &&
        item.password === password &&
        item.role === role,
    )

    if (!user) {
      return {
        success: false,
        error: 'Неверный ИИН, пароль или роль',
      }
    }

    const session = { userId: user.id }
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    }

    currentUser.value = user
    return { success: true }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    currentUser.value = null
  }

  return {
    currentUser,
    isAuthenticated,
    login,
    logout,
  }
}
