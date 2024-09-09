<template>
  <v-app>
    <v-container fluid class="app-container">
      <router-view></router-view>
    </v-container>
  </v-app>
</template>

<script>
import { defineComponent } from 'vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';

export default defineComponent({
  name: 'App',
  vuetify: createVuetify(), // Vuetify 3.x 초기화
});
</script>

<style scoped>
/* 전역 스타일 설정 */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f4f4f4; /* 페이지 배경색 */
}

/* 앱 컨테이너 스타일 설정 */
.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* 화면 높이 전체를 사용 */
}
</style>
