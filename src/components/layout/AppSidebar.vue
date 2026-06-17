<script setup>
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../../auth/localAuth.js'
import { navItems } from '../../data/patients.js'

const route = useRoute()
const router = useRouter()
const { currentUser, logout } = useAuth()

function isNavActive(item) {
  if (item.to === '/patients') {
    return (
      route.path === '/patients' || /^\/patients\/\d+$/.test(route.path)
    )
  }

  return route.path === item.to
}

function onLogout() {
  logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-header__logo">
        <Icon icon="lucide:activity" width="18" />
      </div>
      <span class="logo-text">Care Jurek</span>
    </div>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isNavActive(item) }"
      >
        <Icon :icon="item.icon" width="20" />
        {{ item.label }}
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div v-if="currentUser" class="user-profile">
        <img
          :src="currentUser.avatar"
          :alt="currentUser.roleLabel"
          class="avatar"
        />
        <div class="user-info">
          <span class="user-name">{{ currentUser.name }}</span>
          <span class="user-role">{{ currentUser.roleLabel }}</span>
        </div>
        <button
          type="button"
          class="logout-btn"
          aria-label="Выйти"
          title="Выйти"
          @click="onLogout"
        >
          <Icon icon="lucide:log-out" width="18" />
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.user-profile {
  width: 100%;
}

.logout-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--muted-foreground);
  cursor: pointer;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: var(--muted);
  color: var(--foreground);
}
</style>
