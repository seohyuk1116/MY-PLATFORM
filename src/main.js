import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createVuetify } from 'vuetify';
import 'vuetify/styles'; // Vuetify 3.x 스타일
import '@mdi/font/css/materialdesignicons.css'; // Material Design Icons

const vuetify = createVuetify(); // Vuetify 3.x 초기화

createApp(App).use(router).use(vuetify).mount('#app');
