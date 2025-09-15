<template>
  <nav class="navigation">
    <div class="logo-container">
      <FontAwesomeIcon icon="burger" flip="vertical" class="logo-icon" />
      <span class="logo-text">Food</span>
    </div>

    <div class="search-container">
      <AutoComplete
        v-model="searchQuery"
        :restaurantSuggestions="restaurantSuggestions"
        :userSuggestions="userSuggestions"
        placeholder="Search..."
        @select="handleSelect"
      />
      <button class="search-button" @click="performSearch">
        <FontAwesomeIcon icon="magnifying-glass" />
      </button>
    </div>

    <ul class="menu">
      <li>
        <router-link to="/">
          <FontAwesomeIcon icon="house" />
          <span>Home</span>
        </router-link>
      </li>
      <li>
        <router-link to="/users">
          <FontAwesomeIcon icon="users" />
          <span>Find users</span>
        </router-link>
      </li>
      <li v-if="isLoggedIn">
        <router-link to="/user">
          <FontAwesomeIcon icon="user" />
          <span>({{ userName }})</span>
        </router-link>
      </li>
      <li @click="handleAuth">
        <router-link to="#">
          <FontAwesomeIcon :icon="isLoggedIn ? 'right-from-bracket' : 'right-to-bracket'" />
          <span>{{ isLoggedIn ? 'Logout' : 'Login' }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { getAllUsers, getRestaurants, isAuthenticated, logout } from '@/services/api.js'
import { watch } from 'vue'
import AutoComplete from '@/components/AutoComplete.vue'

library.add(fas)

export default {
  components: {
    FontAwesomeIcon,
    AutoComplete,
  },
  data() {
    return {
      searchQuery: '',
      restaurantSuggestions: [],
      userSuggestions: [],
      isLoggedIn: isAuthenticated(),
      userName: '',
    }
  },
  async created() {
    if (this.isLoggedIn) {
      await this.fetchUserInfo()
    }
    await this.fetchRestaurants()
    await this.fetchUsers()
  },
  methods: {
    performSearch() {
      alert(`Searching for: ${this.searchQuery}`)
    },
    handleSelect(suggestion) {
      this.$router.push({ path: '/home', filters: { q: suggestion.name } })
    },
    async handleAuth() {
      if (this.isLoggedIn) {
        this.$router.push('/')
        await logout()
        localStorage.removeItem('user')
        this.isLoggedIn = false
        this.userName = ''
      } else {
        this.$router.push('/login')
      }
    },
    async fetchRestaurants() {
      const initialData = await getRestaurants(1)
      const total = initialData.total
      const data = await getRestaurants(total)
      this.restaurantSuggestions = data.items
    },
    async fetchUsers() {
      const initialData = await getAllUsers(1)
      const total = initialData.total

      const data = await getAllUsers(total)
      this.userSuggestions = data.items || []
    },
    async fetchUserInfo() {
      try {
        const userDataString = localStorage.getItem('user')
        if (!userDataString) {
          this.userName = ''
          return
        }

        const userData = JSON.parse(userDataString)
        if (userData && userData.name) {
          this.userName = userData.name.split(' ')[0]
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
        this.userName = ''
      }
    },
    updateUser(userData) {
      this.isLoggedIn = true
      this.userName = userData.name.split(' ')[0]
    },
  },
  mounted() {
    watch(
      () => this.$route.path,
      async () => {
        this.isLoggedIn = isAuthenticated()
        if (this.isLoggedIn) {
          await this.fetchUserInfo()
        } else {
          this.userName = ''
        }
      },
    )
  },
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
}

.navigation {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(292deg, #123561, #28877b);
  padding: 10px;
  color: white;
  gap: 15px;
}

.logo-container {
  display: flex;
  align-items: center;
  margin-left: 5px;
}

.logo-container .logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.search-container {
  display: flex;
  align-items: center;
  margin-left: 3px;
  justify-content: left;
  gap: 10px;
  width: fit-content;
  margin-top: 0;
}

.search-button {
  height: 35px;
  width: 35px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  border: none;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.search-button:hover {
  background-color: #003d80;
}

.menu {
  display: flex;
  padding: 0;
  align-items: center;
  margin-left: auto;
  list-style: none;
  gap: 4px;
}

.menu li {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 20px;
  border-radius: 8px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
}

.menu a {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 14px;
  border: none;
  color: white;
  text-decoration: none;
  padding: 8px 8px;
}

.menu svg {
  width: 25px;
  height: 25px;
}

.menu a:hover {
  background-color: #609fed;
  border-radius: 8px;
}

@media screen and (max-width: 768px) {
  .navigation {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .logo-container {
    justify-content: flex-start;
    margin-right: auto;
  }

  .menu {
    position: absolute;
    top: 2px;
    right: 10px;
    gap: 10px;
    margin-top: 10px;
  }

  .menu span,
  .auth-button span {
    display: none;
  }

  .menu li {
    width: 100%;
    text-align: center;
  }

  .search-container {
    width: 100%;
    align-items: center;
  }
}
</style>
