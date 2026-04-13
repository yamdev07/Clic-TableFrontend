<template>
  <div class="app-container">
    <Sidebar v-if="showSidebar" />
    <div class="main-content" :class="{ 'full-width': !showSidebar }">
      <router-view />
    </div>
    <Toaster position="top-right" richColors />
  </div>
</template>

<script>
import { Toaster } from 'vue-sonner'
import Sidebar from '@/components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'App',
  components: {
    Toaster,
    Sidebar
  },
  computed: {
    showSidebar() {
      return this.$route.path !== '/login'
    }
  },
  async created() {
    const authStore = useAuthStore()
    if (authStore.token && !authStore.user) {
      await authStore.fetchMe()
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.main-content.full-width {
  flex: 1;
}
</style>