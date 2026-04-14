<template>
  <div class="users-layout">
    <div class="topbar">
      <div>
        <h1 class="page-title">Utilisateurs</h1>
        <p class="page-sub">Gestion du personnel</p>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
        Nouvel utilisateur
      </button>
    </div>

    <!-- Role summary badges -->
    <div class="role-summary">
      <div v-for="role in roleSummary" :key="role.key" class="role-badge" :class="role.key">
        <span class="role-count">{{ role.count }}</span>
        <span class="role-name">{{ role.label }}</span>
      </div>
    </div>

    <!-- Users table -->
    <div class="users-card">
      <div class="users-table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Dernière connexion</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="loading-cell">Chargement...</td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6" class="empty-cell">Aucun utilisateur trouvé</td>
            </tr>
            <tr v-for="user in users" :key="user.id" :class="{ inactive: !user.is_active }">
              <td>
                <div class="user-cell">
                  <div class="user-avatar-sm" :class="'role-' + user.role">
                    {{ initials(user.name) }}
                  </div>
                  <div>
                    <span class="user-name-cell">{{ user.name }}</span>
                    <span v-if="user.id === authStore.user?.id" class="you-badge">Vous</span>
                  </div>
                </div>
              </td>
              <td class="email-cell">{{ user.email }}</td>
              <td>
                <span class="role-pill" :class="user.role">{{ ROLE_LABELS[user.role] }}</span>
              </td>
              <td>
                <span class="status-dot" :class="user.is_active ? 'active' : 'inactive'">
                  {{ user.is_active ? 'Actif' : 'Désactivé' }}
                </span>
              </td>
              <td class="date-cell">
                {{ user.last_login_at ? formatDate(user.last_login_at) : 'Jamais' }}
              </td>
              <td>
                <div class="actions-cell">
                  <button class="action-icon edit" @click="openEditModal(user)" title="Modifier">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                  </button>
                  <button
                    v-if="user.id !== authStore.user?.id"
                    class="action-icon"
                    :class="user.is_active ? 'deactivate' : 'activate'"
                    @click="toggleUser(user)"
                    :title="user.is_active ? 'Désactiver' : 'Réactiver'"
                  >
                    <svg v-if="user.is_active" width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
                      <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                    <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-card" @click.stop>
          <div class="modal-header">
            <div>
              <p class="modal-eyebrow">{{ editingUser ? 'Modifier' : 'Nouveau' }}</p>
              <h2 class="modal-title">{{ editingUser ? editingUser.name : 'Créer un utilisateur' }}</h2>
            </div>
            <button class="modal-close" @click="closeModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Nom complet</label>
              <input v-model="form.name" type="text" placeholder="Jean Dupont" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="jean@restaurant.com" :disabled="!!editingUser" />
            </div>
            <div class="form-group">
              <label>Rôle</label>
              <div class="role-selector">
                <button
                  v-for="role in roles"
                  :key="role.value"
                  class="role-option"
                  :class="{ active: form.role === role.value, ['role-' + role.value]: true }"
                  @click="form.role = role.value"
                >
                  <span class="role-opt-icon">{{ role.icon }}</span>
                  <span class="role-opt-label">{{ role.label }}</span>
                  <span class="role-opt-desc">{{ role.desc }}</span>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>{{ editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe' }}</label>
              <input v-model="form.password" type="password" :placeholder="editingUser ? 'Laisser vide pour garder l\'actuel' : 'Minimum 6 caractères'" />
            </div>
            <div v-if="formError" class="form-error">{{ formError }}</div>
          </div>

          <div class="modal-footer">
            <button class="action-btn ghost" @click="closeModal">Annuler</button>
            <button class="action-btn primary" :disabled="saving" @click="saveUser">
              {{ saving ? 'Enregistrement...' : editingUser ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()

const ROLE_LABELS = {
  admin:   'Administrateur',
  manager: 'Gérant',
  waiter:  'Serveur',
  kitchen: 'Cuisinier',
}

const roles = [
  { value: 'admin',   label: 'Administrateur', icon: '👑', desc: 'Accès complet' },
  { value: 'manager', label: 'Gérant',          icon: '📊', desc: 'Gestion & paiements' },
  { value: 'waiter',  label: 'Serveur',          icon: '🍽️', desc: 'Tables & commandes' },
  { value: 'kitchen', label: 'Cuisinier',        icon: '👨‍🍳', desc: 'Cuisine uniquement' },
]

const users = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingUser = ref(null)
const saving = ref(false)
const formError = ref('')

const form = ref({ name: '', email: '', role: 'waiter', password: '' })

const roleSummary = computed(() =>
  roles.map(r => ({
    key: r.value,
    label: r.label,
    count: users.value.filter(u => u.role === r.value && u.is_active).length,
  }))
)

const initials = (name) =>
  (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await api.get('/users')
    users.value = res.data
  } catch (err) {
    console.error('Erreur chargement utilisateurs', err)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingUser.value = null
  form.value = { name: '', email: '', role: 'waiter', password: '' }
  formError.value = ''
  showModal.value = true
}

const openEditModal = (user) => {
  editingUser.value = user
  form.value = { name: user.name, email: user.email, role: user.role, password: '' }
  formError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveUser = async () => {
  formError.value = ''
  if (!form.value.name.trim()) { formError.value = 'Le nom est requis'; return }
  if (!editingUser.value && !form.value.email.trim()) { formError.value = 'L\'email est requis'; return }
  if (!editingUser.value && !form.value.password) { formError.value = 'Le mot de passe est requis'; return }

  saving.value = true
  try {
    if (editingUser.value) {
      const data = { name: form.value.name, role: form.value.role }
      if (form.value.password) data.password = form.value.password
      await api.put(`/users/${editingUser.value.id}`, data)
    } else {
      await api.post('/users', form.value)
    }
    closeModal()
    await loadUsers()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Erreur lors de l\'enregistrement'
  } finally {
    saving.value = false
  }
}

const toggleUser = async (user) => {
  try {
    if (user.is_active) {
      await api.delete(`/users/${user.id}`)
    } else {
      await api.put(`/users/${user.id}`, { is_active: true })
    }
    await loadUsers()
  } catch (err) {
    console.error('Erreur activation/désactivation', err)
  }
}

onMounted(loadUsers)
</script>

<style scoped>

.users-layout {
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
  margin-bottom: 28px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #0f0f12;
  margin: 0 0 3px;
  letter-spacing: -0.03em;
}
.page-sub { font-size: 13px; color: #9b9bab; margin: 0; }

.btn-primary {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
  box-shadow: 0 4px 12px rgba(124,58,237,0.35);
}
.btn-primary:hover { opacity: 0.88; }

/* ── Role Summary ── */
.role-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.role-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e4e4ec;
  min-width: 130px;
}
.role-count { font-size: 22px; font-weight: 700; color: #0f0f12; line-height: 1; }
.role-name { font-size: 12px; color: #9b9bab; }

/* ── Users Table ── */
.users-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e4e4ec;
  overflow: hidden;
}
.users-table-wrapper { overflow-x: auto; }
.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}
.users-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9b9bab;
  background: #fafafa;
  border-bottom: 1px solid #e4e4ec;
}
.users-table td {
  padding: 13px 16px;
  border-bottom: 1px solid #f4f4f6;
  vertical-align: middle;
}
.users-table tr:last-child td { border-bottom: none; }
.users-table tr.inactive td { opacity: 0.5; }

.loading-cell, .empty-cell {
  text-align: center;
  padding: 48px;
  color: #c5c5d0;
}

.user-cell { display: flex; align-items: center; gap: 10px; }
.user-avatar-sm {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-avatar-sm.role-kitchen { background: linear-gradient(135deg, #f59e0b, #d97706); }
.user-avatar-sm.role-waiter  { background: linear-gradient(135deg, #10b981, #059669); }
.user-avatar-sm.role-manager { background: linear-gradient(135deg, #3b82f6, #2563eb); }

.user-name-cell { font-weight: 500; color: #0f0f12; }
.you-badge {
  display: inline-block;
  margin-left: 6px;
  font-size: 10px;
  background: rgba(124,58,237,0.1);
  color: #7c3aed;
  padding: 1px 7px;
  border-radius: 12px;
  font-weight: 500;
}
.email-cell { color: #6b6b7b; }
.date-cell { color: #9b9bab; font-size: 12.5px; }

.role-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 500;
}
.role-pill.admin   { background: rgba(124,58,237,0.1); color: #7c3aed; }
.role-pill.manager { background: rgba(59,130,246,0.1);  color: #2563eb; }
.role-pill.waiter  { background: rgba(16,185,129,0.1);  color: #059669; }
.role-pill.kitchen { background: rgba(245,158,11,0.1);  color: #d97706; }

.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}
.status-dot::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.status-dot.active::before  { background: #10b981; }
.status-dot.inactive::before { background: #f56565; }
.status-dot.active { color: #059669; }
.status-dot.inactive { color: #dc2626; }

.actions-cell { display: flex; gap: 6px; }
.action-icon {
  width: 30px;
  height: 30px;
  border: 1px solid #e4e4ec;
  background: none;
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  color: #9b9bab;
}
.action-icon.edit:hover { border-color: #c4b5fd; color: #7c3aed; background: #f5f3ff; }
.action-icon.deactivate:hover { border-color: #fca5a5; color: #dc2626; background: #fff5f5; }
.action-icon.activate:hover { border-color: #6ee7b7; color: #059669; background: #f0fdf4; }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e4e4ec;
}
.modal-eyebrow {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9b9bab;
  margin: 0 0 4px;
}
.modal-title { font-size: 18px; font-weight: 600; color: #0f0f12; margin: 0; }
.modal-close {
  background: none; border: none; cursor: pointer;
  color: #9b9bab; padding: 4px; border-radius: 6px;
  display: flex; align-items: center;
}
.modal-close:hover { background: #f0f0f5; color: #3f3f4e; }
.modal-body { padding: 20px 24px; }

.form-group { margin-bottom: 18px; }
.form-group label {
  display: block;
  font-size: 11.5px;
  font-weight: 600;
  color: #6b6b7b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.form-group input:focus { border-color: #a78bfa; }
.form-group input:disabled { background: #fafafa; color: #9b9bab; }

.role-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.role-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  background: #fafafa;
  border: 1.5px solid #e4e4ec;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}
.role-option:hover { border-color: #c4b5fd; background: #f5f3ff; }
.role-option.active { border-color: #7c3aed; background: rgba(124,58,237,0.06); }
.role-option.active.role-kitchen { border-color: #f59e0b; background: rgba(245,158,11,0.06); }
.role-option.active.role-waiter  { border-color: #10b981; background: rgba(16,185,129,0.06); }
.role-option.active.role-manager { border-color: #3b82f6; background: rgba(59,130,246,0.06); }
.role-opt-icon { font-size: 18px; line-height: 1; }
.role-opt-label { font-size: 12.5px; font-weight: 600; color: #0f0f12; }
.role-opt-desc { font-size: 11px; color: #9b9bab; }

.form-error {
  margin-top: 12px;
  padding: 10px 14px;
  background: #fff5f5;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #e4e4ec;
}
.action-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn.ghost {
  background: none;
  border: 1px solid #e4e4ec;
  color: #6b6b7b;
}
.action-btn.ghost:hover { background: #f4f4f6; }
.action-btn.primary {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(124,58,237,0.3);
}
.action-btn.primary:hover:not(:disabled) { opacity: 0.88; }
.action-btn.primary:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Transitions ── */
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97); }

@media (max-width: 768px) {
  .users-layout { padding: 20px 16px; }
  .role-selector { grid-template-columns: 1fr; }
}
</style>
