module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript'],
  parser: '@typescript-eslint/parser',
  plugins: ['import'],
  root: true,

  // override rules here
  rules: {
    /**
     * @link https://github.com/typescript-eslint/typescript-eslint/blob/15f718415eb4e522440a5d81f38d65ee81535795/packages/eslint-plugin/docs/rules/method-signature-style.md
     */
    '@typescript-eslint/method-signature-style': 'off',

    /**
     * @link https://github.com/typescript-eslint/typescript-eslint/blob/99eca0d428187d4c29ded9ddd1b57b40ab463c01/packages/eslint-plugin/docs/rules/no-invalid-void-type.md
     */
    '@typescript-eslint/no-invalid-void-type': 'off',

    /**
     * @link https://github.com/typescript-eslint/typescript-eslint/blob/84fff3575282f09683385e855c20df3c261ce313/packages/eslint-plugin/docs/rules/consistent-type-definitions.md
     * @reason we accept both type alias and interface
     */
    '@typescript-eslint/consistent-type-definitions': 'off',

    /**
     * @link https://github.com/import-js/eslint-plugin-import/blob/95e60112bcb116c14f18005c42adf3d3e4501b32/docs/rules/order.md
     * @reason a more strict import order for better maintainability
     */
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
        ],
        'newlines-between': 'always',
      },
    ],
  },
}
