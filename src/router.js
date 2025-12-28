import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView,
    beforeEnter: (to, from, next) => {
      const isAuth = localStorage.getItem('auth')
      if (isAuth) {
        next({ name: 'Dashboard' })
      } else {
        next()
      }
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    beforeEnter: (to, from, next) => {
      const isAuth = localStorage.getItem('auth')
      if (!isAuth) {
        next({ name: 'Login' })
      } else {
        next()
      }
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
