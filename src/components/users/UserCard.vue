<template>
  <div class="card">
    <div class="restaurant-info">
      <button
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
      <h3>
        <router-link class="username-container" :to="`/user/${userCard.id}`">
          <div v-if="userCard.name && userCard.name.trim() !== ''">
            {{ userCard.name }}
          </div>
          <p v-else>No user name</p>
        </router-link>
      </h3>

      <div class="card-description">
        <h4><strong>Rating:</strong> {{ userCard.rating }}</h4>
      </div>

      <div class="card-symbols">
        <FontAwesomeIcon
          :icon="['fas', 'users']"
          :style="{ color: isFollowing ? 'rgba(0,0,0, 1)' : 'rgba(0,0,0,0.2)' }"
          class="following-icon"
          title="Is following you"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { isAuthenticated, followUser, unfollowUser } from '@/services/api'

library.add(fas, far)

export default {
  name: 'UserCard',
  components: { FontAwesomeIcon },
  props: {
    userCard: {
      type: Object,
      required: true,
    },
    followList: {
      type: Array,
      required: true,
    },
    followerList: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      userId: this.userCard.id,
      userName: this.userCard.name || 'No user name',
      userVisits: [],
    }
  },
  computed: {
    isFollowed() {
      return this.followList.some((follow) => follow.id === this.userId)
    },
    isFollowing() {
      return this.followerList.some((follower) => follower.id === this.userId)
    },
  },
  methods: {
    async toggleFollow() {
      if (isAuthenticated()) {
        if (this.isFollowed) {
          const success = await unfollowUser(this.userId)
          if (success) {
            this.$emit('follow', this.userId)
          }
        } else {
          const success = await followUser(this.userId)
          if (success) {
            this.$emit('follow', this.userId)
          }
        }
      } else {
        this.$router.push('/login')
      }
    },
  },
}
</script>

<style scoped>
.following-icon {
  color: #000000;
  font-size: 13px;
}

.card-symbols {
  height: 20px;
}

@media screen and (max-width: 800px) {
  .card {
    max-width: none;
    width: 95%;
    justify-self: center;
  }
}
</style>
