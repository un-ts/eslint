import { defineConfig } from 'vitest/config'

export default defineConfig({
  tsconfig: 'tsconfig.eslint.json',
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    coverage: {
      enabled: true,
      exclude: [
        // just a placeholder now
        'packages/react-enhanced/src/**',
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
