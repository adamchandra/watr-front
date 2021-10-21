module.exports = {
  root: true,
  env: {
    browser: true,
    mocha: true,
    es6: true,
    node: true
  },
  parser: '@typescript-eslint/parser',

  extends: [
    "airbnb-typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    // "plugin:eslint-comments/recommended",
    // "plugin:jest/recommended",
    // "plugin:promise/recommended",
    // "plugin:unicorn/recommended",
    // "prettier",
  ],

  plugins: [
    '@typescript-eslint'
  ],

  parserOptions: {
    project: './tsconfig.json',
  },

  globals: {
    expect: true
  },

  rules: {
    'no-unused-vars': 0,
    'no-empty-pattern': ['off'],
    'comma-dangle': ['off'],
    'space-before-function-paren': ['off'],

    'vue/no-unused-components': 0,
    'vue/multiline-html-element-content-newline': 0,
    'vue/html-indent': ['off'],
    'vue/max-attributes-per-line': ['off'],
    'vue/attributes-order': ['off'],
    'vue/script-indent': ['off'],

    '@typescript-eslint/ban-ts-comment': ['off'],
    '@typescript-eslint/explicit-function-return-type': ['off'],
    '@typescript-eslint/explicit-module-boundary-types': ['off'],
    '@typescript-eslint/no-empty-interface': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-inferrable-types': ['off'],
    '@typescript-eslint/no-namespace': ['off'],
    '@typescript-eslint/no-non-null-assertion': ['off'],
    '@typescript-eslint/no-unused-vars': ['off'],
    '@typescript-eslint/no-use-before-define': ['off'],
    '@typescript-eslint/no-this-alias': ['error', {
      allowDestructuring: true, // Allow `const { props, state } = this`; false by default
      allowedNames: ['self'] // Allow `const self = this`; `[]` by default
    }],
    quotes: ['warn', 'single', { avoidEscape: true }]
  },

  overrides: [
    {
      files: ['*.vue'],
      rules: {
        indent: 'off'
      }
    }
  ]
}
