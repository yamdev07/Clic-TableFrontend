<template>
  <div class="logs-layout">
    <div class="topbar">
      <div>
        <h1 class="page-title">Journal d'activité</h1>
        <p class="page-sub">Historique de toutes les actions sur l'application</p>
      </div>
      <button class="btn-ghost" @click="loadLogs">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Actualiser
      </button>
    </div>

    <!-- Filtres -->
    <div class="filters-bar">
      <div class="filter-group">
        <label>Catégorie</label>
        <select v-model="filters.entity_type" @change="loadLogs">
          <option value="">Toutes</option>
          <option value="user">Utilisateurs</option>
          <option value="order">Commandes</option>
          <option value="payment">Paiements</option>
          <option value="table">Tables</option>
          <option value="menu_item">Menu</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Date début</label>
        <input type="date" v-model="filters.date_from" @change="loadLogs" />
      </div>
      <div class="filter-group">
        <label>Date fin</label>
        <input type="date" v-model="filters.date_to" @change="loadLogs" />
      </div>
      <button v-if="hasActiveFilters" class="btn-clear" @click="clearFilters">
        Effacer les filtres
      </button>
    </div>

    <!-- Stats rapides -->
    <div class="log-stats">
      <div v-for="stat in actionStats" :key="stat.key" class="log-stat-card">
        <span class="log-stat-icon" :class="stat.key">{{ stat.icon }}</span>
        <div>
          <p class="log-stat-num">{{ stat.count }}</p>
          <p class="log-stat-label">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Table des logs -->
    <div class="logs-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        Chargement des logs...
      </div>
      <div v-else-if="logs.length === 0" class="empty-state">
        Aucune activité enregistrée
      </div>
      <div v-else class="logs-list">
        <div v-for="log in logs" :key="log.id" class="log-row">
          <div class="log-icon" :class="getLogMeta(log.action).color">
            {{ getLogMeta(log.action).icon }}
          </div>
          <div class="log-body">
            <p class="log-description">{{ log.description || log.action }}</p>
            <div class="log-meta">
              <span class="log-tag" :class="'tag-' + log.entity_type">
                {{ entityLabels[log.entity_type] || log.entity_type }}
              </span>
              <span class="log-user" v-if="log.user_name">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/>
                  <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
                {{ log.user_name }}
              </span>
              <span class="log-ip" v-if="log.ip_address">{{ log.ip_address }}</span>
            </div>
          </div>
          <div class="log-date">{{ formatDate(log.created_at) }}</div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="pagination.current_page <= 1"
          @click="goToPage(pagination.current_page - 1)"
        >
          ←
        </button>
        <span class="page-info">
          Page {{ pagination.current_page }} / {{ pagination.last_page }}
          <small>({{ pagination.total }} entrées)</small>
        </span>
        <button
          class="page-btn"
          :disabled="pagination.current_page >= pagination.last_page"
          @click="goToPage(pagination.current_page + 1)"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const logs = ref([])
const loading = ref(false)
const pagination = ref({ current_page: 1, last_page: 1, total: 0 })
const currentPage = ref(1)

const filters = ref({
  entity_type: '',
  date_from: '',
  date_to: '',
})

const entityLabels = {
  user:      'Utilisateur',
  order:     'Commande',
  payment:   'Paiement',
  table:     'Table',
  menu_item: 'Menu',
  general:   'Général',
}

const ACTION_META = {
  'auth.login':               { icon: '🔑', color: 'green',  label: 'Connexion' },
  'auth.logout':              { icon: '🚪', color: 'gray',   label: 'Déconnexion' },
  'order.created':            { icon: '📋', color: 'blue',   label: 'Commande créée' },
  'order.item_added':         { icon: '➕', color: 'blue',   label: 'Article ajouté' },
  'order.item_removed':       { icon: '➖', color: 'orange', label: 'Article retiré' },
  'order.confirmed':          { icon: '✅', color: 'green',  label: 'Commande confirmée' },
  'order.cancelled':          { icon: '❌', color: 'red',    label: 'Commande annulée' },
  'order.sent_to_kitchen':    { icon: '👨‍🍳', color: 'purple', label: 'Envoi cuisine' },
  'order.status_updated':     { icon: '🔄', color: 'blue',   label: 'Statut mis à jour' },
  'payment.processed':        { icon: '💰', color: 'green',  label: 'Paiement' },
  'table.created':            { icon: '🪑', color: 'blue',   label: 'Table créée' },
  'table.updated':            { icon: '✏️', color: 'orange', label: 'Table modifiée' },
  'table.deleted':            { icon: '🗑️', color: 'red',    label: 'Table supprimée' },
  'table.status_changed':     { icon: '🔄', color: 'blue',   label: 'Statut table' },
  'menu.item_created':        { icon: '🍽️', color: 'blue',   label: 'Plat ajouté' },
  'menu.item_updated':        { icon: '✏️', color: 'orange', label: 'Plat modifié' },
  'menu.item_deleted':        { icon: '🗑️', color: 'red',    label: 'Plat supprimé' },
  'menu.availability_changed':{ icon: '👁️', color: 'orange', label: 'Disponibilité' },
  'user.created':             { icon: '👤', color: 'green',  label: 'Compte créé' },
  'user.updated':             { icon: '✏️', color: 'orange', label: 'Compte modifié' },
  'user.deactivated':         { icon: '🚫', color: 'red',    label: 'Compte désactivé' },
}

