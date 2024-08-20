import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

import GamePage from '@/components/GamePage.vue'
import GoogleGame from '@/components/GoogleGame.vue'
import PlaneGame from '@/components/planeGame/PlaneGame.vue'

const router = createRouter({
  // history: createWebHistory(),
  // electron 打包不支持histroy模式，需使用hash模式（createWebHashHistory()）
  history: createWebHashHistory(),
  routes: [
    {
      path: '/game',
      name: 'game',
      component: GamePage
    },
    {
      path: '/',
      redirect : '/planeGame'
    },
    {
      path: '/googleGame',
      name: 'googleGame',
      component : GoogleGame
    },{
      path: '/planeGame',
      name: 'planeGame',
      component : PlaneGame,
    }
  ]
})

export default router
