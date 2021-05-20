// @ts-check
import path from 'path'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

/**
 * @type { import('rollup').RollupOptions }
 */
const config = {
  input: {
    index: path.resolve(__dirname, 'src/index.ts'),
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    typescript({
      target: 'es2019',
      include: ['src/**/*.ts'],
      esModuleInterop: true,
    }),
    commonjs({ extensions: ['.js'] }),
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
}

export default config
