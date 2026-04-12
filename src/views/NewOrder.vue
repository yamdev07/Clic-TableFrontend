<template>
  <div class="new-order-page">
    <div class="order-header">
      <div class="order-header-left">
        <h1>🆕 Nouvelle commande</h1>
        <div class="table-badge">
          <span class="table-icon">🍽️</span>
          <span class="table-number">Table {{ table?.number }}</span>
          <span class="table-capacity">{{ table?.capacity }} personnes</span>
        </div>
      </div>
      <div class="order-header-actions">
        <button @click="confirmOrder" :disabled="cart.length === 0" class="confirm-btn">
          <span>✅</span>
          <span>Valider</span>
          <span class="total-amount">{{ formatMoney(total) }}</span>
        </button>
      </div>
    </div>

    <div class="order-container">
      <!-- Menu Section -->
      <div class="menu-section">
        <div class="category-tabs">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            :class="{ active: selectedCategory === cat.id }"
            class="category-tab"
          >
            <span class="category-icon">{{ getCategoryIcon(cat.name) }}</span>
            {{ cat.name }}
          </button>
        </div>

        <div class="items-grid">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="menu-item"
            :class="{ unavailable: !item.is_available }"
            @click="item.is_available && addToCart(item)"
          >
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-description">{{ item.description || 'Plat délicieux' }}</p>
              <div class="item-footer">
                <span class="item-price">{{ formatMoney(item.price) }}</span>
                <span v-if="item.preparation_time" class="prep-time">⏱️ {{ item.preparation_time }} min</span>
              </div>
            </div>
            <button class="add-btn" :disabled="!item.is_available">+</button>
          </div>
          <div v-if="filteredItems.length === 0" class="empty-items">
            <span>📭</span>
            <p>Aucun plat dans cette catégorie</p>
          </div>
        </div>
      </div>

      <!-- Cart Section -->
      <div class="cart-section">
        <div class="cart-header">
          <h2>🛒 Votre commande</h2>
          <span class="cart-count">{{ cart.length }} article{{ cart.length !== 1 ? 's' : '' }}</span>
        </div>

        <div v-if="cart.length === 0" class="empty-cart">
          <span>🛍️</span>
          <p>Votre panier est vide</p>
          <small>Cliquez sur un plat pour l'ajouter</small>
        </div>

        <div v-else class="cart-items">
          <div v-for="(item, index) in cart" :key="index" class="cart-item">
            <div class="cart-item-info">
              <h4>{{ item.name }}</h4>
              <div class="cart-item-price">
                {{ formatMoney(item.price) }} x {{ item.quantity }}
              </div>
            </div>
            <div class="cart-item-actions">
              <button @click="decrementQuantity(index)" class="qty-btn">-</button>
              <span class="qty">{{ item.quantity }}</span>
              <button @click="incrementQuantity(index)" class="qty-btn">+</button>
              <button @click="removeItem(index)" class="remove-btn">🗑️</button>
            </div>
            <div class="cart-item-total">
              {{ formatMoney(item.price * item.quantity) }}
            </div>
          </div>

          <div class="cart-summary">
            <div class="summary-line">
              <span>Sous-total</span>
              <span>{{ formatMoney(subtotal) }}</span>
            </div>
            <div class="summary-line">
              <span>TVA (18%)</span>
              <span>{{ formatMoney(tax) }}</span>
            </div>
            <div class="summary-line">
              <span>Service (5%)</span>
              <span>{{ formatMoney(service) }}</span>
            </div>
            <div class="summary-line total">
              <span>TOTAL</span>
              <span class="total-amount">{{ formatMoney(total) }}</span>
            </div>
          </div>

          <button @click="confirmOrder" class="checkout-btn">
            ✅ Confirmer la commande
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { toast } from 'vue-sonner'

