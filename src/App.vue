<template>
  <div class="app-container">
    <!-- Barre de progression navigation -->
    <div class="nav-progress-bar" :class="{ visible: navLoader.loading.value }" :style="{ width: navLoader.progress.value + '%' }"></div>

    <Sidebar v-if="showSidebar" />
    <div class="main-content" :class="{ 'full-width': !showSidebar }">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </div>
    <Notification />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Notification from '@/components/Notification.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { useNavLoader } from '@/composables/useNavLoader'

const route = useRoute()
const authStore = useAuthStore()
const navLoader = useNavLoader()

const showSidebar = computed(() => route.path !== '/login')

if (authStore.token && !authStore.user) {
  authStore.fetchMe()
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
  position: relative;
}

.main-content {
  flex: 1;
  min-width: 0;
}

/* ── Barre de progression navigation ── */
.nav-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
  z-index: 9999;
  width: 0%;
  opacity: 0;
  transition: width 0.25s ease, opacity 0.2s ease;
  box-shadow: 0 0 8px rgba(124, 58, 237, 0.6);
  pointer-events: none;
}

.nav-progress-bar.visible {
  opacity: 1;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Transition entre pages ── */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>