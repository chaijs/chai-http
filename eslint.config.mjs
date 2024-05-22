import js from "@eslint/js";
import mocha from "eslint-plugin-mocha";
export default [
  mocha.configs.flat.recommended,
  {
    files: ["**/*.js"],
    rules: js.configs.recommended.rules,
  },

  // mocha.configs.flat.recommended
];
