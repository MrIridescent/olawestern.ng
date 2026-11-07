const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const nextPlugin = require('@next/eslint-plugin-next');

module.exports = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'public/**', 'next-env.d.ts'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      '@next/next': nextPlugin,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // Supabase rows and Contentful entries arrive untyped; these two rules
      // would otherwise flag every honest cast at the API boundary.
      '@typescript-eslint/no-explicit-any': 'off',
      // Unused function parameters are intentional when they satisfy a
      // callback signature; ignore the `_`-prefixed ones.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
        '@next/next': nextPlugin,
    },
    rules: {
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs['core-web-vitals'].rules,
    }
  }
];
