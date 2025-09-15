import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie' // Import the 'js-cookie' library to check the token
import Home from '../pages/Home.vue'
import Restaurant from '../pages/Restaurant.vue'
import User from '../pages/User.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Favorites from '../components/favorites/Favorites.vue'
import FindUsers from '@/pages/FindUsers.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/restaurant/:id',
    name: 'Restaurant',
    component: Restaurant,
    props: true,
  },
  {
    path: '/user/:id?',
    name: 'User',
    component: User,
    props: true,
  },
  {
    path: '/users',
    name: 'Users',
    component: FindUsers,
  },
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
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = Cookies.get('token')
  const publicPages = ['/login', '/register', '/restaurant', '/', '/users']
  const authRequired = !publicPages.includes(to.path) && !to.path.startsWith('/restaurant/')

  if (authRequired && !token) {
    return next('/login')
  }
  next()
})
