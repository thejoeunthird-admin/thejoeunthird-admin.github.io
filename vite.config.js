import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/', plugins: [react()], build: { outDir: 'docs', },
  server: { port: 3000, },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@pages': path.resolve(__dirname, 'src/pages'),  
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@jotai': path.resolve(__dirname, 'src/jotai'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@img': path.resolve(__dirname, 'src/assets'), 
      '@components': path.resolve(__dirname, 'src/component'), // 임시 component 나중에 components로 변경
    },
  },
})
