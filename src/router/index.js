import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../auth/localAuth.js'
import LoginView from '../views/LoginView.vue'
import PatientsListView from '../views/PatientsListView.vue'
import PatientCardView from '../views/PatientCardView.vue'
import AddPatientView from '../views/AddPatientView.vue'
import PlaceholderView from '../views/PlaceholderView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/patients',
      name: 'patients',
      component: PatientsListView,
      meta: { requiresAuth: true },
    },
    {
      path: '/patients/new',
      name: 'patients-new',
      component: AddPatientView,
      meta: { requiresAuth: true },
    },
    {
      path: '/patients/:id',
      name: 'patient-card',
      component: PatientCardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/patients/:id/visit/new',
      name: 'patient-visit-new',
      component: PatientCardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/queue',
      name: 'queue',
      component: PlaceholderView,
      props: { title: 'Онлайн очередь' },
      meta: { requiresAuth: true },
    },
    {
      path: '/reminders',
      name: 'reminders',
      component: PlaceholderView,
      props: { title: 'Напоминания' },
      meta: { requiresAuth: true },
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: PlaceholderView,
      props: { title: 'Аналитика' },
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const { isAuthenticated } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login' }
  }

  if (to.meta.guest && isAuthenticated.value) {
    return { name: 'patients' }
  }
})

export default router
