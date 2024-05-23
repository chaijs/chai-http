import js from '@eslint/js';
import mocha from 'eslint-plugin-mocha';
export default [
  mocha.configs.flat.recommended,
  {
    ...js.configs.recommended,
    files: ['**/*.js']
  }
];
