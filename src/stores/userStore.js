import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', {
  state: () => ({
    userData: null,
    isLoggedIn: false,
  }),
  actions: {
    setUserData(newUser) {
      this.userData = newUser
      this.isLoggedIn = !!newUser
    },
    logout() {
      this.userData = null
      this.isLoggedIn = false
    },
  },
})
