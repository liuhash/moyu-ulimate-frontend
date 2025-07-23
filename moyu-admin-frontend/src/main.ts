import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// 导入页面组件
import AdminLogin from './views/AdminLogin.vue'
import AdminPanel from './views/AdminPanel.vue'

// 创建路由
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: AdminLogin },
  { path: '/panel', component: AdminPanel }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/panel')
  } else {
    next()
  }
})

// 创建应用
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app') 