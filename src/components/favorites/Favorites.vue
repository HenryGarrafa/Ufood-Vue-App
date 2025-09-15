<template>
  <div class="favorites-page">
    <div class="container">
      <div class="create-list">
        <h2>Add a list</h2>
        <div class="create-container">
          <input v-model="newListName" placeholder="New list name" />
          <button class="button" @click="createList">
            <FontAwesomeIcon title="Create list" class="icon" :icon="['fas', 'plus']" />
          </button>
        </div>
      </div>

      <div class="create-list">
        <h2>Select a list</h2>
        <div class="list-selection" v-if="favoriteLists.length > 0">
          <select id="favorite-list" v-model="selectedListId" @change="updateSelectedList">
            <option v-for="list in favoriteLists" :key="list.id" :value="list.id">
              {{ list.name }}
            </option>
          </select>
          <button
            v-if="selectedListId"
            title="Add a new list"
            @click="deleteList"
            class="delete-btn"
          >
            <FontAwesomeIcon title="Delete list" class="icon" :icon="['fas', 'trash']" />
          </button>
          <button class="button" @click="showModal = true">
            <FontAwesomeIcon title="Modify list" class="icon" :icon="['fas', 'pencil']" />
          </button>
        </div>

        <div v-else>
          <p>No favorite lists found.</p>
        </div>
      </div>
    </div>

    <div v-if="selectedListId" class="restaurants">
      <h2>Restaurants in "{{ this.selectedListName }}"</h2>

      <RestaurantFilters @update-filters="handleFilters" />

      <Restaurants v-if="paginatedRestaurants.length > 0" :restaurants="paginatedRestaurants" />
      <div v-else-if="isLoggedIn">Not logged in.</div>
      <p v-else>No restaurants in this list.</p>
    </div>

    <Pagination :totalPages="totalPages" :currentPage="currentPage" @change-page="changePage" />

    <div v-if="showModal">
      <UpdateFavoritesModal
        :listId="selectedListId"
        :currentName="selectedListName"
        :closeModal="closeModal"
        @name-updated="updateListName"
      />
    </div>
  </div>
</template>

<script>
import Restaurants from '@/components/restaurantCard/Restaurants.vue'
import RestaurantFilters from '@/components/RestaurantFilters.vue'
import {
  getUserFavoriteLists,
  createFavoriteList,
  getFavoriteRestaurants,
  deleteFavoriteList,
  getRestaurantById,
  isAuthenticated,
} from '@/services/api.js'
import UpdateFavoritesModal from '@/components/favorites/UpdateFavoritesModal.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Pagination from '@/components/Pagination.vue'