export default {
  setup() {
    const router = useRouter()

    const table = ref(null)
    const categories = ref([])
    const allItems = ref([])
    const cart = ref([])
    const selectedCategory = ref(null)

    const filteredItems = computed(() => {
      if (!selectedCategory.value) return []
      return allItems.value.filter(item => item.category_id === selectedCategory.value && item.is_available)
    })

    const subtotal = computed(() => {
      return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })

    const tax = computed(() => {
      return Math.floor(subtotal.value * 0.18)
    })

    const service = computed(() => {
      return Math.floor(subtotal.value * 0.05)
    })

    const total = computed(() => {
      return subtotal.value + tax.value + service.value
    })

    const formatMoney = (amount) => {
      return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
    }

    const getCategoryIcon = (categoryName) => {
      const icons = {
        'Entrées': '🥗',
        'Plats Principaux': '🍲',
        'Grillades': '🥩',
        'Desserts': '🍰',
        'Boissons': '🥤'
      }
      return icons[categoryName] || '🍽️'
    }

    const loadMenu = async () => {
      try {
        const res = await api.get('/menu')
        categories.value = res.data
        allItems.value = []
        for (const cat of categories.value) {
          if (cat.menu_items) {
            for (const item of cat.menu_items) {
              allItems.value.push({
                ...item,
                category_id: cat.id
              })
            }
          }
        }
        if (categories.value.length > 0) {
          selectedCategory.value = categories.value[0].id
        }
      } catch (error) {
        console.error('Erreur chargement menu:', error)
      }
    }

    const addToCart = (item) => {
      const existing = cart.value.find(i => i.id === item.id)
      if (existing) {
        existing.quantity++
      } else {
        cart.value.push({ ...item, quantity: 1 })
      }
    }

    const incrementQuantity = (index) => {
      cart.value[index].quantity++
    }

    const decrementQuantity = (index) => {
      if (cart.value[index].quantity > 1) {
        cart.value[index].quantity--
      } else {
        cart.value.splice(index, 1)
      }
    }

    const removeItem = (index) => {
      cart.value.splice(index, 1)
    }

    const confirmOrder = async () => {
      if (cart.value.length === 0) {
        toast.error('Panier vide', {
          description: 'Ajoutez des articles avant de valider',
          duration: 3000,
        })
        return
      }
      
      try {
        console.log('📝 Création commande pour table:', table.value.id)
        
        const orderResponse = await api.post('/orders', { table_id: table.value.id })
        console.log('📦 Réponse brute:', orderResponse.data)
        
        const orderId = orderResponse.data.data?.id || orderResponse.data.id
        console.log('✅ Order ID récupéré:', orderId)
        
        if (!orderId) {
          throw new Error('Impossible de récupérer l\'ID de la commande')
        }
        
        for (const item of cart.value) {
          console.log(`➕ Ajout: ${item.name} x${item.quantity}`)
          await api.post(`/orders/${orderId}/items`, {
            menu_item_id: item.id,
            quantity: item.quantity
          })
        }
        
        console.log('👨‍🍳 Envoi en cuisine...')
        await api.post(`/orders/${orderId}/send-to-kitchen`)
        
        console.log('🎉 Commande terminée !')
        
        toast.success('Commande créée avec succès !', {
          description: `Table ${table.value.number} - Total ${formatMoney(total.value)} - ${cart.value.length} article(s)`,
          duration: 4000,
          action: {
            label: 'Voir les commandes',
            onClick: () => router.push('/orders')
          }
        })
        
        setTimeout(() => {
          router.push('/tables')
        }, 1500)
        
      } catch (error) {
        console.error('❌ ERREUR:', error)
        console.error('📋 Détails:', error.response?.data)
        
        toast.error('Erreur lors de la création', {
          description: error.response?.data?.message || error.message,
          duration: 4000,
        })
      }
    }

    onMounted(async () => {
      const tableId = router.currentRoute.value.params.tableId
      try {
        const tables = await api.get('/tables')
        table.value = tables.data.find(t => t.id === tableId)
        await loadMenu()
      } catch (error) {
        console.error('Erreur chargement:', error)
      }
    })

    return {
      table,
      categories,
      allItems,
      cart,
      selectedCategory,
      filteredItems,
      subtotal,
      tax,
      service,
      total,
      formatMoney,
      getCategoryIcon,
      addToCart,
      incrementQuantity,
      decrementQuantity,
      removeItem,
      confirmOrder
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

.new-order-page {
  min-height: 100vh;
  background: #f4f4f6;
  font-family: 'DM Sans', sans-serif;
  padding: 24px 32px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.order-header-left h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a1a2e;
}

.table-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 8px 20px;
  border-radius: 40px;
  width: fit-content;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.table-icon {
  font-size: 16px;
}

.table-number {
  font-weight: 600;
  color: #7c3aed;
}

.table-capacity {
  font-size: 12px;
  color: #6b7280;
}

.order-header-actions {
  display: flex;
  gap: 16px;
}

.confirm-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16,185,129,0.3);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.total-amount {
  font-size: 16px;
  font-weight: 700;
}

.order-container {
  display: flex;
  gap: 24px;
  height: calc(100vh - 140px);
}

.menu-section {
  flex: 2;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.category-tabs {
  display: flex;
  gap: 8px;
  padding: 20px 20px 0 20px;
  border-bottom: 2px solid #f0f0f5;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: none;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.3s;
}

.category-tab:hover {
  background: #f3f4f6;
  color: #374151;
}

.category-tab.active {
  background: #7c3aed;
  color: white;
}

.category-icon {
  font-size: 16px;
}

.items-grid {
  padding: 20px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #faf9ff;
  border: 1px solid #e9e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-item:hover:not(.unavailable) {
  transform: translateY(-2px);
  border-color: #7c3aed;
  box-shadow: 0 8px 20px rgba(124,58,237,0.1);
}

.menu-item.unavailable {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  margin: 0 0 4px 0;
  font-size: 15px;
  color: #1f2937;
}

.item-description {
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 8px 0;
}

.item-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-price {
  font-weight: 700;
  color: #10b981;
  font-size: 14px;
}

.prep-time {
  font-size: 11px;
  color: #9ca3af;
}

.add-btn {
  width: 36px;
  height: 36px;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-btn:hover:not(:disabled) {
  background: #6d28d9;
  transform: scale(1.05);
}

.add-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.cart-section {
  flex: 1;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #f0f0f5;
}

.cart-header h2 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.cart-count {
  background: #7c3aed;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f5;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #1f2937;
}

.cart-item-price {
  font-size: 12px;
  color: #9ca3af;
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 12px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.qty-btn:hover {
  background: #e5e7eb;
}

.qty {
  min-width: 30px;
  text-align: center;
  font-weight: 500;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  transition: all 0.2s;
  border-radius: 8px;
}

.remove-btn:hover {
  background: #fee2e2;
}

.cart-item-total {
  font-weight: 600;
  min-width: 80px;
  text-align: right;
  color: #10b981;
}

.cart-summary {
  background: #faf9ff;
  border-radius: 16px;
  padding: 16px;
  margin-top: 16px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.summary-line.total {
  font-weight: 700;
  font-size: 16px;
  border-top: 1px solid #e5e7eb;
  margin-top: 8px;
  padding-top: 12px;
  color: #1f2937;
}

.total-amount {
  color: #10b981;
  font-weight: 700;
}

.checkout-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.3s;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16,185,129,0.3);
}

.empty-cart, .empty-items {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-cart span, .empty-items span {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.empty-cart p, .empty-items p {
  margin: 0;
  font-size: 16px;
}

.empty-cart small {
  font-size: 12px;
  display: block;
  margin-top: 8px;
}

@media (max-width: 900px) {
  .new-order-page {
    padding: 20px 16px;
  }
  .order-container {
    flex-direction: column;
    height: auto;
  }
  .order-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  .confirm-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>