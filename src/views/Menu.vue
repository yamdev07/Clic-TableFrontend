<template>
  <div class="dash">

    <!-- Sidebar -->
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
        <router-link to="/" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span>Tableau de bord</span>
        </router-link>
        <router-link to="/tables" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 18h18M6 6v12M18 6v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Tables</span>
        </router-link>
        <router-link to="/orders" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="1.5"/>
            <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Commandes</span>
        </router-link>
        <router-link to="/menu" class="nav-item active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Menu</span>
        </router-link>
        <router-link v-if="authStore.isKitchen" to="/kitchen" class="nav-item">
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

    <!-- Main content -->
    <main class="main">
      <div class="menu-layout">
        <div class="topbar">
          <div>
            <h1 class="page-title">Gestion du Menu</h1>
            <p class="page-sub">Gérez vos plats et catégories</p>
          </div>
          <button @click="openCreateModal" class="btn-primary">
            + Nouveau plat
          </button>
        </div>

        <!-- Catégories -->
        <div class="categories-section">
          <div class="categories-header">
            <h2>Catégories</h2>
            <button @click="openCategoryModal" class="btn-outline">
              + Ajouter une catégorie
            </button>
          </div>
          <div class="categories-list">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectedCategory = cat.id"
              :class="{ active: selectedCategory === cat.id }"
              class="category-chip"
            >
              {{ cat.name }}
              <span class="category-count">{{ getItemCount(cat.id) }}</span>
            </button>
          </div>
        </div>

        <!-- Menu Items -->
        <div class="items-section">
          <div class="items-header">
            <h2>Plats</h2>
            <div class="search-bar">
              <input type="text" v-model="search" placeholder="Rechercher un plat..." />
            </div>
          </div>

          <div class="items-grid">
            <div v-for="item in filteredItems" :key="item.id" class="menu-card">
              <div class="menu-card-image">
                <div class="menu-icon">🍽️</div>
              </div>
              <div class="menu-card-body">
                <div class="menu-card-header">
                  <h3>{{ item.name }}</h3>
                  <span class="price">{{ formatMoney(item.price) }}</span>
                </div>
                <p class="description">{{ item.description || 'Aucune description' }}</p>
                <div class="menu-card-footer">
                  <span class="time-badge">⏱️ {{ item.preparation_time || 15 }} min</span>
                  <div class="actions">
                    <button @click="toggleAvailability(item)" class="icon-btn" :title="item.is_available ? 'Disponible' : 'Indisponible'">
                      {{ item.is_available ? '🟢' : '🔴' }}
                    </button>
                    <button @click="openEditModal(item)" class="icon-btn">✏️</button>
                    <button @click="deleteItem(item.id)" class="icon-btn danger">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="filteredItems.length === 0" class="empty-state">
              <p>Aucun plat trouvé</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Catégorie -->
    <div v-if="categoryModal" class="modal" @click.self="closeModals">
      <div class="modal-content">
        <h2>{{ editingCategory ? 'Modifier' : 'Nouvelle' }} catégorie</h2>
        <input type="text" v-model="categoryForm.name" placeholder="Nom de la catégorie" />
        <div class="modal-actions">
          <button @click="saveCategory" class="btn-primary">Enregistrer</button>
          <button @click="closeModals" class="btn-secondary">Annuler</button>
        </div>
      </div>
    </div>

    <!-- Modal Plat -->
    <div v-if="itemModal" class="modal" @click.self="closeModals">
      <div class="modal-content">
        <h2>{{ editingItem ? 'Modifier' : 'Nouveau' }} plat</h2>
        <input type="text" v-model="itemForm.name" placeholder="Nom du plat" />
        <textarea v-model="itemForm.description" placeholder="Description" rows="3"></textarea>
        <input type="number" v-model="itemForm.price" placeholder="Prix (FCFA)" />
        <select v-model="itemForm.category_id">
          <option :value="null">Sélectionner une catégorie</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <input type="number" v-model="itemForm.preparation_time" placeholder="Temps de préparation (min)" />
        <div class="modal-actions">
          <button @click="saveItem" class="btn-primary">Enregistrer</button>
          <button @click="closeModals" class="btn-secondary">Annuler</button>
        </div>
      </div>
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

// Menu data
const categories = ref([])
const items = ref([])
const selectedCategory = ref(null)
const search = ref('')
const categoryModal = ref(false)
const itemModal = ref(false)
const editingCategory = ref(null)
const editingItem = ref(null)
const categoryForm = ref({ name: '' })
const itemForm = ref({ name: '', description: '', price: 0, category_id: null, preparation_time: 15 })

