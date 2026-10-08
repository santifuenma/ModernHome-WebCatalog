import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            // El código existente usa `any` en las consultas de Supabase y en las hojas de Excel:
            // se avisa, pero no bloquea.
            '@typescript-eslint/no-explicit-any': 'warn',
            // Los nombres que empiezan por _ y los campos que se descartan al desestructurar son intencionados
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
            ],
        },
    },
    globalIgnores([
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        // Copias del repositorio (worktrees) y caché de herramientas: no son código de este proyecto
        '.claude/**',
        '.vitest/**',
    ]),
])
