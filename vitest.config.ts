import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['./tsconfig.eslint.json'],
    }),
  ],
  test: {
    globals: true,
    coverage: {
      enabled: true,
      include: ['packages/*/src'],
      exclude: [
        // just a placeholder now
        'packages/react-enhanced/src',
        // worker is not supported by vitest
        'packages/*/src/worker.ts',
      ],
      provider: 'istanbul',
      reporter: ['lcov', 'json', 'text'],
    },
    setupFiles: ['./test-setup.ts'],
    testTimeout: 60_000,
  },
})
