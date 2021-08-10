import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import ssr from 'vite-plugin-ssr/plugin'
import windicss from 'vite-plugin-windicss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    ssr(),
    windicss({
      scan: {
        dirs: ['pages'],
        fileExtensions: ['ts', 'tsx', 'html'],
      },
    }),
  ],
  base: '/web-infra/',
  define: {
    'process.env': {},
  },
})
