import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import DefineOptions from 'unplugin-vue-define-options/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  server: {
    port: 18080, // 指定端口号
  },
  build: {
    chunkSizeWarningLimit: 9000, // 将这个值调整为你希望的大小（以字节为单位）
  },
  plugins: [
    vue(),
    vueJsx(),
    DefineOptions()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.vue', '.js', '.json', 'tsx', 'ts']
  }
})
