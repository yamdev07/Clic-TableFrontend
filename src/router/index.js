import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tables',
    name: 'Tables',
    component: () => import('@/views/Tables.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/menu',
    name: 'Menu',
    component: () => import('@/views/Menu.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/new/:tableId',
    name: 'NewOrder',
    component: () => import('@/views/NewOrder.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/kitchen',
    name: 'Kitchen',
    component: () => import('@/views/Kitchen.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import('@/views/Payments.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/Users.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/Logs.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresGuest && isAuthenticated) {
    return authStore.homeRoute
  }

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) return '/login'

    // If user is loaded, enforce role-based access
    if (authStore.user && to.name !== 'Login') {
      const allowed = authStore.canAccess(to.name)
      if (!allowed) {
        // Redirect to their home if they don't have access
        return authStore.homeRoute
      }
    }
  }

  return true
})

export default router