<template>
  <div class="kitchen-view">
    <header class="header">
      <h1>👨‍🍳 Écran Cuisine</h1>
      <router-link to="/" class="back-btn">← Retour</router-link>
    </header>
    <div class="kitchen-content">
      <p>Page en construction... 🚧</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KitchenView'
}
</script>

<style scoped>
.kitchen-view {
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
.kitchen-content {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}
</style>