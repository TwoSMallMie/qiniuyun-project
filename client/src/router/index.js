import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'ApiTest',
    component: () => import('../views/test.vue')
  },
  // 其他路由...
  {
    path: '/chat',
    name: 'chatView',
    component: () => import('../views/chatView/index.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
