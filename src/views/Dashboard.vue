<template>
  <div class="dashboard">
    <!-- Top bar -->
    <div class="topbar">
      <div>
        <h1 class="page-title">Tableau de bord</h1>
        <p class="page-sub">{{ dateLabel }}</p>
      </div>
      <div class="topbar-right">
        <div class="refresh-chip" @click="loadStats">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Actualiser
        </div>
      </div>
    </div>

    <!-- KPI strip -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Tables occupées</div>
        <div class="kpi-value">{{ stats.occupiedTables }}<span class="kpi-total">/{{ stats.tables }}</span></div>
        <div class="kpi-bar-track">
          <div class="kpi-bar-fill" :style="{ width: occupancyPct + '%' }"></div>
        </div>
        <div class="kpi-foot">{{ occupancyPct }}% d'occupation</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Commandes actives</div>
        <div class="kpi-value">{{ stats.activeOrders }}</div>
        <div class="kpi-foot">en cours de préparation</div>
      </div>

      <div class="kpi-card kpi-accent">
        <div class="kpi-label">CA aujourd'hui</div>
        <div class="kpi-value kpi-money">{{ formatMoney(stats.todayRevenue) }}</div>
        <div class="kpi-foot">{{ stats.todayOrders }} commande{{ stats.todayOrders !== 1 ? 's' : '' }}</div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="section-header">
      <h2 class="section-title">Accès rapide</h2>
    </div>
    <div class="actions-grid">
      <router-link to="/tables" class="action-card">
        <div class="action-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 18h18M6 6v12M18 6v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="action-body">
          <span class="action-title">Tables</span>
          <span class="action-desc">Gérer les tables du restaurant</span>
        </div>
        <svg class="action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </router-link>

      <router-link to="/menu" class="action-card">
        <div class="action-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="1.5"/>
            <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="action-body">
          <span class="action-title">Menu</span>
          <span class="action-desc">Gérer les plats et catégories</span>
        </div>
        <svg class="action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </router-link>

      <router-link to="/orders" class="action-card">
        <div class="action-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="21" r="1" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="20" cy="21" r="1" stroke="currentColor" stroke-width="1.5"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="action-body">
          <span class="action-title">Commandes</span>
          <span class="action-desc">Prendre et gérer les commandes</span>
        </div>
        <svg class="action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </router-link>

      <router-link to="/payments" class="action-card">
        <div class="action-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="1.5"/>
            <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M18 8h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="action-body">
          <span class="action-title">Paiements</span>
          <span class="action-desc">Gérer les encaissements</span>
        </div>
        <svg class="action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </router-link>

      <router-link v-if="authStore.isKitchen" to="/kitchen" class="action-card">
        <div class="action-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 2v6a3 3 0 0 0 6 0V2M9 2v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M18 2c0 0 0 6-3 6s-3-6-3-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M3 14h18v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </div>
        <div class="action-body">
          <span class="action-title">Cuisine</span>
          <span class="action-desc">Gérer la production en cuisine</span>
        </div>
        <svg class="action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </router-link>
    </div>

    <!-- Recent orders -->
    <div class="section-header">
      <h2 class="section-title">Commandes récentes</h2>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>N° commande</th>
            <th>Table</th>
            <th>Total</th>
            <th>Statut</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in recentOrders" :key="order.id" class="data-row">
            <td class="order-num">#{{ order.order_number }}</td>
            <td>Table {{ order.table?.number }}</td>
            <td class="order-total">{{ formatMoney(order.total) }}</td>
            <td>
              <span class="status-pill" :class="order.status">
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
            <td class="order-date">{{ formatDate(order.created_at) }}</td>
          </tr>
          <tr v-if="recentOrders.length === 0">
            <td colspan="5" class="empty-row">Aucune commande récente</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
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
  todayRevenue: 0,
  todayOrders: 0,
})
const recentOrders = ref([])

const occupancyPct = computed(() => {
  if (!stats.value.tables) return 0
  return Math.round((stats.value.occupiedTables / stats.value.tables) * 100)
})

const dateLabel = computed(() => {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
})

const loadStats = async () => {
  try {
    const tables = await api.get('/tables')
    stats.value.tables = tables.data.length
    stats.value.occupiedTables = tables.data.filter(t => t.status === 'occupied').length

    const orders = await api.get('/orders')
    const allOrders = orders.data.data || orders.data

    stats.value.activeOrders = allOrders.filter(o => !['paid', 'cancelled'].includes(o.status)).length

    const today = new Date().toISOString().split('T')[0]
    const todayList = allOrders.filter(o => o.created_at?.split('T')[0] === today)
    stats.value.todayOrders = todayList.length
    stats.value.todayRevenue = todayList.reduce((sum, o) => sum + (o.total || 0), 0)

    recentOrders.value = allOrders.slice(0, 10)
  } catch (error) {
    console.error('Erreur chargement stats', error)
  }
}

