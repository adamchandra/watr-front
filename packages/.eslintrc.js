// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  extends: ['@rushstack/eslint-config/profile/node'],
  root: true,
  parserOptions: { tsconfigRootDir: __dirname },
  rules: {
    'semi': ['error', 'always'],
    'indent': 'off',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/naming-convention': ['off'],
    '@typescript-eslint/no-floating-promises':['off'],
    'quotes': 'off',
    '@typescript-eslint/quotes': ['error', 'single'],
    'require-atomic-updates': ['warn'],
  }
};
