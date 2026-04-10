<template>
  <div class="dashboard">
    <header class="header">
      <div class="logo">
        <h1>🍽️ Clic&Table</h1>
        <span class="role-badge">{{ authStore.userRole }}</span>
      </div>
      <div class="user-info">
        <span class="user-name">{{ authStore.userName }}</span>
        <button @click="logout" class="logout-btn">Déconnexion</button>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🍽️</div>
        <div class="stat-info">
          <h3>Tables</h3>
          <p class="stat-number">{{ stats.tables }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🧾</div>
        <div class="stat-info">
          <h3>Commandes actives</h3>
          <p class="stat-number">{{ stats.activeOrders }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <h3>CA aujourd'hui</h3>
          <p class="stat-number">{{ formatMoney(stats.todayRevenue) }}</p>
        </div>
      </div>
    </div>

    <div class="menu-grid">
      <router-link to="/tables" class="menu-card">
        <div class="menu-icon">🍽️</div>
        <h3>Tables</h3>
        <p>Gérer les tables du restaurant</p>
      </router-link>

      <router-link to="/menu" class="menu-card">
        <div class="menu-icon">📝</div>
        <h3>Menu</h3>
        <p>Gérer les plats et catégories</p>
      </router-link>

      <router-link to="/orders" class="menu-card">
        <div class="menu-icon">🧾</div>
        <h3>Commandes</h3>
        <p>Prendre et gérer les commandes</p>
      </router-link>

      <router-link v-if="authStore.isKitchen" to="/kitchen" class="menu-card">
        <div class="menu-icon">👨‍🍳</div>
        <h3>Cuisine</h3>
        <p>Gérer la production</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref({
  tables: 0,
  activeOrders: 0,
  todayRevenue: 0,
})

const loadStats = async () => {
  try {
    const tables = await api.get('/tables')
    stats.value.tables = tables.data.length
  } catch (error) {
    console.error('Erreur chargement stats', error)
  }
}

const formatMoney = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount)
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f7fafc;
}

.header {
  background: white;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo h1 {
  color: #667eea;
  font-size: 24px;
}

.role-badge {
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  color: #4a5568;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.logout-btn {
  padding: 8px 16px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #c53030;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  padding: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 48px;
}

.stat-info h3 {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  padding: 32px;
}

.menu-card {
  background: white;
  padding: 32px 24px;
  border-radius: 16px;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.menu-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.menu-card h3 {
  color: #333;
  font-size: 20px;
  margin-bottom: 8px;
}

.menu-card p {
  color: #666;
  font-size: 14px;
}
</style>