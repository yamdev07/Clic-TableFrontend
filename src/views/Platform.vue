<template>
  <div class="platform">
    <header class="platform-header">
      <div class="brand">
        <span class="brand-name">Clic<em>&</em>Table</span>
        <span class="brand-tag">Plateforme</span>
      </div>
      <div class="header-user">
        <span>{{ authStore.userName }}</span>
        <button class="btn-ghost" @click="logout">Déconnexion</button>
      </div>
    </header>

    <main class="platform-main">
      <section class="stat-row">
        <div class="stat-tile">
          <span class="stat-label">Restaurants</span>
          <span class="stat-value">{{ stats.restaurants ?? '—' }}</span>
        </div>
        <div class="stat-tile">
          <span class="stat-label">Actifs (payants)</span>
          <span class="stat-value">{{ stats.active ?? '—' }}</span>
        </div>
        <div class="stat-tile">
          <span class="stat-label">En essai</span>
          <span class="stat-value">{{ stats.trial ?? '—' }}</span>
        </div>
        <div class="stat-tile" :class="{ warn: stats.trials_expired > 0 }">
          <span class="stat-label">Essais expirés</span>
          <span class="stat-value">{{ stats.trials_expired ?? '—' }}</span>
        </div>
        <div class="stat-tile">
          <span class="stat-label">Suspendus</span>
          <span class="stat-value">{{ stats.suspended ?? '—' }}</span>
        </div>
        <div class="stat-tile">
          <span class="stat-label">Commandes (30 j)</span>
          <span class="stat-value">{{ stats.orders_last_30d ?? '—' }}</span>
        </div>
      </section>

      <section class="panel">
        <div class="toolbar">
          <div class="tabs">
            <button
              v-for="tab in TABS"
              :key="tab.value"
              class="tab"
              :class="{ active: statusFilter === tab.value }"
              @click="setFilter(tab.value)"
            >
              {{ tab.label }}
            </button>
          </div>
          <input v-model="search" class="search" type="search" placeholder="Rechercher nom ou e-mail…" @input="onSearch" />
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Statut</th>
                <th>Fin d'essai</th>
                <th class="num">Utilisateurs</th>
                <th class="num">Tables</th>
                <th class="num">Commandes</th>
                <th>Inscrit le</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="empty">Chargement…</td>
              </tr>
              <tr v-else-if="!restaurants.length">
                <td colspan="8" class="empty">Aucun restaurant.</td>
              </tr>
              <tr v-for="r in restaurants" v-else :key="r.id">
                <td>
                  <div class="r-name">{{ r.name }}</div>
                  <div class="r-sub">{{ r.email }}<span v-if="r.phone"> · {{ r.phone }}</span></div>
                </td>
                <td>
                  <span class="badge" :class="badgeClass(r)">{{ statusLabel(r) }}</span>
                </td>
                <td>{{ r.status === 'trial' ? formatDate(r.trial_ends_at) : '—' }}</td>
                <td class="num">{{ r.users_count }}</td>
                <td class="num">{{ r.tables_count }}</td>
                <td class="num">{{ r.orders_count }}</td>
                <td>{{ formatDate(r.created_at) }}</td>
                <td class="actions">
                  <button v-if="r.status !== 'active'" class="btn btn-primary" :disabled="busy === r.id" @click="activate(r)">
                    Activer
                  </button>
                  <button v-if="r.status === 'trial'" class="btn" :disabled="busy === r.id" @click="extendTrial(r)">
                    +14 j d'essai
                  </button>
                  <button v-if="r.status !== 'suspended'" class="btn btn-danger" :disabled="busy === r.id" @click="suspend(r)">
                    Suspendre
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination.last_page > 1" class="pager">
          <button class="btn" :disabled="pagination.current_page <= 1" @click="load(pagination.current_page - 1)">Précédent</button>
          <span>Page {{ pagination.current_page }} / {{ pagination.last_page }}</span>
          <button class="btn" :disabled="pagination.current_page >= pagination.last_page" @click="load(pagination.current_page + 1)">Suivant</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { toast } from '@/composables/useNotif'
import { useAuthStore } from '@/stores/auth'

const TABS = [
  { value: '', label: 'Tous' },
  { value: 'trial', label: 'En essai' },
  { value: 'active', label: 'Actifs' },
  { value: 'suspended', label: 'Suspendus' },
]

const router = useRouter()
const authStore = useAuthStore()

const stats = ref({})
const restaurants = ref([])
const pagination = ref({ current_page: 1, last_page: 1 })
const loading = ref(false)
const busy = ref(null)
const statusFilter = ref('')
const search = ref('')
let searchTimer = null

const isExpired = (r) => r.status === 'trial' && r.trial_ends_at && new Date(r.trial_ends_at) < new Date()

