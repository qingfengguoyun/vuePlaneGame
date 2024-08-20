import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'

const pathResolve = (dir: string) => {
  return resolve(__dirname, '.', dir);
};
const alias: Record<string, string> = {
  '@': pathResolve('./src'),
};

// https://vitejs.dev/config/
export default defineConfig({
  //组件化打包配置
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: "src/index.js",
      name: "vue_testgame",
      // the proper extensions will be added
      fileName: "vue_testgame",
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["vue"],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue : "vue_testgame",
        },
      },
    },
  },

  plugins: [
    vue(),
    VueSetupExtend(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server:{
    host: '0.0.0.0',
    port: 3001,
  }
})
