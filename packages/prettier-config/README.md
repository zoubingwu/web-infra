# @pingcap/prettier-config

Prettier config for PingCAP FE team.

## Usage

**Install**:

```bash
$ yarn add --dev @pingcap/prettier-config
```

**Edit `package.json`**:

```jsonc
{
  // ...
  "prettier": "@pingcap/prettier-config"
}
```

> Note: This method does not offer a way to extend the configuration to overwrite some properties from the shared configuration. If you need to do that, import the file in a `.prettierrc.js` file and export the modifications, e.g:

```js
module.exports = {
  ...require("@pingcap/prettier-config"),
  semi: true,
};
```
