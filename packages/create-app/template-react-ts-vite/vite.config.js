import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import vitePluginImp from 'vite-plugin-imp'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    vitePluginImp({
      libList: [
        {
          libName: 'antd',
          style: name => `antd/es/${name}/style`,
        },
      ],
    }),
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  build: {
    rollupOptions: {
      plugins: [visualizer({ template: 'treemap' })],
    },
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  resolve: {
    alias: [{ find: /^~/, replacement: '' }],
  },
})
