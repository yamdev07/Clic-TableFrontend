<template>
  <div class="new-order-view">
    <header class="header">
      <h1>🆕 Nouvelle Commande</h1>
      <router-link to="/" class="back-btn">← Retour</router-link>
    </header>
    <div class="order-content">
      <p>Page en construction... 🚧</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewOrderView'
}
</script>

<style scoped>
.new-order-view {
  min-height: 100vh;
  background: #f7fafc;
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.back-btn {
  background: #667eea;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
}
.order-content {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}
</style>