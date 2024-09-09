import { createRouter, createWebHistory } from 'vue-router';

import MainMenu from '@/components/MainMenu.vue';
import MemoryGame from '@/components/MemoryGame.vue';
import SnakeGame from '@/components/SnakeGame.vue';
import FlappyBirdGame from '@/components/FlappyBirdGame.vue';
import DoodleJumpGame from '@/components/DoodleJumpGame.vue';

import Rank from '@/components/Rank.vue';
// import MemoryRank from '@/views/Rank/MemoryRank.vue'
// import SnakeRank from '@/views/Rank/SnakeRank.vue'
// import FlappyBirdRank from '@/views/Rank/FlappyBirdRank.vue'
// import DoodleJumpRank from '@/views/Rank/DoodleJumpRank.vue'

import Login from '@/components/login.vue'
import Register from '@/components/register.vue'
import Logout from '@/components/logout.vue'

const routes = [
  {
    path: '/',
    name: 'MainMenu',
    component: MainMenu,
    meta: { requiresAuth: true }
  },
  {
    path: '/memory-game',
    name: 'MemoryGame',
    component: MemoryGame,
    meta: { requiresAuth: true }
  },
  {
    path: '/snake-game',
    name: 'SnakeGame',
    component: SnakeGame,
    meta: { requiresAuth: true }
  },
  {
    path: '/flappy-bird-game',
    name: 'FlappyBirdGame',
    component: FlappyBirdGame,
    meta: { requiresAuth: true }
  },
  {
    path: '/doodle-jump-game',
    name: 'DoodleJumpGame',
    component: DoodleJumpGame,
    meta: { requiresAuth: true }
  },
  {
    path: '/rank/:gameName',
    name: 'Rank',
    component: () => import('@/components/Rank.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  // {
  //   path: '/memory-rank',
  //   name: 'MemoryRank',
  //   component: MemoryRank,
  //   meta: { requiresAuth: true }
  // },
  // {
  //   path: '/snake-rank',
  //   name: 'SnakeRank',
  //   component: SnakeRank,
  //   meta: { requiresAuth: true }
  // },
  // {
  //   path: '/flappy-bird-rank',
  //   name: 'FlappyBirdRank',
  //   component: FlappyBirdRank,
  //   meta: { requiresAuth: true }
  // },
  // {
  //   path: '/doodle-jump-rank',
  //   name: 'DoodleJumpRank',
  //   component: DoodleJumpRank,
  //   meta: { requiresAuth: true }
  // },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/logout',
    name: 'Logout',
    component: Logout,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('user');
  
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/' && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
