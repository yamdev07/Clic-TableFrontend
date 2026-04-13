import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNavLoader } from '@/composables/useNavLoader'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackPrefetch: true */ '@/views/Login.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import(/* webpackPrefetch: true */ '@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tables',
    name: 'Tables',
    component: () => import(/* webpackPrefetch: true */ '@/views/Tables.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/menu',
    name: 'Menu',
    component: () => import(/* webpackPrefetch: true */ '@/views/Menu.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import(/* webpackPrefetch: true */ '@/views/Orders.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/new/:tableId',
    name: 'NewOrder',
    component: () => import(/* webpackPrefetch: true */ '@/views/NewOrder.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/kitchen',
    name: 'Kitchen',
    component: () => import(/* webpackPrefetch: true */ '@/views/Kitchen.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import(/* webpackPrefetch: true */ '@/views/Payments.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import(/* webpackPrefetch: true */ '@/views/Users.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import(/* webpackPrefetch: true */ '@/views/Logs.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {
  const { start } = useNavLoader()
  start()

  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresGuest && isAuthenticated) {
    return authStore.homeRoute
  }

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) return '/login'

    if (authStore.user && to.name !== 'Login') {
      const allowed = authStore.canAccess(to.name)
      if (!allowed) {
        return authStore.homeRoute
      }
    }
  }

  return true
})

router.afterEach(() => {
  const { done } = useNavLoader()
  done()
})

export default router