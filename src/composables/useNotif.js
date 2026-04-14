import { ref } from 'vue'

export const notif = ref(null)
let timer = null

function show(type, message, opts = {}) {
  if (timer) clearTimeout(timer)
  notif.value = { type, message, description: opts.description || '' }
  timer = setTimeout(() => { notif.value = null }, opts.duration ?? 2800)
}

// Même API que vue-sonner pour ne changer que l'import dans les vues
export const toast = {
  success: (msg, opts) => show('success', msg, opts),
  error:   (msg, opts) => show('error',   msg, opts),
  warning: (msg, opts) => show('warning', msg, opts),
  info:    (msg, opts) => show('info',    msg, opts),
}