const statusLabel = (r) => {
  if (isExpired(r)) return 'Essai expiré'
  return { active: 'Actif', trial: 'Essai', suspended: 'Suspendu' }[r.status] || r.status
}

const badgeClass = (r) => (isExpired(r) ? 'expired' : r.status)

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

async function loadStats() {
  try {
    stats.value = (await api.get('/platform/stats')).data
  } catch {
    // erreur déjà notifiée par l'intercepteur
  }
}

async function load(page = 1) {
  loading.value = true
  try {
    const { data } = await api.get('/platform/restaurants', {
      params: { page, status: statusFilter.value || undefined, search: search.value || undefined },
    })
    restaurants.value = data.data
    pagination.value = { current_page: data.current_page, last_page: data.last_page }
  } catch {
    restaurants.value = []
  } finally {
    loading.value = false
  }
}

function setFilter(value) {
  statusFilter.value = value
  load()
}

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => load(), 300)
}

async function update(r, payload, successMessage) {
  busy.value = r.id
  try {
    await api.patch(`/platform/restaurants/${r.id}`, payload)
    toast.success(successMessage)
    await Promise.all([load(pagination.value.current_page), loadStats()])
  } catch {
    // erreur déjà notifiée par l'intercepteur
  } finally {
    busy.value = null
  }
}

function activate(r) {
  if (!window.confirm(`Activer l'abonnement de « ${r.name} » ?\nÀ faire après réception du paiement.`)) return
  update(r, { status: 'active' }, `${r.name} activé`)
}

function suspend(r) {
  if (!window.confirm(`Suspendre « ${r.name} » ?\nTous ses utilisateurs perdront l'accès immédiatement.`)) return
  update(r, { status: 'suspended' }, `${r.name} suspendu`)
}

function extendTrial(r) {
  const base = isExpired(r) || !r.trial_ends_at ? new Date() : new Date(r.trial_ends_at)
  base.setDate(base.getDate() + 14)
  update(r, { trial_ends_at: base.toISOString() }, `Essai de ${r.name} prolongé`)
}

function logout() {
  api.post('/logout').catch(() => {})
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadStats()
  load()
})
</script>

<style scoped>
.platform {
  min-height: 100vh;
  background: #f6f6fa;
  font-family: 'DM Sans', -apple-system, sans-serif;
  color: #0f0f12;
}

.platform-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: white;
  border-bottom: 1px solid #e4e4ec;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-name {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.brand-name em {
  font-style: normal;
  color: #7c3aed;
}
.brand-tag {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6d28d9;
  background: #ede9fe;
  padding: 3px 8px;
  border-radius: 999px;
}
.header-user {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #3f3f4e;
}

.platform-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}
.stat-tile {
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat-tile.warn {
  border-color: #fcd34d;
  background: #fffbeb;
}
.stat-label {
  font-size: 12px;
  color: #6b6b7b;
}
.stat-value {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.panel {
  background: white;
  border: 1px solid #e4e4ec;
  border-radius: 12px;
  overflow: hidden;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e4ec;
}
.tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.tab {
  border: none;
  background: none;
  padding: 7px 12px;
  border-radius: 8px;
  font: inherit;
  font-size: 13px;
  color: #6b6b7b;
  cursor: pointer;
}
.tab.active {
  background: #f5f3ff;
  color: #6d28d9;
  font-weight: 600;
}
.search {
  min-width: 220px;
  flex: 0 1 280px;
  padding: 8px 12px;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  font: inherit;
  font-size: 13px;
  outline: none;
}
.search:focus {
  border-color: #7c3aed;
}

.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th {
  text-align: left;
  font-weight: 500;
  font-size: 12px;
  color: #6b6b7b;
  padding: 10px 16px;
  background: #fafafc;
  white-space: nowrap;
}
td {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f5;
  vertical-align: middle;
  white-space: nowrap;
}
.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.r-name {
  font-weight: 600;
}
.r-sub {
  font-size: 12px;
  color: #9b9bab;
}
.empty {
  text-align: center;
  color: #9b9bab;
  padding: 32px;
}

.badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.badge.active { background: #d1fae5; color: #065f46; }
.badge.trial { background: #ede9fe; color: #5b21b6; }
.badge.expired { background: #fef3c7; color: #92400e; }
.badge.suspended { background: #fee2e2; color: #991b1b; }

.actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}
.btn,
.btn-ghost {
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #e4e4ec;
  background: white;
  color: #3f3f4e;
  cursor: pointer;
  white-space: nowrap;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-primary {
  background: #7c3aed;
  border-color: #7c3aed;
  color: white;
}
.btn-danger {
  color: #b91c1c;
  border-color: #fecaca;
}
.btn-ghost {
  border-color: transparent;
}
.btn-ghost:hover {
  background: #f5f5fa;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  font-size: 13px;
  color: #6b6b7b;
  border-top: 1px solid #e4e4ec;
}
</style>
