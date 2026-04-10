<template>
  <div class="menu-layout">
    <header class="header">
      <h1>📝 Gestion du Menu</h1>
      <button @click="openCreateModal" class="btn-primary">
        + Nouveau plat
      </button>
    </header>

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

<script>
import api from '@/services/api'

export default {
  name: 'MenuView',
  data() {
    return {
      categories: [],
      items: [],
      selectedCategory: null,
      search: '',
      categoryModal: false,
      itemModal: false,
      editingCategory: null,
      editingItem: null,
      categoryForm: { name: '' },
      itemForm: { name: '', description: '', price: 0, category_id: null, preparation_time: 15 }
    }
  },
  computed: {
    filteredItems() {
      let result = this.items
      if (this.selectedCategory) {
        result = result.filter(i => i.category_id === this.selectedCategory)
      }
      if (this.search) {
        result = result.filter(i => i.name.toLowerCase().includes(this.search.toLowerCase()))
      }
      return result
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
    },
    getItemCount(categoryId) {
      return this.items.filter(i => i.category_id === categoryId).length
    },
    async loadData() {
      try {
        const res = await api.get('/menu')
        this.categories = res.data
        const allItems = []
        for (const cat of this.categories) {
          allItems.push(...cat.menu_items.map(item => ({ ...item, category_id: cat.id })))
        }
        this.items = allItems
        if (this.categories.length > 0 && !this.selectedCategory) {
          this.selectedCategory = this.categories[0].id
        }
      } catch (error) {
        console.error('Erreur chargement menu', error)
      }
    },
    openCategoryModal(cat = null) {
      this.editingCategory = cat
      this.categoryForm = cat ? { name: cat.name } : { name: '' }
      this.categoryModal = true
    },
    openCreateModal() {
      this.editingItem = null
      this.itemForm = { name: '', description: '', price: 0, category_id: this.selectedCategory, preparation_time: 15 }
      this.itemModal = true
    },
    openEditModal(item) {
      this.editingItem = item
      this.itemForm = { ...item }
      this.itemModal = true
    },
    closeModals() {
      this.categoryModal = false
      this.itemModal = false
      this.editingCategory = null
      this.editingItem = null
    },
    async saveCategory() {
      try {
        if (this.editingCategory) {
          await api.put(`/categories/${this.editingCategory.id}`, this.categoryForm)
        } else {
          await api.post('/categories', this.categoryForm)
        }
        await this.loadData()
        this.closeModals()
      } catch (error) {
        console.error('Erreur sauvegarde catégorie', error)
      }
    },
    async saveItem() {
      try {
        if (this.editingItem) {
          await api.put(`/menu/${this.editingItem.id}`, this.itemForm)
        } else {
          await api.post('/menu', this.itemForm)
        }
        await this.loadData()
        this.closeModals()
      } catch (error) {
        console.error('Erreur sauvegarde plat', error)
      }
    },
    async toggleAvailability(item) {
      try {
        await api.patch(`/menu/${item.id}/availability`, { is_available: !item.is_available })
        await this.loadData()
      } catch (error) {
        console.error('Erreur changement disponibilité', error)
      }
    },
    async deleteItem(id) {
      if (confirm('Supprimer ce plat ?')) {
        try {
          await api.delete(`/menu/${id}`)
          await this.loadData()
        } catch (error) {
          console.error('Erreur suppression', error)
        }
      }
    }
  }
}
</script>

<style scoped>
.menu-layout {
  min-height: 100vh;
  background: #f4f4f6;
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.header h1 {
  font-size: 22px;
  font-weight: 600;
  color: #0f0f12;
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
</style>