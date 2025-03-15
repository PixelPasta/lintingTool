module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,  // Fixed version number
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
  ],
  rules: {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": ["warn", { "varsIgnorePattern": "^_", "argsIgnorePattern": "^_" }],
    "no-console": "warn",
    "object-curly-spacing": ["error", "always"],
    "max-len": ["warn", { "code": 80, "ignoreUrls": true }], // Improved format
  },
};
