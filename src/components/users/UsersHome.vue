<template>
  <div class="users-home">
    <UserFilters @update-filters="handleFilters" />
    <Users v-if="users.length" :users="paginatedUsers" />
    <p v-else>No users found.</p>
    <Pagination :totalPages="totalPages" :currentPage="currentPage" @change-page="changePage" />
  </div>
</template>

<script>
import Users from '@/components/users/Users.vue'
import UserFilters from '@/components/UserFilters.vue'
import Pagination from '@/components/Pagination.vue'

export default {
  name: 'UsersHome',
  components: {
    Pagination,
    UserFilters,
    Users,
  },
  props: {
    users: {
      type: Array,
      required: true,
    },
    followers: {
      type: Array,
      required: true,
    },
    following: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      currentPage: 0,
      perPage: 20,
      searchQuery: '',
      filters: {
        q: '',
        perPage: 20,
        tags: [],
      },
    }
  },
  computed: {
    sortedUsers() {
      const { sortBy, tags } = this.filters
      let usersToSort = [...this.users]

      if (this.filters.q) {
        usersToSort = usersToSort.filter((user) =>
          user.name.toLowerCase().includes(this.filters.q.toLowerCase()),
        )
      }

      if (tags.includes('Followers')) {
        const followerIds = this.followers.map((u) => u.id)
        usersToSort = usersToSort.filter((user) => followerIds.includes(user.id))
      } else if (tags.includes('Following')) {
        const followingIds = this.following.map((u) => u.id)
        usersToSort = usersToSort.filter((user) => followingIds.includes(user.id))
      }

      switch (sortBy) {
        case 'name':
          return usersToSort.sort((a, b) => a.name.localeCompare(b.name))
        case 'name-desc':
          return usersToSort.sort((a, b) => b.name.localeCompare(a.name))
        case 'rating':
          return usersToSort.sort((a, b) => b.rating - a.rating)
        case 'rating-desc':
          return usersToSort.sort((a, b) => a.rating - b.rating)
        default:
          return usersToSort
      }
    },
    paginatedUsers() {
      const start = this.currentPage * this.filters.perPage
      const end = start + this.filters.perPage
      return this.sortedUsers.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.sortedUsers.length / this.perPage) || 1
    },
  },
  methods: {
    handleFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.currentPage = 0
      this.perPage = this.filters.perPage
    },
    changePage(page) {
      if (page < 0 || page > this.totalPages) return
      this.currentPage = page
    },
  },
}
</script>

<style scoped>
.users-home {
  display: flex;
  flex-direction: column;
  width: 95%;
  padding: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
}
</style>
