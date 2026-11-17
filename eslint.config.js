const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
  {
    rules: {
      // React Native Text does not decode HTML entities, and Animated values
      // intentionally live in refs. These web/compiler rules do not map to RN.
      "react/no-unescaped-entities": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["**/*.test.ts", "tests/**/*.ts"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        vi: "readonly",
      },
    },
  },
]);
