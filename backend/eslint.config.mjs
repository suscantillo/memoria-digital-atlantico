// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const MENSAJE_DOMINIO =
  'domain/ es TypeScript puro: no puede depender de NestJS, Prisma, class-validator ni de capas externas.';
const MENSAJE_APLICACION =
  'application/ solo depende de domain/: no puede importar NestJS, Prisma ni capas externas.';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'storage/**', 'eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    },
  },
  {
    // domain/ no depende de nada externo
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@nestjs/**',
                '@prisma/**',
                'class-validator',
                'class-validator/**',
                'class-transformer',
                'class-transformer/**',
                '**/application/**',
                '**/infrastructure/**',
                '**/presentation/**',
              ],
              message: MENSAJE_DOMINIO,
            },
          ],
        },
      ],
    },
  },
  {
    // application/ solo depende de domain/
    files: ['src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nestjs/**', '@prisma/**', '**/infrastructure/**', '**/presentation/**'],
              message: MENSAJE_APLICACION,
            },
          ],
        },
      ],
    },
  },
);