const initials = computed(() => {
  return (authStore.userName || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const filteredItems = computed(() => {
  let result = items.value
  if (selectedCategory.value) {
    result = result.filter(i => i.category_id === selectedCategory.value)
  }
  if (search.value) {
    result = result.filter(i => i.name.toLowerCase().includes(search.value.toLowerCase()))
  }
  return result
})

const formatMoney = (amount) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

const getItemCount = (categoryId) => {
  return items.value.filter(i => i.category_id === categoryId).length
}

const loadData = async () => {
  try {
    const res = await api.get('/menu')
    categories.value = res.data
    const allItems = []
    for (const cat of categories.value) {
      allItems.push(...cat.menu_items.map(item => ({ ...item, category_id: cat.id })))
    }
    items.value = allItems
    if (categories.value.length > 0 && !selectedCategory.value) {
      selectedCategory.value = categories.value[0].id
    }
  } catch (error) {
    console.error('Erreur chargement menu', error)
  }
}

const openCategoryModal = (cat = null) => {
  editingCategory.value = cat
  categoryForm.value = cat ? { name: cat.name } : { name: '' }
  categoryModal.value = true
}

const openCreateModal = () => {
  editingItem.value = null
  itemForm.value = { name: '', description: '', price: 0, category_id: selectedCategory.value, preparation_time: 15 }
  itemModal.value = true
}

const openEditModal = (item) => {
  editingItem.value = item
  itemForm.value = { ...item }
  itemModal.value = true
}

const closeModals = () => {
  categoryModal.value = false
  itemModal.value = false
  editingCategory.value = null
  editingItem.value = null
}

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      await api.put(`/categories/${editingCategory.value.id}`, categoryForm.value)
    } else {
      await api.post('/categories', categoryForm.value)
    }
    await loadData()
    closeModals()
  } catch (error) {
    console.error('Erreur sauvegarde catégorie', error)
  }
}

const saveItem = async () => {
  try {
    if (editingItem.value) {
      await api.put(`/menu/${editingItem.value.id}`, itemForm.value)
    } else {
      await api.post('/menu', itemForm.value)
    }
    await loadData()
    closeModals()
  } catch (error) {
    console.error('Erreur sauvegarde plat', error)
  }
}

const toggleAvailability = async (item) => {
  try {
    await api.patch(`/menu/${item.id}/availability`, { is_available: !item.is_available })
    await loadData()
  } catch (error) {
    console.error('Erreur changement disponibilité', error)
  }
}

const deleteItem = async (id) => {
  if (confirm('Supprimer ce plat ?')) {
    try {
      await api.delete(`/menu/${id}`)
      await loadData()
    } catch (error) {
      console.error('Erreur suppression', error)
    }
  }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

.dash {
  display: flex;
  min-height: 100vh;
  background: #f4f4f6;
  font-family: 'DM Sans', sans-serif;
  color: #0f0f12;
}

/* Sidebar */
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

.nav-item.active {
  background: rgba(124,58,237,0.18);
  color: #c4b5fd;
}

.nav-item span:first-of-type {
  flex: 1;
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

/* Main */
.main {
  flex: 1;
  min-width: 0;
  padding: 32px 36px;
}

.menu-layout {
  max-width: 1400px;
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

.page-sub {
  font-size: 13px;
  color: #9b9bab;
  margin: 0;
}

.btn-primary {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #6d28d9;
}

.btn-outline {
  background: white;
  border: 1px solid #e4e4ec;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  border-color: #7c3aed;
  color: #7c3aed;
}

.btn-secondary {
  background: #e4e4ec;
  color: #3f3f4e;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.categories-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e4e4ec;
}

.categories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.categories-header h2 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-chip {
  background: #f4f4f6;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-chip.active {
  background: #7c3aed;
  color: white;
}

.category-count {
  background: rgba(0,0,0,0.1);
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
}

.category-chip.active .category-count {
  background: rgba(255,255,255,0.2);
}

.items-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e4e4ec;
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.items-header h2 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.search-bar input {
  padding: 8px 12px;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  width: 220px;
  font-size: 13px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.menu-card {
  border: 1px solid #e4e4ec;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.menu-card:hover {
  border-color: #c4b5fd;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.menu-card-image {
  height: 100px;
  background: #f4f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon {
  font-size: 40px;
}

.menu-card-body {
  padding: 16px;
}

.menu-card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.menu-card-header h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.price {
  font-weight: 600;
  color: #7c3aed;
  font-size: 14px;
}

.description {
  font-size: 12px;
  color: #9b9bab;
  margin-bottom: 12px;
  line-height: 1.4;
}

.menu-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-badge {
  font-size: 11px;
  color: #9b9bab;
  background: #f4f4f6;
  padding: 4px 8px;
  border-radius: 12px;
}

.actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #f4f4f6;
}

.icon-btn.danger:hover {
  background: #fee2e2;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #c5c5d0;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 450px;
}

.modal-content h2 {
  font-size: 18px;
  margin-bottom: 20px;
}

.modal-content input,
.modal-content textarea,
.modal-content select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e4e4ec;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 900px) {
  .sidebar { display: none; }
  .main { padding: 20px 16px; }
}
</style>