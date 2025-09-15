<template>
  <div class="auth-page">
    <h2>Sign Up</h2>
    <form @submit.prevent="handleRegister">
      <input type="text" v-model="name" placeholder="Full Name" required />
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button class="register-button">Register</button>
    </form>
    <p>Already have an account?</p>
    <button class="login-button" @click="goToLogin">Login</button>
  </div>
</template>

<script>
import { createDefaultFavoriteList, register, login } from '@/services/api.js'

export default {
  components: {},
  data() {
    return {
      name: '',
      email: '',
      password: '',
    }
  },
  methods: {
    async handleRegister() {
      try {
        await register(this.name, this.email, this.password)
        await login(this.email, this.password)
        await createDefaultFavoriteList()
        this.$router.push('/')
      } catch {
        alert('Signup failed. Please try again.')
      }
    },
    goToLogin() {
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped></style>
