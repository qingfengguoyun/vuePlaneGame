import { createRouter, createWebHistory } from 'vue-router'

import GamePage from '@/components/GamePage.vue'
import GoogleGame from '@/components/GoogleGame.vue'
import PlaneGame from '@/components/planeGame/PlaneGame.vue'

const router = createRouter({
  history: createWebHistory(),
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