const formatMoney = (amount) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount || 0)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

const getStatusLabel = (status) => ({
  open: 'Ouvert',
  in_progress: 'En préparation',
  ready: 'Prêt',
  served: 'Servi',
  paid: 'Payé',
  cancelled: 'Annulé',
}[status] || status)

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
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

.dashboard {
  min-height: 100vh;
  background: #f4f4f6;
  font-family: 'DM Sans', sans-serif;
  color: #0f0f12;
  padding: 32px 36px;
}

/* ── Topbar ── */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #0f0f12;
  margin: 0 0 3px;
  letter-spacing: -0.03em;
}

.page-sub {
  font-size: 13px;
  color: #9b9bab;
  margin: 0;
  text-transform: capitalize;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.refresh-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: #6b6b7b;
  cursor: pointer;
  transition: all 0.15s;
}

.refresh-chip:hover {
  border-color: #c4b5fd;
  color: #7c3aed;
  background: #f5f3ff;
}

/* ── KPI Grid ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.kpi-card {
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 12px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kpi-card.kpi-accent {
  background: #0f0f12;
  border-color: #0f0f12;
}

.kpi-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9b9bab;
}

.kpi-accent .kpi-label {
  color: rgba(255,255,255,0.4);
}

.kpi-value {
  font-size: 32px;
  font-weight: 600;
  color: #0f0f12;
  letter-spacing: -0.04em;
  line-height: 1;
}

.kpi-accent .kpi-value {
  color: white;
}

.kpi-money {
  font-size: 22px;
}

.kpi-total {
  font-size: 18px;
  font-weight: 400;
  color: #c5c5d0;
}

.kpi-bar-track {
  height: 3px;
  background: #f0f0f5;
  border-radius: 99px;
  overflow: hidden;
  margin: 4px 0 0;
}

.kpi-bar-fill {
  height: 100%;
  background: #7c3aed;
  border-radius: 99px;
  transition: width 0.6s ease;
}

.kpi-foot {
  font-size: 12px;
  color: #9b9bab;
}

.kpi-accent .kpi-foot {
  color: rgba(255,255,255,0.3);
}

/* ── Section header ── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f0f12;
  letter-spacing: -0.01em;
  margin: 0;
}

/* ── Action cards ── */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.15s;
}

.action-card:hover {
  border-color: #c4b5fd;
  background: #faf9ff;
  transform: translateY(-1px);
}

.action-card:hover .action-arrow {
  color: #7c3aed;
  transform: translateX(2px);
}

.action-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: #f4f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b6b7b;
  flex-shrink: 0;
  transition: background 0.15s;
}

.action-card:hover .action-icon-wrap {
  background: #ede9fe;
  color: #7c3aed;
}

.action-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.action-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #0f0f12;
}

.action-desc {
  font-size: 11.5px;
  color: #9b9bab;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-arrow {
  color: #c5c5d0;
  flex-shrink: 0;
  transition: all 0.15s;
}

/* ── Data table ── */
.table-wrap {
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

.data-table thead th {
  padding: 12px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9b9bab;
  background: #fafafc;
  border-bottom: 1px solid #e4e4ec;
}

.data-row td {
  padding: 13px 16px;
  border-bottom: 1px solid #f0f0f5;
  color: #3f3f4e;
}

.data-row:last-child td {
  border-bottom: none;
}

.data-row:hover td {
  background: #fafafc;
}

.order-num {
  font-weight: 600;
  color: #0f0f12 !important;
  font-family: 'DM Sans', monospace;
}

.order-total {
  font-weight: 500;
  color: #0f0f12 !important;
}

.order-date {
  color: #9b9bab !important;
  font-size: 12.5px;
}

.empty-row {
  text-align: center;
  padding: 40px !important;
  color: #c5c5d0 !important;
  font-size: 13px;
}

/* ── Status pills ── */
.status-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 500;
}

.status-pill.open        { background: #fef9c3; color: #854d0e; }
.status-pill.in_progress { background: #dbeafe; color: #1e40af; }
.status-pill.ready       { background: #dcfce7; color: #166534; }
.status-pill.served      { background: #ede9fe; color: #6d28d9; }
.status-pill.paid        { background: #dcfce7; color: #166534; }
.status-pill.cancelled   { background: #fee2e2; color: #991b1b; }

@media (max-width: 900px) {
  .dashboard { padding: 20px 16px; }
  .kpi-grid { grid-template-columns: 1fr; }
}
</style>