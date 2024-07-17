import { createRouter, createWebHashHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import CameraView from '../views/CameraView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: 'camera',
    // component: HomeView
  },
  {
    path: '/camera',
    name: 'camera',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: CameraView
  },
  {
    path:'/login',
    name:'login',
    component: () => import('../views/LoginView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
