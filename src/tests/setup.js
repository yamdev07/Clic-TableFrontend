import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, vi } from 'vitest'

// Pinia fresh instance avant chaque test
beforeEach(() => {
  setActivePinia(createPinia())
})

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem:    (key) => store[key] ?? null,
    setItem:    (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear:      () => { store = {} },
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock vue-sonner (toast) pour éviter les erreurs dans les tests
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error:   vi.fn(),
    info:    vi.fn(),
  },
  Toaster: { template: '<div />' },
}))
