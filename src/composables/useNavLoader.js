import { ref } from 'vue'

const loading = ref(false)
const progress = ref(0)

let timer = null
let doneTimer = null

export function useNavLoader() {
  const start = () => {
    clearTimeout(timer)
    clearTimeout(doneTimer)

    loading.value = true
    progress.value = 0

    // Monte rapidement à 20% puis ralentit jusqu'à 85%
    requestAnimationFrame(() => {
      progress.value = 20
      timer = setTimeout(() => { progress.value = 50 }, 100)
      timer = setTimeout(() => { progress.value = 70 }, 300)
      timer = setTimeout(() => { progress.value = 85 }, 600)
    })
  }

  const done = () => {
    clearTimeout(timer)
    progress.value = 100

    // Laisse la barre à 100% visible brièvement puis fade out
    doneTimer = setTimeout(() => {
      loading.value = false
      progress.value = 0
    }, 300)
  }

  return { loading, progress, start, done }
}
