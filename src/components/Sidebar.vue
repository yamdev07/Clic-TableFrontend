<template>
  <aside class="sidebar">

    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="7" width="20" height="2" rx="1" fill="white" opacity="0.9"/>
          <rect x="2" y="15" width="20" height="2" rx="1" fill="white" opacity="0.9"/>
          <rect x="6" y="7" width="2" height="10" rx="1" fill="white" opacity="0.6"/>
          <rect x="16" y="7" width="2" height="10" rx="1" fill="white" opacity="0.6"/>
        </svg>
      </div>
      <div class="brand-text">
        <span class="brand-name">Clic<em>&</em>Table</span>
        <span class="brand-tagline">Gestion de salle</span>
      </div>
    </div>

    <!-- Nav -->
    <nav class="sidebar-nav">
      <span class="nav-section-label">Espace de travail</span>

      <router-link to="/" class="nav-item" exact-active-class="nav-active">
        <div class="nav-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.8"/>
            <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.8"/>
            <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.8"/>
            <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.8"/>
          </svg>
        </div>
        <span class="nav-label">Tableau de bord</span>
      </router-link>

      <router-link to="/tables" class="nav-item">
        <div class="nav-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="7" width="20" height="2" rx="1" stroke="currentColor" stroke-width="1.6" fill="currentColor" opacity="0.5"/>
            <rect x="2" y="15" width="20" height="2" rx="1" stroke="currentColor" stroke-width="1.6" fill="currentColor" opacity="0.5"/>
            <line x1="6" y1="7" x2="6" y2="17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="18" y1="7" x2="18" y2="17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="nav-label">Tables</span>
        <span class="nav-badge" :class="{ 'badge-busy': stats.occupiedTables > 0 }">
          {{ stats.occupiedTables }}/{{ stats.tables }}
        </span>
      </router-link>

      <router-link to="/orders" class="nav-item">
        <div class="nav-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
            <rect x="9" y="3" width="6" height="4" rx="1.2" stroke="currentColor" stroke-width="1.7"/>
            <path d="M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="nav-label">Commandes</span>
        <span v-if="stats.activeOrders > 0" class="nav-badge badge-accent">
          {{ stats.activeOrders }}
        </span>
      </router-link>

      <router-link to="/menu" class="nav-item">
        <div class="nav-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" stroke="currentColor" stroke-width="1.7"/>
            <path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="nav-label">Menu</span>
      </router-link>

      <router-link to="/payments" class="nav-item">
        <div class="nav-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/>
            <path d="M2 10h20" stroke="currentColor" stroke-width="1.7"/>
            <path d="M6 15h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="nav-label">Paiements</span>
      </router-link>

      <router-link v-if="authStore.isKitchen" to="/kitchen" class="nav-item">
        <div class="nav-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M6 2v6a3 3 0 0 0 6 0V2M9 2v6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
            <path d="M18 2c0 0 0 6-3 6s-3-6-3-6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
            <path d="M3 14h18v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" stroke="currentColor" stroke-width="1.7"/>
          </svg>
        </div>
        <span class="nav-label">Cuisine</span>
      </router-link>
    </nav>

    <!-- Spacer -->
    <div class="sidebar-spacer"></div>

    <!-- Stats rapides -->
    <div class="sidebar-stats">
      <div class="stat-row">
        <span class="stat-label">Tables libres</span>
        <span class="stat-val stat-green">{{ stats.tables - stats.occupiedTables }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">En préparation</span>
        <span class="stat-val stat-purple">{{ stats.activeOrders }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="user-card">
        <div class="user-avatar">{{ initials }}</div>
        <div class="user-meta">
          <span class="user-name">{{ authStore.userName }}</span>
          <span class="user-role">{{ authStore.userRole }}</span>
        </div>
        <button @click="logout" class="logout-btn" title="Déconnexion">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M3 12V7a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
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

const stats = ref({ tables: 0, occupiedTables: 0, activeOrders: 0 })

const initials = computed(() =>
  (authStore.userName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
)

const loadStats = async () => {
  try {
    const tables = await api.get('/tables')
    stats.value.tables = tables.data.length
    stats.value.occupiedTables = tables.data.filter(t => t.status === 'occupied').length
    const orders = await api.get('/orders')
    const all = orders.data.data || orders.data
    stats.value.activeOrders = all.filter(o => !['paid', 'cancelled'].includes(o.status)).length
  } catch {}
}

const logout = () => { authStore.logout(); router.push('/login') }

onMounted(() => { loadStats(); setInterval(loadStats, 30000) })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

/* ── Sidebar ── */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #0d0d11;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  font-family: 'DM Sans', sans-serif;
  border-right: 1px solid rgba(255,255,255,0.05);
}

/* ── Brand ── */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 18px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.brand-logo {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(124,58,237,0.45);
}
.brand-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.brand-name {
  font-size: 15px;
  font-weight: 700;
  color: rgba(255,255,255,0.95);
  letter-spacing: -0.02em;
  line-height: 1;
}
.brand-name em {
  font-style: normal;
  color: #a78bfa;
}
.brand-tagline {
  font-size: 10.5px;
  color: rgba(255,255,255,0.28);
  letter-spacing: 0.02em;
  font-weight: 400;
}

/* ── Nav ── */
.sidebar-nav {
  padding: 14px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.nav-section-label {
  font-size: 9.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.2);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 6px 8px 8px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 9px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255,255,255,0.45);
  transition: all 0.15s;
  border-left: 2px solid transparent;
  position: relative;
}
.nav-item:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.85);
}
/* Active state via Vue Router */
.nav-item.router-link-active,
.nav-item.nav-active {
  background: rgba(124,58,237,0.14);
  color: rgba(255,255,255,0.95);
  border-left-color: #7c3aed;
  font-weight: 500;
}
.nav-item.router-link-active .nav-icon,
.nav-item.nav-active .nav-icon {
  color: #a78bfa;
}

.nav-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  flex-shrink: 0;
  transition: all 0.15s;
  color: inherit;
}
.nav-item:hover .nav-icon,
.nav-item.router-link-active .nav-icon {
  background: rgba(255,255,255,0.07);
}

.nav-label {
  flex: 1;
  white-space: nowrap;
}

.nav-badge {
  font-size: 10.5px;
  font-weight: 600;
  background: rgba(255,255,255,0.09);
  color: rgba(255,255,255,0.4);
  padding: 2px 7px;
  border-radius: 20px;
  flex-shrink: 0;
}
.nav-badge.badge-busy {
  background: rgba(255,72,72,0.2);
  color: #fca5a5;
}
.nav-badge.badge-accent {
  background: rgba(124,58,237,0.3);
  color: #c4b5fd;
}

/* ── Spacer ── */
.sidebar-spacer { flex: 1; }

/* ── Stats rapides ── */
.sidebar-stats {
  margin: 0 10px 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat-label {
  font-size: 11.5px;
  color: rgba(255,255,255,0.3);
}
.stat-val {
  font-size: 13px;
  font-weight: 600;
}
.stat-green  { color: #34d399; }
.stat-purple { color: #a78bfa; }

/* ── Footer ── */
.sidebar-footer {
  padding: 10px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(124,58,237,0.4);
}
.user-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.user-name {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.88);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role {
  font-size: 10.5px;
  color: rgba(255,255,255,0.28);
  text-transform: capitalize;
}
.logout-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.25);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 6px;
  transition: all 0.15s;
  flex-shrink: 0;
}
.logout-btn:hover {
  background: rgba(239,68,68,0.18);
  color: #fca5a5;
}
</style>
