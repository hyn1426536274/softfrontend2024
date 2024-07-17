import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  // chat oraltest math sentencecorrection object roleplay
  {
    path: '/chat',
    name: 'chat',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/ChatView.vue')
  },
  {
    path: '/oraltest',
    name: 'oraltest',
    component: () => import(/* webpackChunkName: "about" */ '../views/OralTest.vue')
  },
  {
    path: '/math',
    name: 'math',
    component: () => import(/* webpackChunkName: "about" */ '../views/MathView.vue')
  },
  {
    path: '/sentencecorrection',
    name: 'sentencecorrection',
    component: () => import(/* webpackChunkName: "about" */ '../views/SentenceCorrection.vue')
  },
  {
    path: '/object',
    name: 'object',
    component: () => import(/* webpackChunkName: "about" */ '../views/ObjectView.vue')
  },
  {
    path: '/roleplay',
    name: 'roleplay',
    component: () => import(/* webpackChunkName: "about" */ '../views/RolePlay.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
