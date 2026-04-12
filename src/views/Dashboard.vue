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
      <div class="kpi-card kpi-tables">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="2" rx="1" fill="currentColor" opacity="0.7"/>
              <rect x="2" y="15" width="20" height="2" rx="1" fill="currentColor" opacity="0.7"/>
              <line x1="6"  y1="7" x2="6"  y2="17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <line x1="18" y1="7" x2="18" y2="17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="kpi-badge" :class="occupancyPct > 70 ? 'badge-red' : 'badge-green'">
            {{ occupancyPct }}%
          </span>
        </div>
        <div class="kpi-value">{{ stats.occupiedTables }}<span class="kpi-total">/{{ stats.tables }}</span></div>
        <div class="kpi-label">Tables occupées</div>
        <div class="kpi-bar-track">
          <div class="kpi-bar-fill" :style="{ width: occupancyPct + '%' }"></div>
        </div>
      </div>

      <div class="kpi-card kpi-orders">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.8"/>
              <path d="M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <span v-if="stats.activeOrders > 0" class="kpi-badge badge-blue">Actif</span>
        </div>
        <div class="kpi-value">{{ stats.activeOrders }}</div>
        <div class="kpi-label">Commandes actives</div>
        <div class="kpi-foot">en cours de préparation</div>
      </div>

      <div class="kpi-card kpi-revenue">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/>
              <path d="M2 10h20" stroke="currentColor" stroke-width="1.8"/>
              <path d="M6 15h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="kpi-badge badge-purple">Aujourd'hui</span>
        </div>
        <div class="kpi-value kpi-money">{{ formatMoney(stats.todayRevenue) }}</div>
        <div class="kpi-label">Chiffre d'affaires</div>
        <div class="kpi-foot">{{ stats.todayOrders }} commande{{ stats.todayOrders !== 1 ? 's' : '' }} ce jour</div>
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
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

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

onMounted(() => {
  loadStats()
  setInterval(loadStats, 30000)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

.dashboard {
  min-height: 100vh;
  background: #f2f2f6;
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
  font-weight: 700;
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

.topbar-right { display: flex; align-items: center; gap: 10px; }

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
.refresh-chip:hover { border-color: #c4b5fd; color: #7c3aed; background: #f5f3ff; }

/* ── KPI Grid ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.kpi-card {
  background: white;
  border: 1px solid #e8e8f0;
  border-radius: 14px;
  padding: 20px 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s, transform 0.2s;
}
.kpi-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

/* Accent coloré gauche */
.kpi-tables { border-left: 3px solid #f87171; }
.kpi-orders { border-left: 3px solid #60a5fa; }
.kpi-revenue { border-left: 3px solid #a78bfa; }

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.kpi-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-tables .kpi-icon  { background: #fee2e2; color: #ef4444; }
.kpi-orders .kpi-icon  { background: #dbeafe; color: #3b82f6; }
.kpi-revenue .kpi-icon { background: #ede9fe; color: #7c3aed; }

.kpi-badge {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
}
.badge-red    { background: #fee2e2; color: #991b1b; }
.badge-green  { background: #dcfce7; color: #166534; }
.badge-blue   { background: #dbeafe; color: #1e40af; }
.badge-purple { background: #ede9fe; color: #6d28d9; }

.kpi-value {
  font-size: 34px;
  font-weight: 700;
  color: #0f0f12;
  letter-spacing: -0.04em;
  line-height: 1;
}
.kpi-money { font-size: 22px; }
.kpi-total { font-size: 20px; font-weight: 400; color: #c5c5d0; }

.kpi-label {
  font-size: 12px;
  font-weight: 500;
  color: #9b9bab;
  margin-top: 2px;
}

.kpi-bar-track {
  height: 3px;
  background: #f0f0f5;
  border-radius: 99px;
  overflow: hidden;
  margin-top: 10px;
}
.kpi-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f87171, #ef4444);
  border-radius: 99px;
  transition: width 0.6s ease;
}
.kpi-foot { font-size: 11.5px; color: #b0b0c0; margin-top: 4px; }

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
  border: 1px solid #e8e8f0;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.15s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.action-card:hover {
  border-color: #c4b5fd;
  background: #faf9ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(124,58,237,0.1);
}
.action-card:hover .action-arrow { color: #7c3aed; transform: translateX(3px); }

.action-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #f4f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b6b7b;
  flex-shrink: 0;
  transition: all 0.15s;
}
.action-card:hover .action-icon-wrap { background: #ede9fe; color: #7c3aed; }

.action-body { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.action-title { font-size: 13.5px; font-weight: 600; color: #0f0f12; }
.action-desc {
  font-size: 11.5px;
  color: #9b9bab;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.action-arrow { color: #d0d0dc; flex-shrink: 0; transition: all 0.15s; }

/* ── Data table ── */
.table-wrap {
  background: white;
  border: 1px solid #e8e8f0;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.data-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.data-table thead th {
  padding: 13px 18px;
  text-align: left;
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #b0b0c0;
  background: #fafafc;
  border-bottom: 1px solid #f0f0f5;
}
.data-row td { padding: 13px 18px; border-bottom: 1px solid #f5f5f8; color: #3f3f4e; }
.data-row:last-child td { border-bottom: none; }
.data-row:hover td { background: #fafafd; }
.order-num  { font-weight: 700; color: #0f0f12 !important; }
.order-total { font-weight: 600; color: #0f0f12 !important; }
.order-date { color: #b0b0c0 !important; font-size: 12.5px; }
.empty-row  { text-align: center; padding: 44px !important; color: #d0d0dc !important; font-size: 13px; }

/* ── Status pills ── */
.status-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
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