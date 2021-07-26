# @ti-fe/eslint-config

## Philosophy

- Seperation of concerns. All coding style-related rules will be handled by [Prettier](https://prettier.io/)
- Values [ESLint's philosophy](https://eslint.org/docs/about/#philosophy). Every rules is standalone and configurable individually.
- Use [alloy config](https://github.com/AlloyTeam/eslint-config-alloy) as default preset. Feel free to customize and build your own rule set.

## Usage

Install `@ti-fe/cli` then run `wi doctor`. Or do it manually:

```sh
yarn add -D eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin @ti-fe/eslint-config
```

Then create an `.eslintrc.js` in the root directory of your project, copy the followings to it

```js
module.exports = {
  extends: ['@ti-fe/eslint-config'],
  env: {
    // Your custom env variables, e.g., browser: true, jest: true
  },
  globals: {
    // Your global variables
  },
  rules: {
    // Your custom rules.
  },
}
```
