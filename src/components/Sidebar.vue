<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M3 12h18M3 18h12" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <circle cx="20" cy="18" r="3" fill="#a78bfa"/>
        </svg>
      </div>
      <span>Clic<em>&</em>Table</span>
    </div>

    <nav class="sidebar-nav">
      <span class="nav-section-label">Espace de travail</span>

      <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span>Tableau de bord</span>
      </router-link>

      <router-link to="/tables" class="nav-item" :class="{ active: $route.path === '/tables' }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M3 18h18M6 6v12M18 6v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Tables</span>
        <span class="nav-badge">{{ stats.occupiedTables }}/{{ stats.tables }}</span>
      </router-link>

      <router-link to="/orders" class="nav-item" :class="{ active: $route.path === '/orders' }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="1.5"/>
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/>
          <path d="M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Commandes</span>
        <span v-if="stats.activeOrders > 0" class="nav-badge accent">{{ stats.activeOrders }}</span>
      </router-link>

      <router-link to="/menu" class="nav-item" :class="{ active: $route.path === '/menu' }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Menu</span>
      </router-link>

      <router-link v-if="authStore.isKitchen" to="/kitchen" class="nav-item" :class="{ active: $route.path === '/kitchen' }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 2v6a3 3 0 0 0 6 0V2M9 2v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M18 2c0 0 0 6-3 6s-3-6-3-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M3 14h18v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span>Cuisine</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-chip">
        <div class="user-avatar">{{ initials }}</div>
        <div class="user-meta">
          <span class="user-name">{{ authStore.userName }}</span>
          <span class="user-role">{{ authStore.userRole }}</span>
        </div>
      </div>
      <button @click="logout" class="logout-btn" title="Déconnexion">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M17 16l4-4m0 0l-4-4m4 4H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M3 12V7a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref({
  tables: 0,
  occupiedTables: 0,
  activeOrders: 0,
})

const initials = computed(() => {
  return (authStore.userName || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const loadStats = async () => {
  try {
    const tables = await api.get('/tables')
    stats.value.tables = tables.data.length
    stats.value.occupiedTables = tables.data.filter(t => t.status === 'occupied').length

    const orders = await api.get('/orders')
    const allOrders = orders.data.data || orders.data
    stats.value.activeOrders = allOrders.filter(o => !['paid', 'cancelled'].includes(o.status)).length
  } catch (error) {
    console.error('Erreur chargement stats sidebar', error)
  }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadStats()
  setInterval(loadStats, 30000)
})
</script>

<style scoped>
.sidebar {
  width: 232px;
  flex-shrink: 0;
  background: #0f0f12;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 16px;
  font-weight: 600;
  color: white;
  letter-spacing: -0.02em;
}

.sidebar-brand em {
  font-style: normal;
  color: #a78bfa;
}

.brand-icon {
  width: 30px;
  height: 30px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-section-label {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 8px 8px 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 400;
  color: rgba(255,255,255,0.5);
  transition: all 0.15s;
}

.nav-item:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.9);
}

.nav-item.active,
.router-link-active.nav-item {
  background: rgba(124,58,237,0.18);
  color: #c4b5fd;
}

.nav-item span:first-of-type {
  flex: 1;
}

.nav-badge {
  font-size: 11px;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  padding: 2px 7px;
  border-radius: 20px;
  font-weight: 500;
}

.nav-badge.accent {
  background: rgba(124,58,237,0.3);
  color: #c4b5fd;
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-chip {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(124,58,237,0.3);
  color: #c4b5fd;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  text-transform: capitalize;
}

.logout-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.15s;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: rgba(239,68,68,0.15);
  color: #fca5a5;
}
</style>