<template>
  <div id="app">
    <Navigation ref="navbar" />
    <router-view></router-view>
  </div>
</template>

<script>
import Navigation from './components/Navigation.vue'

export default {
  components: { Navigation },
  methods: {
    updateUser(userData) {
      this.$refs.navbar.updateUser(userData)
    },
  },
}
</script>
