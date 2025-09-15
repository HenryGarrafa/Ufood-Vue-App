<template>
  <div class="user-profile" v-if="currentUser">
    <h1>{{ currentUser.name }}</h1>
    <button
      v-if="!mainUser"
      class="user-icon-container"
      title="Follow user"
      :style="{
        color: isFollowed ? 'green' : 'gray',
        backgroundColor: isFollowed ? '#97e6e3' : '#ededed',
      }"
      @click="toggleFollow"
    >
      <FontAwesomeIcon
        :icon="isFollowed ? ['fas', 'user-minus'] : ['fas', 'user-plus']"
        class="user-icon"
      />
    </button>
    <div class="profile-container">
      <p><strong>Name:</strong> {{ currentUser.name }}</p>
      <p><strong>Email:</strong> {{ currentUser.email }}</p>
      <p><strong>Score:</strong> {{ currentUser.rating || 'N/A' }}</p>
      <div class="profile-options">
        <button
          class="profile-option"
          :class="{ active: currentView === 1 }"
          @click="openVisitView"
        >
          <FontAwesomeIcon :icon="['fas', 'utensils']" title="User visits" />
        </button>
        <button
          v-if="mainUser"
          class="profile-option"
          :class="{ active: currentView === 2 }"
          @click="openFavoritesView"
        >
          <FontAwesomeIcon :icon="['fas', 'heart']" title="Favorites" />
        </button>
        <button
          class="profile-option"
          :class="{ active: currentView === 3 }"
          @click="openFollowingView"
        >
          <FontAwesomeIcon :icon="['fas', 'users-viewfinder']" title="Following" />
        </button>
        <button
          class="profile-option"
          :class="{ active: currentView === 4 }"
          @click="openFollowersView"
        >
          <FontAwesomeIcon :icon="['fas', 'users']" title="Followers" />
        </button>
      </div>
      <div v-if="currentView === 1" class="profile-view">
        <h2>Visits</h2>
        <div v-if="loading">
          <p>Loading visits...</p>
        </div>
        <Reviews v-else :reviews="this.userReviews" />
      </div>

      <div v-if="currentView === 2" class="profile-view">
        <h2>Favorites</h2>
        <Favorites></Favorites>
      </div>

      <div v-if="currentView === 3" class="profile-view">
        <h2>Following</h2>
        <UsersHome
          :users="this.following"
          :following="this.following"
          :followers="this.followers"
        />
      </div>

      <div v-if="currentView === 4" class="profile-view">
        <h2>Followers</h2>
        <UsersHome
          :users="this.followers"
          :following="this.following"
          :followers="this.followers"
        />
      </div>
    </div>
  </div>
  <div v-else class="loading">Loading user data...</div>
</template>

<script>
import Reviews from '@/components/reviews/Reviews.vue'
import {
  followUser,
  getUserById,
  getUserInfo,
  getUserVisits,
  isAuthenticated,
  unfollowUser,
} from '@/services/api.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Favorites from '@/components/favorites/Favorites.vue'
import UsersHome from '@/components/users/UsersHome.vue'

export default {
  name: 'User',
  components: {
    UsersHome,
    Favorites,
    FontAwesomeIcon,
    Reviews,
  },
  props: {
    id: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      mainUser: false,
      currentUser: null,
      userReviews: [],
      followers: [],
      following: [],
      followerList: [],
      followingList: [],
      currentView: 1,
      loading: true,
    }
  },
  computed: {
    isFollowed() {
      return this.followingList.some((follow) => follow.id === this.id)
    },
    isFollowing() {
      return this.followerList.some((follower) => follower.id === this.id)
    },
  },
  async created() {
    await this.loadFollows()
    await this.loadUserProfile()
  },
  methods: {
    async loadUserProfile() {
      let userData

      if (this.id) {
        this.mainUser = false
        userData = await getUserById(this.id)
        if (userData) {
          this.currentUser = userData
          this.userReviews = await getUserVisits(userData.id, 100)
          this.followers = userData.following
          this.following = userData.followers
        }
      } else {
        userData = await getUserInfo()
        this.mainUser = true
        if (userData) {
          this.currentUser = userData
          this.userReviews = await getUserVisits(userData.id, 100)
          this.followers = userData.followers
          this.following = userData.following
        }
      }
      this.loading = false
    },
    openVisitView() {
      this.currentView = 1
    },
    openFavoritesView() {
      this.currentView = 2
    },
    openFollowingView() {
      this.currentView = 3
    },
    openFollowersView() {
      this.currentView = 4
    },
    async loadFollows() {
      let connectedUserData
      connectedUserData = await getUserInfo()

      this.followingList = connectedUserData.following
      this.followerList = connectedUserData.followers
    },
    async toggleFollow() {
      if (isAuthenticated()) {
        if (this.isFollowed) {
          const success = await unfollowUser(this.id)
          if (success) {
            await this.loadFollows()
          }
        } else {
          const success = await followUser(this.id)
          if (success) {
            await this.loadFollows()
          }
        }
      } else {
        this.$router.push('/login')
      }
    },
  },
  watch: {
    async id(newId, oldId) {
      if (newId !== oldId) {
        this.currentUser = null
        this.userReviews = []
        this.following = []
        this.followers = []
        await this.loadUserProfile()
      }
    },
  },
}
</script>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 15px;
  margin-bottom: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
  padding-bottom: 20px;
}

.profile-options {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: rgba(0, 0, 0, 0.2) solid 1px;
  margin: 0 30% 0 30%;
}

.profile-option {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f4f4f4;
  color: black;
  height: 2rem;
  width: 3rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
  font-size: 1.2rem;
  transition: 0.3s ease-in-out;
}

.profile-option:hover {
  transform: scale(1.2);
  background: #8dacd8;
  color: #fff;
}

.active {
  background-color: #40a697;
  color: #fff;
}

.user-profile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-family: Arial, sans-serif;
}

.profile-container {
  display: block;
  width: 95%;
}

h1 {
  margin-bottom: 0;
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: background 0.3s ease;
}

button:hover {
  background-color: #609fed;
  color: #043e3a;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: gray;
}
</style>
