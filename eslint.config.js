import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

export default defineConfig(
  globalIgnores(['dist/', 'node_modules/']),
  js.configs.recommended,
  tseslint.configs.recommended,
  svelte.configs.recommended,
  prettier,
  svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: tseslint.parser,
        svelteConfig,
      },
    },
  },
  {
    rules: {
      // Threlteの<T.X>コンポーネントはプロパティ経由でThree.jsオブジェクトを構築するため、
      // 未使用に見えるexportやpropsが多く発生する。過検知を避けるため緩和する。
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
);