export default {
  name: 'Favorites',
  components: {
    Pagination,
    FontAwesomeIcon,
    UpdateFavoritesModal,
    Restaurants,
    RestaurantFilters,
  },
  data() {
    return {
      favoriteLists: [],
      newListName: '',
      selectedListId: null,
      selectedListName: '',
      favoriteRestaurants: [],
      showModal: false,
      filters: {
        q: '',
        perPage: 20,
        tags: [],
      },
      currentPage: 0,
    }
  },
  computed: {
    isLoggedIn() {
      return !isAuthenticated()
    },

    sortedRestaurants() {
      const { sortBy, tags, q } = this.filters
      let restaurantsToSort = [...this.favoriteRestaurants]

      if (q) {
        restaurantsToSort = restaurantsToSort.filter((restaurant) =>
          restaurant.name.toLowerCase().includes(q.toLowerCase()),
        )
      }

      if (tags.length > 0) {
        restaurantsToSort = restaurantsToSort.filter((restaurant) =>
          tags.some((tag) =>
            restaurant.genres.some(
              (restaurantTag) => restaurantTag.toLowerCase() === tag.name.toLowerCase(),
            ),
          ),
        )
      }

      switch (sortBy) {
        case 'rating':
          return restaurantsToSort.sort((a, b) => b.rating - a.rating)
        case 'rating-desc':
          return restaurantsToSort.sort((a, b) => a.rating - b.rating)
        case 'name':
          return restaurantsToSort.sort((a, b) => a.name.localeCompare(b.name))
        case 'name-desc':
          return restaurantsToSort.sort((a, b) => b.name.localeCompare(a.name))
        default:
          return restaurantsToSort
      }
    },
    paginatedRestaurants() {
      const start = this.currentPage * this.filters.perPage
      const end = start + this.filters.perPage
      return this.sortedRestaurants.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.sortedRestaurants.length / this.filters.perPage) || 1
    },
  },
  async created() {
    if (isAuthenticated()) {
      await this.loadFavoriteLists()
    }
  },
  methods: {
    async loadFavoriteLists() {
      this.favoriteLists = (await getUserFavoriteLists()) || []

      const savedListId = localStorage.getItem('selectedFavoriteListId')
      const validList = this.favoriteLists.find((list) => list.id === savedListId)

      if (validList) {
        this.selectedListId = validList.id
        this.selectedListName = validList.name
      } else if (this.favoriteLists.length > 0) {
        this.selectedListId = this.favoriteLists[0].id
        this.selectedListName = this.favoriteLists[0].name
      } else {
        this.selectedListId = null
        this.selectedListName = ''
      }

      if (this.selectedListId) {
        await this.fetchFavoriteRestaurants()
      }
    },
    async createList() {
      if (!this.newListName.trim()) {
        alert('List name cannot be empty.')
        return
      }

      const isDuplicate = this.favoriteLists.some(
        (list) => (list.name || '').toLowerCase() === this.newListName.trim().toLowerCase(),
      )
      if (isDuplicate) {
        alert('A list with this name already exists.')
        return
      }

      const newList = await createFavoriteList(this.newListName)
      if (newList && newList.id && newList.name) {
        const formattedList = { id: newList.id, name: newList.name }
        this.favoriteLists = [...(this.favoriteLists || []), formattedList]
        this.selectedListId = formattedList.id
        this.selectedListName = formattedList.name
        this.newListName = ''
        await this.fetchFavoriteRestaurants()
      }
    },
    async deleteList() {
      if (!this.selectedListId) return
      const confirmDelete = confirm(`Are you sure you want to delete "${this.selectedListName}"?`)
      if (!confirmDelete) return

      const success = await deleteFavoriteList(this.selectedListId)
      if (success) {
        this.favoriteLists = this.favoriteLists.filter((list) => list.id !== this.selectedListId)
        if (this.favoriteLists.length > 0) {
          this.selectedListId = this.favoriteLists[0].id
          this.selectedListName = this.favoriteLists[0].name
        } else {
          this.selectedListId = null
          this.selectedListName = ''
        }
        this.favoriteRestaurants = []
      } else {
        alert('Failed to delete the list. Please try again.')
      }
    },
    updateSelectedList() {
      const selectedList = this.favoriteLists.find((list) => list.id === this.selectedListId)
      if (selectedList) {
        this.selectedListName = selectedList.name
      }
      this.fetchFavoriteRestaurants()
    },
    async fetchFavoriteRestaurants() {
      localStorage.setItem('selectedFavoriteListId', this.selectedListId)

      try {
        let favoriteList = await getFavoriteRestaurants(this.selectedListId)
        this.favoriteRestaurants = []
        for (const restaurant of favoriteList) {
          try {
            const details = await getRestaurantById(restaurant.id)
            if (details) this.favoriteRestaurants.push(details)
          } catch (error) {
            console.error(`Error fetching details for ${restaurant.id}:`, error)
          }
        }
      } catch (error) {
        console.error('Error fetching favorite restaurants:', error)
        this.favoriteRestaurants = []
      }
    },
    updateListName(newName) {
      const list = this.favoriteLists.find((list) => list.id === this.selectedListId)
      if (list) {
        list.name = newName
      }
      this.selectedListName = newName
      this.showModal = false
    },
    closeModal() {
      this.showModal = false
    },
    handleFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.currentPage = 0
    },
    changePage(page) {
      if (page < 0 || page > this.totalPages) return
      this.currentPage = page
    },
  },
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.favorites-page {
  display: flex;
  flex-direction: column;
  width: 90%;
}

.create-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.create-container {
  display: flex;
  align-items: center;
  margin-left: 3px;
  gap: 10px;
}

h2 {
  margin: 5px;
}

.button,
.delete-btn {
  height: 37px;
  width: 37px;
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
  transition: background 0.3s ease-in-out;
  background-color: #1a519f;
}

.button:hover,
.delete-btn:hover,
.delete-btn,
button {
  background-color: #609fed;
}

.icon {
  transition: transform 0.3s ease-in-out;
}

.icon:hover {
  transform: scale(1.2);
}

input {
  padding: 8px;
  border: none;
  border-radius: 8px;
  width: 300px;
  height: 21px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.list-selection {
  display: flex;
  align-items: center;
  margin-left: 3px;
  gap: 10px;
}

.delete-btn {
  background-color: #d15583;
}

select {
  padding: 8px;
  border-radius: 8px;
  border: none;
  width: 300px;
  height: 37px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 8px;
  border-bottom: 1px solid #ddd;
}

.restaurants {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;
}

@media screen and (max-width: 900px) {
  .container {
    flex-direction: column;
    align-items: center;
  }

  select {
    width: 200px;
  }

  input {
    width: 200px;
  }
}
</style>
