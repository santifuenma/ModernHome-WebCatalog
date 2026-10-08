import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
    resolve: {
        // Mismo alias que tsconfig.json ("@/*" → raíz del proyecto)
        alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
    },
    test: {
        environment: 'node',
        include: ['**/*.test.{ts,tsx}'],
        // .claude contiene copias del repo (worktrees): no deben ejecutarse desde aquí
        exclude: ['node_modules', '.next', '.claude'],
    },
})
