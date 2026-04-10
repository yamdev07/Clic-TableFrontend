<template>
  <div class="order-layout">
    <header class="header">
      <h1>🆕 Nouvelle commande - Table {{ table?.number }}</h1>
      <div class="header-actions">
        <button @click="confirmOrder" :disabled="cart.length === 0" class="confirm-btn">
          ✅ Valider la commande ({{ total }} FCFA)
        </button>
        <router-link to="/tables" class="back-btn">← Retour</router-link>
      </div>
    </header>

    <div class="order-container">
      <!-- Menu -->
      <div class="menu-section">
        <div class="category-tabs">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            :class="{ active: selectedCategory === cat.id }"
            class="category-tab"
          >
            {{ cat.name }}
          </button>
        </div>

        <div class="items-grid">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="menu-item"
            @click="addToCart(item)"
          >
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-price">{{ formatMoney(item.price) }}</p>
            </div>
            <button class="add-btn">+</button>
          </div>
        </div>
      </div>

      <!-- Panier -->
      <div class="cart-section">
        <h2>🛒 Panier</h2>
        <div v-if="cart.length === 0" class="empty-cart">
          <p>Cliquez sur un plat pour l'ajouter</p>
        </div>
        <div v-else>
          <div v-for="(item, index) in cart" :key="index" class="cart-item">
            <div class="cart-item-info">
              <h4>{{ item.name }}</h4>
              <p>{{ formatMoney(item.price) }} x {{ item.quantity }}</p>
            </div>
            <div class="cart-item-actions">
              <button @click="decrementQuantity(index)" class="qty-btn">-</button>
              <span class="qty">{{ item.quantity }}</span>
              <button @click="incrementQuantity(index)" class="qty-btn">+</button>
              <button @click="removeItem(index)" class="remove-btn">🗑️</button>
            </div>
            <div class="cart-item-total">{{ formatMoney(item.price * item.quantity) }}</div>
          </div>
          <div class="cart-summary">
            <div class="summary-line"><span>Sous-total</span><span>{{ formatMoney(subtotal) }}</span></div>
            <div class="summary-line"><span>TVA 18%</span><span>{{ formatMoney(tax) }}</span></div>
            <div class="summary-line"><span>Service 5%</span><span>{{ formatMoney(service) }}</span></div>
            <div class="summary-line total"><span>TOTAL</span><span>{{ formatMoney(total) }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  data() {
    return {
      table: null,
      categories: [],
      allItems: [],
      cart: [],
      selectedCategory: null
    }
  },
  computed: {
    filteredItems() {
      if (!this.selectedCategory) return []
      return this.allItems.filter(item => item.category_id === this.selectedCategory && item.is_available)
    },
    subtotal() {
      return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    },
    tax() {
      return Math.floor(this.subtotal * 0.18)
    },
    service() {
      return Math.floor(this.subtotal * 0.05)
    },
    total() {
      return this.subtotal + this.tax + this.service
    }
  },
  async mounted() {
    const tableId = this.$route.params.tableId
    const tables = await api.get('/tables')
    this.table = tables.data.find(t => t.id === tableId)
    await this.loadMenu()
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
    },
    async loadMenu() {
      const res = await api.get('/menu')
      this.categories = res.data
      for (const cat of this.categories) {
        this.allItems.push(...cat.menu_items)
      }
      if (this.categories.length) this.selectedCategory = this.categories[0].id
    },
    addToCart(item) {
      const existing = this.cart.find(i => i.id === item.id)
      if (existing) existing.quantity++
      else this.cart.push({ ...item, quantity: 1 })
    },
    incrementQuantity(index) { this.cart[index].quantity++ },
    decrementQuantity(index) {
      if (this.cart[index].quantity > 1) this.cart[index].quantity--
      else this.cart.splice(index, 1)
    },
    removeItem(index) { this.cart.splice(index, 1) },
    async confirmOrder() {
      const order = await api.post('/orders', { table_id: this.table.id })
      for (const item of this.cart) {
        await api.post(`/orders/${order.data.id}/items`, {
          menu_item_id: item.id,
          quantity: item.quantity
        })
      }
      await api.post(`/orders/${order.data.id}/send-to-kitchen`)
      this.$router.push('/tables')
    }
  }
}
</script>

<style scoped>
.order-layout { min-height: 100vh; background: #f7fafc; }
.header { background: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.order-container { display: flex; gap: 24px; padding: 24px; height: calc(100vh - 80px); }
.menu-section { flex: 2; background: white; border-radius: 12px; padding: 20px; overflow: auto; }
.cart-section { flex: 1; background: white; border-radius: 12px; padding: 20px; overflow: auto; }
.category-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.category-tab { padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer; background: #edf2f7; }
.category-tab.active { background: #4299e1; color: white; }
.items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; }
.menu-item:hover { background: #f7fafc; border-color: #4299e1; }
.item-price { color: #48bb78; font-weight: bold; }
.add-btn { background: #4299e1; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 20px; }
.cart-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #e2e8f0; }
.cart-item-actions { display: flex; align-items: center; gap: 8px; }
.qty-btn { width: 28px; height: 28px; border: 1px solid #cbd5e0; background: white; border-radius: 6px; cursor: pointer; }
.qty { min-width: 30px; text-align: center; }
.remove-btn { background: none; border: none; cursor: pointer; font-size: 18px; }
.cart-item-total { font-weight: bold; min-width: 80px; text-align: right; }
.cart-summary { margin-top: 20px; padding-top: 16px; border-top: 2px solid #e2e8f0; }
.summary-line { display: flex; justify-content: space-between; padding: 8px 0; }
.summary-line.total { font-weight: bold; font-size: 18px; border-top: 1px solid #cbd5e0; margin-top: 8px; padding-top: 12px; }
.confirm-btn { padding: 12px 24px; background: #48bb78; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
.back-btn { padding: 8px 16px; background: #718096; color: white; text-decoration: none; border-radius: 8px; }
.empty-cart { text-align: center; color: #718096; padding: 40px; }
</style>