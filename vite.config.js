import { defineConfig } from 'vite';
import { resolve } from 'path';

// Vite 多页面配置文件
// 支持 index.html / admin.html / admin-app.html 三个入口
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        'admin-app': resolve(__dirname, 'admin-app.html'),
      },
    },
  },
  server: {
    port: 3000,
  },
});
