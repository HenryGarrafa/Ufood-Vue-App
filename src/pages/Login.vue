<template>
  <div class="auth-page">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button class="login-button">Login</button>
    </form>

    <p>Don't have an account?</p>
    <button class="register-button" @click="goToRegister">Register</button>
  </div>
</template>

<script>
import { getUserInfo, login, getUserFavoriteLists } from '@/services/api.js'
import { useUserStore } from '@/stores/userStore.js'

export default {
  components: {},
  data() {
    return {
      email: '',
      password: '',
      isLoggingIn: false,
    }
  },
  methods: {
    async handleLogin() {
      if (this.isLoggingIn) return
      this.isLoggingIn = true
      try {
        await login(this.email, this.password)

        const userData = await getUserInfo()
        localStorage.setItem('user', JSON.stringify(userData))

        const favoriteData = await getUserFavoriteLists()
        if (favoriteData.length > 0) {
          localStorage.setItem('selectedFavoriteListId', favoriteData[0].id)
        }

        const userStore = useUserStore()
        userStore.setUserData(userData)

        this.$router.push('/')
      } catch {
        alert('Login failed, please check your credentials.')
      } finally {
        this.isLoggingIn = false
      }
    },
    goToRegister() {
      this.$router.push('/register')
    },
  },
}
</script>

<style scoped></style>
