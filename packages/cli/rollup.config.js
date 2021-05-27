// @ts-check
import path from 'path'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'

/**
 * @type { import('rollup').RollupOptions }
 */
const config = {
  input: {
    index: path.resolve(__dirname, 'src/index.ts'),
  },
  plugins: [
    replace({
      values: {
        // cosmiconfig use this way to load js config
        'commonjsRequire(filePath)': "eval('require')(filePath)",
      },
      delimiters: ['', ''],
      preventAssignment: true,
    }),
    nodeResolve({ preferBuiltins: true }),
    typescript({
      target: 'es2019',
      include: ['src/**/*.ts'],
    }),
    commonjs({
      extensions: ['.js'],
    }),
    json(),
  ],
  treeshake: {
    moduleSideEffects: 'no-external',
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
  },
  output: {
    dir: path.resolve(__dirname, 'dist'),
    entryFileNames: `[name].js`,
    exports: 'named',
    format: 'cjs',
    externalLiveBindings: false,
    freeze: false,
    sourcemap: true,
  },

  external: ['fs/promises', 'semver'],

  onwarn(warning, warn) {
    // we use the eval('require') trick to deal with optional deps
    if (warning.message.includes('Use of eval')) {
      return
    }

    warn(warning)
  },
}

export default config
