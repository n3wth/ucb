import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Vitest 4's jsdom environment exposes a `window.localStorage` object that
// lacks the Storage API methods (getItem/setItem/removeItem/clear). Install
// a minimal in-memory shim so code under test can exercise the real storage
// contract without each test having to mock.
function installStorageShim() {
  if (typeof window === 'undefined') return
  const needsShim =
    typeof window.localStorage?.getItem !== 'function' ||
    typeof window.localStorage?.setItem !== 'function' ||
    typeof window.localStorage?.removeItem !== 'function'
  if (!needsShim) return

  const store = new Map<string, string>()
  const shim: Storage = {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key)
    },
    setItem: (key: string, value: string) => {
      store.set(String(key), String(value))
    },
  }
  Object.defineProperty(window, 'localStorage', { value: shim, configurable: true })
}

installStorageShim()

afterEach(() => {
  cleanup()
  if (typeof window !== 'undefined') {
    window.localStorage?.clear?.()
  }
})