const getLogMeta = (action) => ACTION_META[action] || { icon: '📝', color: 'gray', label: action }

const hasActiveFilters = computed(() =>
  filters.value.entity_type || filters.value.date_from || filters.value.date_to
)

const actionStats = computed(() => {
  const counts = {}
  logs.value.forEach(l => {
    const cat = l.action.split('.')[0]
    counts[cat] = (counts[cat] || 0) + 1
  })
  return [
    { key: 'auth',    icon: '🔑', label: 'Connexions',  count: counts.auth    || 0 },
    { key: 'order',   icon: '📋', label: 'Commandes',   count: counts.order   || 0 },
    { key: 'payment', icon: '💰', label: 'Paiements',   count: counts.payment || 0 },
    { key: 'table',   icon: '🪑', label: 'Tables',      count: counts.table   || 0 },
    { key: 'menu',    icon: '🍽️', label: 'Menu',        count: counts.menu    || 0 },
    { key: 'user',    icon: '👤', label: 'Utilisateurs', count: counts.user   || 0 },
  ]
})

const loadLogs = async (page = 1) => {
  loading.value = true
  try {
    const params = { page, ...Object.fromEntries(
      Object.entries(filters.value).filter(([, v]) => v !== '')
    )}
    const res = await api.get('/logs', { params })
    logs.value = res.data.data
    pagination.value = {
      current_page: res.data.current_page,
      last_page:    res.data.last_page,
      total:        res.data.total,
    }
  } catch (err) {
    console.error('Erreur chargement logs', err)
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => loadLogs(page)

const clearFilters = () => {
  filters.value = { entity_type: '', date_from: '', date_to: '' }
  loadLogs()
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

onMounted(() => loadLogs())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

.logs-layout {
  min-height: 100vh;
  background: #f4f4f6;
  font-family: 'DM Sans', sans-serif;
  color: #0f0f12;
  padding: 32px 36px;
  max-width: 1200px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-title { font-size: 22px; font-weight: 600; margin: 0 0 3px; letter-spacing: -0.03em; }
.page-sub   { font-size: 13px; color: #9b9bab; margin: 0; }

.btn-ghost {
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
.btn-ghost:hover { border-color: #c4b5fd; color: #7c3aed; background: #f5f3ff; }

/* ── Filtres ── */
.filters-bar {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.filter-group { display: flex; flex-direction: column; gap: 5px; }
.filter-group label { font-size: 11px; font-weight: 600; color: #9b9bab; text-transform: uppercase; letter-spacing: 0.05em; }
.filter-group select,
.filter-group input {
  padding: 8px 10px;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  background: #fafafa;
  transition: border-color 0.15s;
}
.filter-group select:focus,
.filter-group input:focus { border-color: #a78bfa; }
.btn-clear {
  padding: 8px 14px;
  background: #fff5f5;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  color: #dc2626;
  font-size: 12.5px;
  cursor: pointer;
  align-self: flex-end;
}

/* ── Stats ── */
.log-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.log-stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 10px;
  padding: 10px 16px;
  flex: 1;
  min-width: 120px;
}
.log-stat-icon { font-size: 22px; }
.log-stat-num  { font-size: 18px; font-weight: 700; color: #0f0f12; margin: 0; line-height: 1; }
.log-stat-label { font-size: 11px; color: #9b9bab; margin: 2px 0 0; }

/* ── Logs card ── */
.logs-card {
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 12px;
  overflow: hidden;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px;
  color: #9b9bab;
}
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e4e4ec;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 60px; color: #c5c5d0; font-size: 14px; }

.logs-list { display: flex; flex-direction: column; }

.log-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 13px 20px;
  border-bottom: 1px solid #f4f4f6;
  transition: background 0.1s;
}
.log-row:last-child { border-bottom: none; }
.log-row:hover { background: #fafafa; }

.log-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}
.log-icon.green  { background: rgba(16,185,129,0.1); }
.log-icon.blue   { background: rgba(59,130,246,0.1);  }
.log-icon.red    { background: rgba(239,68,68,0.1);   }
.log-icon.orange { background: rgba(245,158,11,0.1);  }
.log-icon.purple { background: rgba(124,58,237,0.1);  }
.log-icon.gray   { background: rgba(107,114,128,0.1); }

.log-body { flex: 1; min-width: 0; }
.log-description { font-size: 13.5px; color: #0f0f12; margin: 0 0 5px; }

.log-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.log-tag {
  font-size: 10.5px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}
.tag-user      { background: rgba(124,58,237,0.1);  color: #7c3aed; }
.tag-order     { background: rgba(59,130,246,0.1);  color: #2563eb; }
.tag-payment   { background: rgba(16,185,129,0.1);  color: #059669; }
.tag-table     { background: rgba(245,158,11,0.1);  color: #d97706; }
.tag-menu_item { background: rgba(239,68,68,0.1);   color: #dc2626; }
.tag-general   { background: rgba(107,114,128,0.1); color: #6b7280; }

.log-user, .log-ip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #9b9bab;
}

.log-date {
  font-size: 11.5px;
  color: #c5c5d0;
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 2px;
}

/* ── Pagination ── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #e4e4ec;
}
.page-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e4e4ec;
  background: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #c4b5fd; color: #7c3aed; }
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.page-info { font-size: 13px; color: #6b6b7b; }
.page-info small { color: #9b9bab; margin-left: 6px; }

@media (max-width: 768px) {
  .logs-layout { padding: 20px 16px; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .log-stats { flex-direction: column; }
}
</style>
