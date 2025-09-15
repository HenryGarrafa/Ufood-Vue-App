<template>
  <div class="users-home">
    <UserFilters @update-filters="handleFilters" />
    <Users :users="paginatedUsers" />
    <Pagination :currentPage="currentPage" :totalPages="totalPages" @change-page="changePage" />
  </div>
</template>

<script>
import Users from '@/components/users/Users.vue'
import UserFilters from '@/components/UserFilters.vue'
import { getAllUsers, getUserById, isAuthenticated } from '@/services/api'
import Pagination from '@/components/Pagination.vue'

export default {
  name: 'FindUsers',
  components: {
    Pagination,
    UserFilters,
    Users,
  },
  data() {
    return {
      users: [],
      followers: [],
      following: [],
      searchQuery: '',
      perPage: 20,
      currentPage: 0,
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
  async created() {
    await this.fetchUsers()
  },
  methods: {
    async fetchUsers(page = 0) {
      const { q } = this.filters

      if (isAuthenticated()) {
        const userData = await getUserById()

        this.followers = userData.followers
        this.following = userData.following
      }

      const initialData = await getAllUsers(1, 0, q)
      const total = initialData.total

      const data = await getAllUsers(total, page, q)
      this.users = data.items || []
    },
    handleFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.currentPage = 0
      this.perPage = this.filters.perPage
      this.fetchUsers()
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
