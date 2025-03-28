import autoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    autoImport({
      imports: ['vitest'],
    }),
  ],
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov', 'json'],
    },
    setupFiles: ['./test-setup.ts'],
    testTimeout: 60_000,
  },
})
