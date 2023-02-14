/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: ['test/unit/**/*.test.ts'],
    deps: {
      interopDefault: false,
    },
    coverage: {
      provider: 'c8',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      all: true,
    },
  },
})
