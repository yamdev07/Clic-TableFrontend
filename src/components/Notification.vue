<template>
  <Transition name="notif">
    <div v-if="notif" class="notif-backdrop" @click="notif = null">
      <div class="notif-box" :class="notif.type" @click.stop>
        <div class="notif-icon-wrap">
          <svg v-if="notif.type === 'success'" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="currentColor" opacity=".15"/>
            <path d="M7 12.5l3.5 3.5 6.5-7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="notif.type === 'error'" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="currentColor" opacity=".15"/>
            <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="notif.type === 'warning'" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="currentColor" opacity=".15"/>
            <path d="M12 8v5M12 16.5v.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="currentColor" opacity=".15"/>
            <path d="M12 8v4M12 15.5v.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="notif-content">
          <p class="notif-message">{{ notif.message }}</p>
          <p v-if="notif.description" class="notif-desc">{{ notif.description }}</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { notif } from '@/composables/useNotif'
</script>

<style scoped>
.notif-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: all;
}

.notif-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 28px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.08);
  min-width: 280px;
  max-width: 400px;
  pointer-events: all;
}

/* Couleurs par type */
.notif-box.success { border-top: 4px solid #10b981; }
.notif-box.success .notif-icon-wrap { color: #10b981; }

.notif-box.error   { border-top: 4px solid #ef4444; }
.notif-box.error   .notif-icon-wrap { color: #ef4444; }

.notif-box.warning { border-top: 4px solid #f59e0b; }
.notif-box.warning .notif-icon-wrap { color: #f59e0b; }

.notif-box.info    { border-top: 4px solid #3b82f6; }
.notif-box.info    .notif-icon-wrap { color: #3b82f6; }

.notif-icon-wrap {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
}

.notif-icon-wrap svg {
  width: 100%;
  height: 100%;
}

.notif-content {
  flex: 1;
}

.notif-message {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
}

.notif-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

/* Animation */
.notif-enter-active {
  animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.notif-leave-active {
  animation: popOut 0.2s ease-in forwards;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.75); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes popOut {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.85); }
}
</style>
