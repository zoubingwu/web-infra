module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript'],
  parser: '@typescript-eslint/parser',
  plugins: ['import'],
  root: true,

  // override rules here
  rules: {
    '@typescript-eslint/method-signature-style': 'off',

    /**
     * @reason a more strict import order for better maintainability
     */
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
        'newlines-between': 'always',
      },
    ],
  },
}
