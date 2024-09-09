// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import path from 'path'; // Node.js의 path 모듈을 import

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Vuetify 플러그인 설정
    vuetify({
      autoImport: true,
    }),
  ],
  define: {
    // Vue.js의 기능 플래그 설정
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    // process.env를 빈 객체로 설정
    'process.env': {},
  },
  resolve: {
    alias: {
      // '@'를 src 폴더로 alias 설정
      '@': path.resolve(__dirname, './src'),
    },
    // Vue 파일 확장자 자동 인식 설정 (주석 처리된 부분을 해제하여 사용 가능)
    // extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
});
