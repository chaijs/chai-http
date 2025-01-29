import js from '@eslint/js';
import mocha from 'eslint-plugin-mocha';
export default [
  mocha.configs.flat.recommended,
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        http: 'readonly',
        should: 'readonly',
        expect: 'readonly',
        chai: 'readonly',
        global: 'writable',
        request: 'readonly',
        AbortController: 'readonly',
      }
    }
  },
  {
    ...js.configs.recommended,
    files: ['**/*.js']
  },
  {
    rules: {
      'mocha/no-mocha-arrows': 'off'
    }
  }
];
